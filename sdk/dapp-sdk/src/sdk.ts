// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    DiscoveryClient,
    type ProviderAdapter,
    type WalletPickerEntry,
    type WalletPickerFn,
} from '@canton-network/core-wallet-discovery'
import {
    notifyWalletPickerConnected,
    notifyWalletPickerError,
    pickWallet,
    waitForWalletPickerRetrySelection,
} from '@canton-network/core-wallet-ui-components'
import type {
    EventListener,
    Provider,
} from '@canton-network/core-splice-provider'
import type {
    StatusEvent,
    ConnectResult,
    PrepareExecuteParams,
    PrepareExecuteAndWaitResult,
    LedgerApiParams,
    LedgerApiResult,
    ListAccountsResult,
    AccountsChangedEvent,
    TxChangedEvent,
    RpcTypes as DappRpcTypes,
    MessageSignatureEvent,
    SignMessageParams,
    SignMessageResult,
} from '@canton-network/core-wallet-dapp-rpc-client'
import { DappClient } from './client'
import { ExtensionAdapter } from './adapter/extension-adapter'
import {
    RemoteAdapter,
    type RemoteAdapterConfig,
} from './adapter/remote-adapter'
import * as storage from './storage'
import { clearAllLocalState } from './util'
import defaultGatewayList from './gateways.json'
import defaultExtensionsList from './wallets.json'
import { CANTON_LOGO_PNG } from './assets'
import { requestAnnouncedProviders } from './announce-discovery'

/**
 * Options for `DappSDK.init` / the module-level {@link init}.
 *
 * @group Configuration
 */
export interface DappSDKConnectOptions<
    TDefaultAdapter extends ProviderAdapter = ProviderAdapter,
> {
    /**
     * Replaces the default list of remote wallets.
     * Pass `[]` to register none.
     */
    defaultAdapters?: TDefaultAdapter[]
    /**
     * Extra adapters to register alongside the defaults
     * (or alongside `defaultAdapters` when that is set).
     */
    additionalAdapters?: ProviderAdapter[] | undefined
    /**
     * When `true` (default), suggested browser-extension wallets are shown
     * in the wallet picker.
     */
    enableSuggestedWallets?: boolean
}

function defaultTrue(b: boolean | undefined): boolean {
    return b === undefined ? true : b
}

function normalizeConnectOptions(
    options: DappSDKConnectOptions
): DappSDKConnectOptions {
    return {
        defaultAdapters:
            options.defaultAdapters === undefined
                ? createDefaultAdapters(defaultGatewayList)
                : options.defaultAdapters,
        additionalAdapters: options.additionalAdapters,
        enableSuggestedWallets: defaultTrue(options.enableSuggestedWallets),
    }
}

/**
 * DappSDK ties together DiscoveryClient + DappClient and serves as the
 * primary SDK entrypoint for dApp developers.
 *
 * A default singleton instance is exported as {@link sdk}, and module-level
 * functions delegate to that singleton for convenience
 * (e.g. `connect()`, `status()`).
 *
 * @group SDK
 */
export class DappSDK {
    private readonly RECENT_GATEWAYS_KEY = 'splice_wallet_picker_recent'
    private readonly walletPicker: WalletPickerFn
    private discovery: DiscoveryClient | null = null
    private client: DappClient | null = null
    private initPromise: Promise<unknown> | null = null
    private dynamicAdapterIds = new Set<string>()
    private configuredAdapters: DappSDKConnectOptions | undefined

    constructor(options?: { walletPicker?: WalletPickerFn | undefined }) {
        this.walletPicker =
            options?.walletPicker ?? (pickWallet as WalletPickerFn)
    }

    private async registerAdapters(
        discovery: DiscoveryClient,
        adapters?: ProviderAdapter[] | undefined
    ): Promise<void> {
        if (!adapters?.length) return

        const existingIds = new Set(
            discovery.listAdapters().map((a) => a.providerId as string)
        )
        for (const adapter of adapters) {
            const id = adapter.providerId as string
            if (existingIds.has(id)) continue
            if (await adapter.detect()) {
                discovery.registerAdapter(adapter)
                existingIds.add(id)
            }
        }
    }

