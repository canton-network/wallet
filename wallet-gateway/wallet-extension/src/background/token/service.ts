// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { rpcErrors } from '@canton-network/core-rpc-errors'
import type { PartyId } from '@canton-network/core-types'
import type { AuthContext } from '@canton-network/core-wallet-auth'
import {
    type CurrentNetworkWalletFilter,
    hashAccessToken,
    type Network,
    type Transaction,
} from '@canton-network/core-wallet-store'
import {
    type CreateTransferParams,
    type RegistryInstrument,
    resolveTransferVersion,
    type TransferChoiceParams,
} from '@canton-network/core-wallet-ui-components/react/token'
import type { AssetBody, PreparedCommand } from '@canton-network/wallet-sdk'
import { storage } from 'wxt/utils/storage'

import { EXTENSION_ORIGIN } from '@/shared/auth-protocol.ts'
import { notSubmittedError } from '@/shared/transfer-errors.ts'

import type { AuthContextStore } from '../auth-context.ts'
import type { PrepareExecuteParams } from '../controllers/dapp/rpc-gen/typings.ts'
import type { TransactionSubmitter } from '../controllers/user/transactions.ts'
import type { ExtensionStore, WalletStore } from '../store/index.ts'
import type { RegistryStore } from '../store/registries.ts'
import { prepareTransaction } from '../transactions/prepare.ts'
import { actingParty, submitTransaction } from '../transactions/submit.ts'
import { TX_APPROVAL_TIMEOUT_MS } from '../tx-approval.ts'
import { registryInstruments } from './instruments.ts'
import type { TokenSdk, TokenSdkConfig } from './sdk.ts'

/** The SDK's holdings parameters, without `continueUntilCompletion`. */
export type ListHoldingsParams = {
    partyId: PartyId
    includeLocked?: boolean
    limit?: number
    offset?: number
}

type Holdings<V extends 'v1' | 'v2'> = Awaited<
    ReturnType<TokenSdk['token'][V]['utxos']['list']>
>

type PendingTransfers<V extends 'v1' | 'v2'> = Awaited<
    ReturnType<TokenSdk['token'][V]['transfer']['pending']>
>

/** A transfer prepared on the ledger and stored, waiting for the user. */
export interface PreparedTransfer {
    transactionId: string
    commandId: string
    preparedTransaction: string
    preparedTransactionHash: string
    /** An ISO 8601 date. */
    createdAt: string
    partyId: PartyId
}

/**
 * How long a prepared transfer waits for the user, as long as a dApp's
 * transaction does.
 */
const REVIEW_TIMEOUT_MS = TX_APPROVAL_TIMEOUT_MS

// The network a review was prepared on, by transaction id. The row can't
// hold it: core rewrites the row on each status change without its
// `networkId`, and sends the payload to the ledger. Session storage
// outlives a worker restart.
const reviewNetworkKey = (transactionId: string) =>
    `session:reviewNetwork:${transactionId}` as const

const reviewNetworks = {
    get: (transactionId: string) =>
        storage.getItem<string>(reviewNetworkKey(transactionId)),
    set: (transactionId: string, networkId: string) =>
        storage.setItem(reviewNetworkKey(transactionId), networkId),
    // A record left behind only refers to a removed row.
    forget: (transactionId: string) =>
        storage.removeItem(reviewNetworkKey(transactionId)).catch(() => {}),
}

/**
 * The token API for the extension pages, with the SDK's nesting. The SDK
 * itself stays in the background: it also has the ledger, party and keys
 * APIs, and holds the user's token.
 */