    private async registerAnnouncedAdapters(
        discovery: DiscoveryClient
    ): Promise<void> {
        const existingIds = new Set(
            discovery.listAdapters().map((a) => a.providerId as string)
        )

        const announced = await requestAnnouncedProviders()
        for (const item of announced) {
            const id = `browser:ext:${item.id}`
            if (existingIds.has(id)) continue

            const adapter = new ExtensionAdapter({
                providerId: id as never,
                name: item.name,
                icon: item.icon,
                description: 'Connect via a browser extension wallet',
                target: item.target ?? item.id,
            })
            if (await adapter.detect()) {
                discovery.registerAdapter(adapter)
                existingIds.add(id)
            }
        }
    }

    private async ensureDiscovery(
        config?: DappSDKConnectOptions
    ): Promise<DiscoveryClient> {
        const initAdapters = this.getInitAdapters(config)

        if (!this.discovery) {
            const detectedAdapters =
                await this.collectDetectedAdapters(initAdapters)
            this.discovery = await DiscoveryClient.create({
                walletPicker: this.walletPicker,
                adapters: detectedAdapters,
            })
        } else {
            await this.registerAdapters(this.discovery, initAdapters)
        }

        // Extensions can announce after initial create().
        await this.registerAnnouncedAdapters(this.discovery)

        await this.discovery.restorePersistedSessionIfNeeded()

        if (!this.client) {
            const session = this.discovery.getActiveSession()
            if (session) {
                const providerType = session.adapter.getInfo().type
                const target =
                    session.adapter instanceof ExtensionAdapter
                        ? session.adapter.target
                        : undefined
                this.client = new DappClient(session.provider, {
                    providerType,
                    target,
                })
            }
        }

        return this.discovery
    }

    private getInitAdapters(config?: DappSDKConnectOptions): ProviderAdapter[] {
        if (config) {
            const normalized = normalizeConnectOptions(config)
            return [
                ...(normalized.defaultAdapters ?? []),
                ...(normalized.additionalAdapters ?? []),
            ]
        }

        const kernelDiscovery = storage.getKernelDiscovery()
        if (kernelDiscovery?.walletType === 'remote' && kernelDiscovery.url) {
            return [
                new RemoteAdapter({
                    name: kernelDiscovery.url,
                    rpcUrl: kernelDiscovery.url,
                }),
            ]
        }

        // No config + nothing to restore => default gateways.
        return createDefaultAdapters(defaultGatewayList)
    }

    private async collectDetectedAdapters(
        adapters: ProviderAdapter[]
    ): Promise<ProviderAdapter[]> {
        const detected: ProviderAdapter[] = []
        for (const adapter of adapters) {
            if (await adapter.detect()) {
                detected.push(adapter)
            }
        }
        return detected
    }

    private saveRecentGateway(name: string, rpcUrl: string): void {
        try {
            const raw = localStorage.getItem(this.RECENT_GATEWAYS_KEY)
            const recent: { name: string; rpcUrl: string }[] = raw
                ? JSON.parse(raw)
                : []
            const filtered = recent.filter((r) => r.rpcUrl !== rpcUrl)
            filtered.unshift({ name, rpcUrl })
            localStorage.setItem(
                this.RECENT_GATEWAYS_KEY,
                JSON.stringify(filtered.slice(0, 5))
            )
        } catch {
            // best-effort
        }
    }

    private getHttpStatusCode(error: unknown): number | undefined {
        const asNumber = (value: unknown): number | undefined =>
            typeof value === 'number' ? value : undefined

        if (typeof error !== 'object' || error === null) return undefined

        const obj = error as Record<string, unknown>
        const response = obj.response as Record<string, unknown> | undefined
        const cause = obj.cause as Record<string, unknown> | undefined

        return (
            asNumber(obj.status) ??
            asNumber(obj.statusCode) ??
            asNumber(response?.status) ??
            asNumber(cause?.status) ??
            asNumber(cause?.statusCode)
        )
    }

    private formatConnectionErrorMessage(error: unknown): string {
        const fallbackMessage = 'Failed to connect wallet'
        const baseMessage =
            error instanceof Error && error.message.trim().length > 0
                ? error.message
                : fallbackMessage

        const statusCode = this.getHttpStatusCode(error)
        if (!statusCode) return baseMessage

        const lowerMessage = baseMessage.toLowerCase()
        if (
            lowerMessage.includes(`http ${statusCode}`) ||
            lowerMessage.includes(`status ${statusCode}`)
        ) {
            return baseMessage
        }

        return `${baseMessage} (HTTP ${statusCode})`
    }

    private requireClient(): DappClient {
        if (!this.client)
            throw new Error('Not connected — call connect() first')
        return this.client
    }

    /**
     * Returns the raw CIP-103 provider for the active discovery session, or `null`
     * if not connected.
     *
     * Use it for direct `provider.request(...)` calls or provider-level events.
     *
     * @group Provider access
     */
    getConnectedProvider(): Provider<DappRpcTypes> | null {
        const session = this.discovery?.getActiveSession()
        if (!session) return null
        return session.provider
    }

    /**
     * Registers wallet adapters and silently restores a previous session **without**
     * opening the wallet picker.
     *
     * Call once, early in the app lifecycle. Concurrent callers share the same
     * in-flight promise.
     *
     * @param options - Adapter and wallet-picker configuration.
     * @group Lifecycle
     */
    async init(options?: DappSDKConnectOptions): Promise<void> {
        // Register adapters and store them in the SDK instance.
        if (options) {
            this.configuredAdapters = normalizeConnectOptions(options)
        }

        const enableSuggestedWallets = defaultTrue(
            this.configuredAdapters?.enableSuggestedWallets
        )

        if (enableSuggestedWallets) {
            // Enable suggested wallets logic here
            localStorage.setItem(
                'splice_wallet_picker_suggested_entries',
                JSON.stringify(defaultExtensionsList)
            )
        } else {
            localStorage.removeItem('splice_wallet_picker_suggested_entries')
        }

        // Create discovery and attempt restore.
        // If init() is called again *with options*, make sure those adapters
        // are registered even if discovery was already created by an earlier call
        // (e.g. status() on cold start). Serialize behind the existing initPromise
        // to avoid concurrent discovery mutations.
        this.initPromise = this.initPromise
            ? this.initPromise.then(() =>
                  this.ensureDiscovery(this.configuredAdapters)
              )
            : this.ensureDiscovery(this.configuredAdapters)
        await this.initPromise
    }