export type TokenService = {
    token: {
        /** The instruments of the current network's registries. */
        instruments(): Promise<RegistryInstrument[]>
        /**
         * The extension page's review is the approval, so no prompt opens.
         * The writes reject with an `Error`. Only an error that
         * `isNotSubmitted` accepts means the transaction can't have
         * executed.
         */
        transfer: {
            /** Prepares the transfer for the page's review, before signing. */
            prepare(params: CreateTransferParams): Promise<PreparedTransfer>
            /**
             * Signs and executes the prepared transfer, and resolves once
             * executed. Safe to repeat: a signed one is executed again
             * without signing, an executed one resolves.
             */
            submit(transactionId: string): Promise<void>
            /** Removes the prepared transfer, unless it is signed or being submitted. */
            discard(transactionId: string): Promise<void>
            /**
             * The choices prepare, sign and execute in one call. v2 acts as
             * `partyId` alone; `actors` is ignored.
             */
            withdraw(params: TransferChoiceParams): Promise<void>
            accept(params: TransferChoiceParams): Promise<void>
            reject(params: TransferChoiceParams): Promise<void>
        }
        v1: {
            utxos: {
                list(params: ListHoldingsParams): Promise<Holdings<'v1'>>
            }
            transfer: {
                pending(partyId: PartyId): Promise<PendingTransfers<'v1'>>
            }
        }
        v2: {
            utxos: {
                list(params: ListHoldingsParams): Promise<Holdings<'v2'>>
            }
            transfer: {
                pending(partyId: PartyId): Promise<PendingTransfers<'v2'>>
            }
        }
    }
}

export interface TokenServiceDeps {
    authContext: Pick<AuthContextStore, 'load'>
    /** The wallet store, not yet scoped to a user. */
    getStore: () => Promise<WalletStore>
    registries: RegistryStore
    /** `createTokenSdk`. Tests pass a fake. */
    createSdk: (config: TokenSdkConfig) => Promise<TokenSdk>
    submitter: Pick<TransactionSubmitter, 'sign' | 'execute'>
}

/**
 * Every method needs a signed-in user and builds the SDK for the current
 * network. A method that takes a `partyId` only accepts the user's wallets.
 */
interface SignedIn {
    context: AuthContext
    store: ExtensionStore
}

/** A signed-in user whose write runs in the extension's session. */
interface Writer extends SignedIn {
    sessionId: string
    network: Network
}

// Messaging sends a rejection that is no `Error` as `{}`, and the page's
// promise resolves with it, as if the transfer had executed. The ledger
// rejects with its JSON error, `{ code, cause }`.
function toError(cause: unknown): Error {
    if (cause instanceof Error) return cause
    if (typeof cause === 'string' && cause !== '') return new Error(cause)
    const { code, cause: reason } = (cause ?? {}) as {
        code?: unknown
        cause?: unknown
    }
    if (typeof reason === 'string' && reason !== '') {
        return new Error(
            typeof code === 'string' ? `${code}: ${reason}` : reason
        )
    }
    return new Error('The transfer failed without an error message')
}

/**
 * `store`, kept on `network`. The store takes the network from the first
 * session with the user's token, and a reconnect moves a session to the
 * end, so it can change while a write runs.
 */
function onNetwork(store: ExtensionStore, network: Network): ExtensionStore {
    const wallets = (filter?: CurrentNetworkWalletFilter) =>
        store.getAllWallets({ ...filter, networkIds: [network.id] })
    const pinned: Partial<ExtensionStore> = {
        getCurrentNetwork: async () => network,
        getWallets: wallets,
        getWallet: async (partyId) =>
            (await wallets()).find((wallet) => wallet.partyId === partyId) ??
            null,
        getPrimaryWallet: async () =>
            (await wallets()).find((wallet) => wallet.primary),
    }
    return new Proxy(store, {
        get(target, key) {
            if (Object.hasOwn(pinned, key)) {
                return pinned[key as keyof ExtensionStore]
            }
            const value: unknown = Reflect.get(target, key, target)
            return typeof value === 'function' ? value.bind(target) : value
        },
    })
}

function unknownOutcome(reason: string): Error {
    return rpcErrors.internal({
        message: `The outcome of the transaction is unknown: ${reason}`,
    })
}

/** Runs a step before signing: if it fails, nothing can have executed. */
async function beforeSigning<T>(step: () => Promise<T>): Promise<T> {
    try {
        return await step()
    } catch (cause) {
        throw notSubmittedError(toError(cause).message)
    }
}