    /**
     * Opens the wallet picker and establishes a connection, running the
     * authentication flow if needed.
     *
     * Prefer calling `DappSDK.init` with adapters at startup. Passing
     * `options` here remains supported for older call sites; it is equivalent
     * to `init(options)` then `connect()`.
     *
     * @returns Whether the connection succeeded, plus network connectivity hints.
     * @group Lifecycle
     */
    async connect(): Promise<ConnectResult>
    /**
     * @deprecated Pass options to `DappSDK.init` instead.
     * @group Lifecycle
     */
    async connect(options: DappSDKConnectOptions): Promise<ConnectResult>
    async connect(options?: DappSDKConnectOptions): Promise<ConnectResult> {
        // Prefer init({ ... }) once at startup. Passing options here remains supported
        // for older call sites; it is equivalent to init(options) then connect().
        if (options) {
            await this.init(options)
        } else {
            await this.init()
        }

        const discovery = this.discovery!
        await this.registerAnnouncedAdapters(discovery)

        clearAllLocalState()

        // Build entries from registered (non-dynamic) adapters
        const entries: WalletPickerEntry[] = discovery
            .listAdapters()
            .filter((a) => !this.dynamicAdapterIds.has(a.providerId as string))
            .map((a) => {
                const info = a.getInfo()
                return {
                    providerId: info.providerId as string,
                    name: info.name,
                    type: info.type,
                    description: info.description,
                    icon: info.icon,
                    url: info.url,
                    reuseGlobalWalletPopup: info.reuseGlobalWalletPopup,
                }
            })

        const initialSelection = await this.walletPicker(entries)
        const connectionAttempts = new EventTarget()

        return new Promise<ConnectResult>((resolve, reject) => {
            const cleanup = () => {
                connectionAttempts.removeEventListener('attempt', onAttempt)
            }

            const onAttempt = async (event: Event): Promise<void> => {
                const picked = (event as CustomEvent<WalletPickerEntry>).detail
                let targetId = picked.providerId

                // Register a dynamic adapter for custom gateway URLs
                if (picked.type === 'remote' && picked.url) {
                    const existing = discovery
                        .listAdapters()
                        .find((a) => a.providerId === targetId)
                    if (!existing) {
                        const adapter = new RemoteAdapter({
                            name: picked.name,
                            rpcUrl: picked.url,
                        })
                        discovery.registerAdapter(adapter)
                        this.dynamicAdapterIds.add(adapter.providerId as string)
                        targetId = adapter.providerId
                    }
                }

                try {
                    // creates provider based on the adapter
                    // provider stores (and reads from storage) the session token and the access token
                    await discovery.connect(targetId)

                    const session = discovery.getActiveSession()
                    if (!session) {
                        throw new Error(
                            'Connection succeeded but no active session'
                        )
                    }

                    const info = session.adapter.getInfo()

                    this.client = new DappClient(session.provider, {
                        providerType: info.type,
                        target:
                            session.adapter instanceof ExtensionAdapter
                                ? session.adapter.target
                                : undefined,
                    })
                    const s = await this.client.status()

                    if (s.connection.isConnected) {
                        if (info.type === 'remote' && info.url) {
                            storage.setKernelDiscovery({
                                walletType: 'remote',
                                url: info.url,
                            })
                            this.saveRecentGateway(info.name, info.url)
                        } else if (info.type === 'browser') {
                            storage.setKernelDiscovery({
                                walletType: 'extension',
                                providerId: info.providerId as string,
                            })
                        }
                    }

                    notifyWalletPickerConnected(info.reuseGlobalWalletPopup)
                    cleanup()
                    resolve(s.connection)
                } catch (error) {
                    const message = this.formatConnectionErrorMessage(error)
                    notifyWalletPickerError(message)

                    this.client = null

                    try {
                        const retrySelection =
                            await waitForWalletPickerRetrySelection()
                        connectionAttempts.dispatchEvent(
                            new CustomEvent<WalletPickerEntry>('attempt', {
                                detail: retrySelection,
                            })
                        )
                    } catch (retryError) {
                        cleanup()
                        reject(retryError)
                    }
                }
            }

            connectionAttempts.addEventListener('attempt', onAttempt)
            connectionAttempts.dispatchEvent(
                new CustomEvent<WalletPickerEntry>('attempt', {
                    detail: initialSelection,
                })
            )
        })
    }

    /**
     * Ends the session between the dApp and the wallet.
     *
     * @group Lifecycle
     */
    async disconnect(): Promise<null> {
        // This may result in double call to dapp-api with method `disconnect` and double event `statusChanged`
        if (this.client) {
            await this.client.disconnect()
            this.client = null
        }
        if (this.discovery) {
            try {
                await this.discovery.disconnect()
            } catch {
                // already cleaned up via DappClient.disconnect()
            }
        }
        return null
    }

    /**
     * Returns whether the user is connected **without** triggering the login flow.
     * Safe to call on page load.
     *
     * @group Status
     */
    async isConnected(): Promise<ConnectResult> {
        if (this.client) {
            return this.client.isConnected()
        }
        return {
            isConnected: false,
            isNetworkConnected: false,
            reason: 'Unauthenticated',
            networkReason: 'Unauthenticated',
        }
    }

    /**
     * Returns network- and session-related information for the current connection.
     *
     * Restores a persisted session on cold start when possible.
     *
     * @group Status
     */
    async status(): Promise<StatusEvent> {
        // Same cold-start as connect: restore session (if any) so requireClient() works.
        await this.init()
        return this.requireClient().status()
    }

    /**
     * Returns all parties the user has access to.
     *
     * @group Accounts
     */
    async listAccounts(): Promise<ListAccountsResult> {
        return this.requireClient().listAccounts()
    }

    /**
     * Prepares, requests signature for, and executes a Daml transaction.
     * Completes when the request is accepted by the wallet (not when the
     * ledger finishes executing). Prefer `DappSDK.prepareExecuteAndWait`
     * when you need the execution result.
     *
     * @param params - The Daml commands (and optional metadata) to execute.
     * @group Signing & transactions
     */
    async prepareExecute(params: PrepareExecuteParams): Promise<null> {
        return this.requireClient().prepareExecute(params)
    }

    /**
     * Like `DappSDK.prepareExecute`, but waits until the transaction is
     * executed (or fails) and returns the result.
     *
     * @param params - The Daml commands (and optional metadata) to execute.
     * @group Signing & transactions
     */
    async prepareExecuteAndWait(
        params: PrepareExecuteParams
    ): Promise<PrepareExecuteAndWaitResult> {
        return this.requireClient().prepareExecuteAndWait(params)
    }

    /**
     * Signs an arbitrary message with the connected wallet.
     *
     * @param params - The message (and optional party) to sign.
     * @group Signing & transactions
     */
    async signMessage(params: SignMessageParams): Promise<SignMessageResult> {
        return this.requireClient().signMessage(params)
    }

    /**
     * Proxies an authenticated request to the Canton JSON Ledger API.
     *
     * @param params - HTTP method, Ledger API path, and optional body/query.
     * @group Signing & transactions
     */
    async ledgerApi(params: LedgerApiParams): Promise<LedgerApiResult> {
        return this.requireClient().ledgerApi(params)
    }

    /**
     * Opens the connected wallet's user UI (for example the gateway user portal).
     *
     * @group Lifecycle
     */
    async open(): Promise<void> {
        return this.requireClient().open()
    }

    /**
     * Subscribes to connection status / session changes.
     *
     * @group Events
     */
    async onStatusChanged(listener: EventListener<StatusEvent>): Promise<void> {
        this.requireClient().onStatusChanged(listener)
    }

    /**
     * Subscribes to account list changes (added, removed, or primary changed).
     *
     * @group Events
     */
    async onAccountsChanged(
        listener: EventListener<AccountsChangedEvent>
    ): Promise<void> {
        this.requireClient().onAccountsChanged(listener)
    }

    /**
     * Subscribes to successful connection events.
     *
     * @group Events
     */
    async onConnected(listener: EventListener<StatusEvent>): Promise<void> {
        this.requireClient().onConnected(listener)
    }

    /**
     * Subscribes to transaction lifecycle updates for submissions started via
     * `DappSDK.prepareExecute`.
     *
     * @group Events
     */
    async onTxChanged(listener: EventListener<TxChangedEvent>): Promise<void> {
        this.requireClient().onTxChanged(listener)
    }

    /**
     * Subscribes to message-signature lifecycle updates for
     * `DappSDK.signMessage`.
     *
     * @group Events
     */
    async onMessageSignature(
        listener: EventListener<MessageSignatureEvent>
    ): Promise<void> {
        this.requireClient().onMessageSignature(listener)
    }

    /**
     * Removes a listener previously registered with `DappSDK.onStatusChanged`.
     *
     * @group Events
     */
    async removeOnStatusChanged(
        listener: EventListener<StatusEvent>
    ): Promise<void> {
        if (!this.client) return
        this.client.removeOnStatusChanged(listener)
    }