export function createTokenService({
    authContext,
    getStore,
    registries,
    createSdk,
    submitter,
}: TokenServiceDeps): TokenService {
    // The transactions a `submit` is signing or executing, or a cleanup is
    // removing. A worker stop ends those calls too, so a set lost with the
    // worker leaves none of them unprotected.
    const claims = new Set<string>()

    /** Removes the review unless another call holds it. */
    async function removeUnclaimed(
        store: ExtensionStore,
        transactionId: string
    ): Promise<void> {
        if (claims.has(transactionId)) return
        claims.add(transactionId)
        try {
            await removeReview(store, transactionId)
        } finally {
            claims.delete(transactionId)
        }
    }

    /**
     * The SDK for `user` and its current network. Callers load the user once
     * and pass it, so a sign-in that happens meanwhile can't mix one user's
     * ownership check with another user's token.
     */
    async function sdkFor({ context, store }: SignedIn): Promise<TokenSdk> {
        return sdkOn(await store.getCurrentNetwork(), context)
    }

    async function sdkOn(
        network: Network,
        context: AuthContext
    ): Promise<TokenSdk> {
        return createSdk({
            network,
            accessToken: context.accessToken,
            registries: await registries.forNetwork(network.id),
        })
    }

    /**
     * Throws unless `partyId` is one of the user's wallets. Messaging
     * doesn't check types, so a missing or non-string `partyId` is rejected
     * here.
     */
    async function assertOwner(
        { store }: SignedIn,
        partyId: unknown
    ): Promise<void> {
        if (typeof partyId !== 'string' || partyId === '') {
            throw new Error('A partyId is required')
        }
        const wallets = await store.getWallets()
        if (!wallets.some((wallet) => wallet.partyId === partyId)) {
            throw new Error(`Party ${partyId} does not belong to user`)
        }
    }

    async function ownerOf(partyId: unknown): Promise<SignedIn> {
        const user = await signedIn()
        await assertOwner(user, partyId)
        return user
    }

    /**
     * The signed-in user, in the extension's session, once `partyId` is one
     * of their wallets on that session's network. Its store stays on that
     * network.
     */
    async function writerFor(partyId: unknown): Promise<Writer> {
        return writerOf(await signedIn(), partyId)
    }

    async function writerOf(user: SignedIn, partyId: unknown): Promise<Writer> {
        const session = await extensionSession(user)
        // The store takes the network, and so the wallets and the ledger,
        // from the first session with the user's token, which can be
        // another origin's on another network.
        const network = await user.store.getCurrentNetwork()
        if (session.network !== network.id) {
            throw new Error(
                `The extension is connected to ${session.network}, but the wallet would use ${network.id}`
            )
        }
        const writer = {
            ...user,
            store: onNetwork(user.store, network),
            sessionId: session.id,
            network,
        }
        await assertOwner(writer, partyId)
        return writer
    }

    async function sdkForParty(partyId: unknown): Promise<TokenSdk> {
        return sdkFor(await ownerOf(partyId))
    }

    async function signedIn(): Promise<SignedIn> {
        const context = await authContext.load()
        if (!context) throw new Error('Not signed in')
        return { context, store: (await getStore()).withAuthContext(context) }
    }

    async function findAsset(
        sdk: TokenSdk,
        { admin, id }: CreateTransferParams['instrumentId']
    ): Promise<AssetBody> {
        const asset = (await sdk.token.assets()).find(
            (candidate) => candidate.admin === admin && candidate.id === id
        )
        if (!asset) {
            throw new Error(
                `Instrument ${id} of ${admin} is not in the network's registries`
            )
        }
        return asset
    }

    /**
     * The extension's session for the user's token, on `networkId` if
     * given.
     */
    async function extensionSession(
        { context, store }: SignedIn,
        networkId?: string
    ) {
        const accessTokenHash = await hashAccessToken(context.accessToken)
        const session = (await store.listSessions()).find(
            (candidate) =>
                candidate.origin === EXTENSION_ORIGIN &&
                candidate.accessTokenHash === accessTokenHash &&
                (networkId === undefined || candidate.network === networkId)
        )
        if (!session) throw new Error('The extension is not connected')
        return session
    }

    // Signing out removes the session but leaves the token and the keys,
    // so a write already under way checks it is still connected. A
    // reconnect replaces the session on the same network, so any
    // extension session there will do.
    async function assertConnected(writer: Writer): Promise<void> {
        await extensionSession(writer, writer.network.id)
    }

    /**
     * Prepares a command as `partyId` and stores it as pending. Returns the
     * transaction's id.
     */
    async function prepareCommand(
        writer: Writer,
        partyId: PartyId,
        [command, disclosedContracts]: PreparedCommand
    ): Promise<string> {
        await assertConnected(writer)
        const { context, store } = writer
        const transactionId = crypto.randomUUID()
        const commandId = crypto.randomUUID()
        await prepareTransaction(store, context, {
            transactionId,
            commandId,
            origin: EXTENSION_ORIGIN,
            params: {
                commandId,
                commands: [command] as PrepareExecuteParams['commands'],
                actAs: [partyId],
                disclosedContracts,
            },
        })
        return transactionId
    }

    /** Signs and executes a prepared transaction in the extension's session. */
    async function signAndExecute(
        writer: Writer,
        transactionId: string
    ): Promise<void> {
        const { context, store, sessionId } = writer
        await settle(writer, transactionId, () =>
            submitTransaction(connected(writer), {
                store,
                auth: context,
                sessionId,
                transactionId,
            })
        )
    }

    /**
     * Runs a step that may sign or execute, and tells a failure after which
     * the transaction can't have executed from one whose outcome is unknown.
     */
    async function settle(
        { store }: Writer,
        transactionId: string,
        step: () => Promise<unknown>
    ): Promise<void> {
        try {
            await step()
        } catch (cause) {
            const message = toError(cause).message
            // Unsigned, it can't reach the ledger. Once signed, even a
            // `failed` row is no proof: the ledger's timeout waiting for
            // the completion is recorded as `failed` too.
            if (await removeReview(store, transactionId)) {
                throw notSubmittedError(message)
            }
            throw unknownOutcome(message)
        }
    }

    /** Removes the transaction if it is still pending. Resolves whether it did. */
    async function removeReview(
        store: ExtensionStore,
        transactionId: string
    ): Promise<boolean> {
        const removed = await store
            .removePendingTransaction(transactionId)
            .catch(() => false)
        if (removed) await reviewNetworks.forget(transactionId)
        return removed
    }

    /** `submitter`, checking before each step that `writer` is connected. */
    function connected(
        writer: Writer
    ): Pick<TransactionSubmitter, 'sign' | 'execute'> {
        return {
            sign: async (...args) => {
                await assertConnected(writer)
                return submitter.sign(...args)
            },
            execute: async (...args) => {
                await assertConnected(writer)
                return submitter.execute(...args)
            },
        }
    }

    // Spell out the fields, so that a caller can't pass options the
    // service doesn't expose.
    const holdingsParams = ({
        partyId,
        includeLocked,
        limit,
        offset,
    }: ListHoldingsParams): ListHoldingsParams => ({
        partyId,
        includeLocked,
        limit,
        offset,
    })

    const isExpired = ({ createdAt }: Transaction) =>
        !createdAt || Date.now() - createdAt.getTime() >= REVIEW_TIMEOUT_MS

    /** Removes the user's prepared transfers the user left unanswered. */
    async function removeExpiredReviews({ store }: Writer): Promise<void> {
        const expired = (await store.listAllPendingTransactions()).filter(
            (transaction) =>
                transaction.origin === EXTENSION_ORIGIN &&
                transaction.status === 'pending' &&
                isExpired(transaction)
        )
        for (const { id } of expired) {
            await removeUnclaimed(store, id)
        }
    }

    function prepare({
        sender,
        receiver,
        instrumentId,
        amount,
        expiry,
        memo,
        tokenStandardVersion,
    }: CreateTransferParams): Promise<PreparedTransfer> {
        return beforeSigning(async () => {
            const writer = await writerFor(sender)
            await removeExpiredReviews(writer)
            const expirationDate = new Date(expiry)
            if (Number.isNaN(expirationDate.getTime())) {
                throw new Error('The expiry is not a valid date')
            }
            const sdk = await sdkOn(writer.network, writer.context)
            const asset = await findAsset(sdk, instrumentId)
            const { used } = resolveTransferVersion(asset, tokenStandardVersion)
            const params = {
                sender,
                recipient: receiver,
                amount,
                instrumentId: asset.id,
                registryUrl: asset.registryUrl,
                expirationDate,
                memo,
            }
            const command =
                used === 'v2'
                    ? await sdk.token.v2.transfer.create(params)
                    : await sdk.token.v1.transfer.create(params)
            const transactionId = await prepareCommand(writer, sender, command)
            let transaction: Transaction | undefined
            try {
                await reviewNetworks.set(transactionId, writer.network.id)
                transaction = await writer.store.getTransaction(transactionId)
                if (!transaction?.createdAt) {
                    throw new Error('The prepared transfer was not stored')
                }
            } catch (cause) {
                // The page gets no id to discard it with.
                await removeReview(writer.store, transactionId)
                throw cause
            }
            return {
                transactionId,
                commandId: transaction.commandId,
                preparedTransaction: transaction.preparedTransaction,
                preparedTransactionHash: transaction.preparedTransactionHash,
                createdAt: transaction.createdAt.toISOString(),
                partyId: sender,
            }
        })
    }

    /**
     * A writer for the transaction's acting party, on the network it was
     * prepared on.
     */
    async function writerForReview(
        user: SignedIn,
        transaction: Transaction
    ): Promise<Writer> {
        const writer = await writerOf(user, actingParty(transaction))
        const preparedOn = await reviewNetworks.get(transaction.id)
        if (preparedOn !== writer.network.id) {
            throw new Error(
                `The transfer was prepared on ${preparedOn ?? 'another network'}, but the extension is connected to ${writer.network.id}`
            )
        }
        return writer
    }

    async function submit(transactionId: string): Promise<void> {
        if (typeof transactionId !== 'string' || transactionId === '') {
            throw notSubmittedError(
                'There is no prepared transfer with this id'
            )
        }
        if (claims.has(transactionId)) {
            throw unknownOutcome('another request is handling it')
        }
        claims.add(transactionId)
        try {
            let user: SignedIn
            let transaction: Transaction | undefined
            // Without the row, an earlier submit may have reached the
            // ledger.
            try {
                user = await signedIn()
                transaction = await user.store.getTransaction(transactionId)
            } catch (cause) {
                throw unknownOutcome(toError(cause).message)
            }
            if (transaction?.origin !== EXTENSION_ORIGIN) {
                throw notSubmittedError(
                    'There is no prepared transfer with this id'
                )
            }
            await submitAs(user, transaction)
        } finally {
            claims.delete(transactionId)
        }
    }

    /**
     * Acts on the stored status. Executed rows lose their acting party, so
     * only the statuses that need the ledger build a writer.
     */
    async function submitAs(
        user: SignedIn,
        transaction: Transaction
    ): Promise<void> {
        const { id } = transaction
        switch (transaction.status) {
            case 'pending': {
                if (isExpired(transaction)) {
                    if (await removeReview(user.store, id)) {
                        throw notSubmittedError(
                            'The review expired. Review the transfer again.'
                        )
                    }
                    return submitAs(user, await afterFailedRemoval(user, id))
                }
                const writer = await writerForReview(user, transaction).catch(
                    async (cause: unknown) => {
                        const message = toError(cause).message
                        if (await removeReview(user.store, id)) {
                            throw notSubmittedError(message)
                        }
                        throw unknownOutcome(message)
                    }
                )
                await signAndExecute(writer, id)
                return reviewNetworks.forget(id)
            }
            // The ledger deduplicates by command id, and an already accepted
            // command is recorded as executed.
            case 'signed': {
                const writer = await writerForReview(user, transaction).catch(
                    (cause: unknown) => {
                        throw unknownOutcome(toError(cause).message)
                    }
                )
                const { context, store, sessionId } = writer
                const partyId = actingParty(transaction)!
                await settle(writer, id, () =>
                    connected(writer).execute(store, context, sessionId, {
                        transactionId: id,
                        partyId,
                    })
                )
                return reviewNetworks.forget(id)
            }
            case 'executed':
                return reviewNetworks.forget(id)
            case 'failed':
                throw unknownOutcome(
                    transaction.failureReason ?? 'it failed without a reason'
                )
            case 'awaiting-signature':
                throw unknownOutcome('it is waiting for its signature')
        }
    }

    /**
     * Re-reads the transaction after its expired review could not be
     * removed: another write may have moved it on.
     */
    async function afterFailedRemoval(
        { store }: SignedIn,
        transactionId: string
    ): Promise<Transaction> {
        let current: Transaction | undefined
        try {
            current = await store.getTransaction(transactionId)
        } catch (cause) {
            throw unknownOutcome(toError(cause).message)
        }
        if (!current) {
            throw notSubmittedError(
                'There is no prepared transfer with this id'
            )
        }
        if (current.status === 'pending') {
            throw unknownOutcome('the expired review could not be removed')
        }
        return current
    }

    async function discard(transactionId: string): Promise<void> {
        const { store } = await signedIn()
        if (typeof transactionId !== 'string' || transactionId === '') return
        if (claims.has(transactionId)) return
        claims.add(transactionId)
        try {
            const transaction = await store.getTransaction(transactionId)
            if (transaction?.origin !== EXTENSION_ORIGIN) return
            await removeReview(store, transactionId)
        } finally {
            claims.delete(transactionId)
        }
    }

    const exercise =
        (choice: 'accept' | 'reject' | 'withdraw') =>
        async ({
            partyId,
            contractId,
            instrumentId,
            version,
        }: TransferChoiceParams): Promise<void> => {
            const [writer, transactionId] = await beforeSigning(async () => {
                const writer = await writerFor(partyId)
                const sdk = await sdkOn(writer.network, writer.context)
                const { registryUrl } = await findAsset(sdk, instrumentId)
                const command =
                    version === 'v2'
                        ? await sdk.token.v2.transfer[choice](
                              contractId,
                              [partyId],
                              registryUrl
                          )
                        : await sdk.token.v1.transfer[choice]({
                              transferInstructionCid: contractId,
                              registryUrl,
                          })
                return [
                    writer,
                    await prepareCommand(writer, partyId, command),
                ] as const
            })
            await signAndExecute(writer, transactionId)
        }

    return {
        token: {
            async instruments() {
                const { store } = await signedIn()
                const network = await store.getCurrentNetwork()
                const urls = await registries.forNetwork(network.id)
                const lists = await Promise.all(urls.map(registryInstruments))
                return lists.flat()
            },
            transfer: {
                prepare,
                submit,
                discard,
                withdraw: exercise('withdraw'),
                accept: exercise('accept'),
                reject: exercise('reject'),
            },
            v1: {
                utxos: {
                    async list(params) {
                        const sdk = await sdkForParty(params?.partyId)
                        return sdk.token.v1.utxos.list(holdingsParams(params))
                    },
                },
                transfer: {
                    async pending(partyId) {
                        const sdk = await sdkForParty(partyId)
                        return sdk.token.v1.transfer.pending(partyId)
                    },
                },
            },
            v2: {
                utxos: {
                    async list(params) {
                        const sdk = await sdkForParty(params?.partyId)
                        return sdk.token.v2.utxos.list(holdingsParams(params))
                    },
                },
                transfer: {
                    async pending(partyId) {
                        const sdk = await sdkForParty(partyId)
                        return sdk.token.v2.transfer.pending(partyId)
                    },
                },
            },
        },
    }
}