    /**
     * Removes a listener previously registered with `DappSDK.onAccountsChanged`.
     *
     * @group Events
     */
    async removeOnAccountsChanged(
        listener: EventListener<AccountsChangedEvent>
    ): Promise<void> {
        if (!this.client) return
        this.client.removeOnAccountsChanged(listener)
    }

    /**
     * Removes a listener previously registered with `DappSDK.onConnected`.
     *
     * @group Events
     */
    async removeOnConnected(
        listener: EventListener<StatusEvent>
    ): Promise<void> {
        if (!this.client) return
        this.client.removeOnConnected(listener)
    }

    /**
     * Removes a listener previously registered with `DappSDK.onTxChanged`.
     *
     * @group Events
     */
    async removeOnTxChanged(
        listener: EventListener<TxChangedEvent>
    ): Promise<void> {
        if (!this.client) return
        this.client.removeOnTxChanged(listener)
    }

    /**
     * Removes a listener previously registered with `DappSDK.onMessageSignature`.
     *
     * @group Events
     */
    async removeOnMessageSignature(
        listener: EventListener<MessageSignatureEvent>
    ): Promise<void> {
        if (!this.client) return
        this.client.removeOnMessageSignature(listener)
    }
}

/** Default singleton `DappSDK` used by the module-level helpers below. */
export const sdk = new DappSDK()

/**
 * Opens the wallet picker and connects.
 *
 * Prefer {@link init} with adapters at startup; `options` here is a legacy
 * convenience that forwards to `DappSDK.init`.
 *
 * @group Lifecycle
 */
export function connect(): Promise<ConnectResult>
/**
 * @deprecated Pass options to {@link init} instead.
 * @group Lifecycle
 */
export function connect(options: DappSDKConnectOptions): Promise<ConnectResult>
export function connect(
    options?: DappSDKConnectOptions
): Promise<ConnectResult> {
    // TODO we probably shouldn't add logic in the convenience exported methods
    //  that would not execute if called through sdk.connect
    if (options) {
        return sdk.init(options).then(() => sdk.connect())
    }
    return sdk.connect()
}

/**
 * Registers wallet adapters and silently restores a previous session **without**
 * opening the wallet picker. Delegates to `DappSDK.init`.
 *
 * @param options - Adapter and wallet-picker configuration.
 * @group Lifecycle
 */
export const init = (options?: DappSDKConnectOptions): Promise<void> =>
    sdk.init(options)

/**
 * Ends the session between the dApp and the wallet. Delegates to `DappSDK.disconnect`.
 *
 * @group Lifecycle
 */
export const disconnect = (): Promise<null> => sdk.disconnect()

/**
 * Returns whether the user is connected **without** triggering the login flow.
 * Delegates to `DappSDK.isConnected`.
 *
 * @group Status
 */
export const isConnected = (): Promise<ConnectResult> => sdk.isConnected()

/**
 * Returns network- and session-related information for the current connection.
 * Delegates to `DappSDK.status`.
 *
 * @group Status
 */
export const status = (): Promise<StatusEvent> => sdk.status()

/**
 * Returns all parties the user has access to. Delegates to `DappSDK.listAccounts`.
 *
 * @group Accounts
 */
export const listAccounts = (): Promise<ListAccountsResult> =>
    sdk.listAccounts()

/**
 * Prepares, requests signature for, and executes a Daml transaction.
 * Delegates to `DappSDK.prepareExecute`.
 *
 * @param params - The Daml commands (and optional metadata) to execute.
 * @group Signing & transactions
 */
export const prepareExecute = (params: PrepareExecuteParams): Promise<null> =>
    sdk.prepareExecute(params)

/**
 * Like {@link prepareExecute}, but waits for execution and returns the result.
 * Delegates to `DappSDK.prepareExecuteAndWait`.
 *
 * @param params - The Daml commands (and optional metadata) to execute.
 * @group Signing & transactions
 */
export const prepareExecuteAndWait = (
    params: PrepareExecuteParams
): Promise<PrepareExecuteAndWaitResult> => sdk.prepareExecuteAndWait(params)

/**
 * Proxies an authenticated request to the Canton JSON Ledger API.
 * Delegates to `DappSDK.ledgerApi`.
 *
 * @param params - HTTP method, Ledger API path, and optional body/query.
 * @group Signing & transactions
 */
export const ledgerApi = (params: LedgerApiParams): Promise<LedgerApiResult> =>
    sdk.ledgerApi(params)

/**
 * Opens the connected wallet's user UI. Delegates to `DappSDK.open`.
 *
 * @group Lifecycle
 */
export const open = (): Promise<void> => sdk.open()

/**
 * Returns the raw CIP-103 provider for the active session, or `null`.
 * Delegates to `DappSDK.getConnectedProvider`.
 *
 * @group Provider access
 */
export const getConnectedProvider = (): ReturnType<
    DappSDK['getConnectedProvider']
> => sdk.getConnectedProvider()

/**
 * Subscribes to connection status / session changes.
 * Delegates to `DappSDK.onStatusChanged`.
 *
 * @group Events
 */
export const onStatusChanged = (
    listener: EventListener<StatusEvent>
): Promise<void> => sdk.onStatusChanged(listener)

/**
 * Subscribes to account list changes.
 * Delegates to `DappSDK.onAccountsChanged`.
 *
 * @group Events
 */
export const onAccountsChanged = (
    listener: EventListener<AccountsChangedEvent>
): Promise<void> => sdk.onAccountsChanged(listener)

/**
 * Subscribes to successful connection events.
 * Delegates to `DappSDK.onConnected`.
 *
 * @group Events
 */
export const onConnected = (
    listener: EventListener<StatusEvent>
): Promise<void> => sdk.onConnected(listener)

/**
 * Subscribes to transaction lifecycle updates.
 * Delegates to `DappSDK.onTxChanged`.
 *
 * @group Events
 */
export const onTxChanged = (
    listener: EventListener<TxChangedEvent>
): Promise<void> => sdk.onTxChanged(listener)

/**
 * Subscribes to message-signature lifecycle updates.
 * Delegates to `DappSDK.onMessageSignature`.
 *
 * @group Events
 */
export const onMessageSignature = (
    listener: EventListener<MessageSignatureEvent>
): Promise<void> => sdk.onMessageSignature(listener)

/**
 * Removes a listener registered with {@link onStatusChanged}.
 *
 * @group Events
 */
export const removeOnStatusChanged = (
    listener: EventListener<StatusEvent>
): Promise<void> => sdk.removeOnStatusChanged(listener)

/**
 * Removes a listener registered with {@link onAccountsChanged}.
 *
 * @group Events
 */
export const removeOnAccountsChanged = (
    listener: EventListener<AccountsChangedEvent>
): Promise<void> => sdk.removeOnAccountsChanged(listener)

/**
 * Removes a listener registered with {@link onConnected}.
 *
 * @group Events
 */
export const removeOnConnected = (
    listener: EventListener<StatusEvent>
): Promise<void> => sdk.removeOnConnected(listener)

/**
 * Removes a listener registered with {@link onTxChanged}.
 *
 * @group Events
 */
export const removeOnTxChanged = (
    listener: EventListener<TxChangedEvent>
): Promise<void> => sdk.removeOnTxChanged(listener)

/**
 * Removes a listener registered with {@link onMessageSignature}.
 *
 * @group Events
 */
export const removeOnMessageSignature = (
    listener: EventListener<MessageSignatureEvent>
): Promise<void> => sdk.removeOnMessageSignature(listener)

function createDefaultAdapters(
    defaultGatewayConfigs: RemoteAdapterConfig[]
): ProviderAdapter[] {
    return defaultGatewayConfigs.map(
        (config) =>
            new RemoteAdapter({
                ...config,
                icon: config.icon ?? CANTON_LOGO_PNG,
            } satisfies RemoteAdapterConfig)
    )
}
