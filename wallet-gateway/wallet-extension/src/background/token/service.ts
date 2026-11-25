// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PartyId } from '@canton-network/core-types'
import type { AuthContext } from '@canton-network/core-wallet-auth'
import {
    type CreateTransferParams,
    type RegistryInstrument,
    resolveTransferVersion,
    type TransferChoiceParams,
} from '@canton-network/core-wallet-ui-components/react/token'
import type { AssetBody, PreparedCommand } from '@canton-network/wallet-sdk'

import { EXTENSION_ORIGIN } from '@/shared/auth-protocol.ts'

import type { AuthContextStore } from '../auth-context.ts'
import type { PrepareExecuteParams } from '../controllers/dapp/rpc-gen/typings.ts'
import type { TransactionSubmitter } from '../controllers/user/transactions.ts'
import type { ExtensionStore, WalletStore } from '../store/index.ts'
import type { RegistryStore } from '../store/registries.ts'
import { prepareTransaction } from '../transactions/prepare.ts'
import { submitTransaction } from '../transactions/submit.ts'
import { registryInstruments } from './instruments.ts'
import type { TokenSdk, TokenSdkConfig } from './sdk.ts'

/** An asset as the pages receive it: messaging turns a `URL` into a string. */
export type TokenAsset = Omit<AssetBody, 'registryUrl'> & {
    registryUrl: string
}

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

/**
 * The token API for the extension pages, with the SDK's nesting. The SDK
 * itself stays in the background: it also has the ledger, party and keys
 * APIs, and holds the user's token.
 */
export type TokenService = {
    token: {
        assets(): Promise<TokenAsset[]>
        /** The instruments of the current network's registries. */
        instruments(): Promise<RegistryInstrument[]>
        /**
         * The extension page's review step is the approval: these prepare,
         * sign and execute in one call, and resolve once executed.
         */
        transfer: {
            create(params: CreateTransferParams): Promise<void>
            /** v2 acts as `partyId` alone; `actors` is ignored. */
            withdraw(params: TransferChoiceParams): Promise<void>
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

export function createTokenService({
    authContext,
    getStore,
    registries,
    createSdk,
    submitter,
}: TokenServiceDeps): TokenService {
    /**
     * The SDK for `user` and its current network. Callers load the user once
     * and pass it, so a sign-in that happens meanwhile can't mix one user's
     * ownership check with another user's token.
     */
    async function sdkFor({ context, store }: SignedIn): Promise<TokenSdk> {
        const network = await store.getCurrentNetwork()
        return createSdk({
            network,
            accessToken: context.accessToken,
            registries: await registries.forNetwork(network.id),
        })
    }

    /**
     * The signed-in user, once `partyId` is one of their wallets. Messaging
     * doesn't check types, so a missing or non-string `partyId` is rejected
     * here.
     */
    async function ownerOf(partyId: unknown): Promise<SignedIn> {
        const user = await signedIn()
        if (typeof partyId !== 'string' || partyId === '') {
            throw new Error('A partyId is required')
        }
        const wallets = await user.store.getWallets()
        if (!wallets.some((wallet) => wallet.partyId === partyId)) {
            throw new Error(`Party ${partyId} does not belong to user`)
        }
        return user
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
     * Prepares, signs and executes a command as `partyId`, in the
     * extension's session.
     */
    async function submit(
        { context, store }: SignedIn,
        partyId: PartyId,
        [command, disclosedContracts]: PreparedCommand
    ): Promise<void> {
        const session = await store.getSession(context.accessToken)
        if (session?.origin !== EXTENSION_ORIGIN) {
            throw new Error('The extension is not connected')
        }
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
        try {
            await submitTransaction(submitter, {
                store,
                auth: context,
                sessionId: session.id,
                transactionId,
            })
        } catch (error) {
            // Unsigned, it can't reach the ledger. A signed one is kept, as
            // its outcome is unknown.
            await store.removePendingTransaction(transactionId).catch(() => {})
            throw error
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

    return {
        token: {
            async assets() {
                const sdk = await sdkFor(await signedIn())
                const assets = await sdk.token.assets()
                return assets.map((asset) => ({
                    ...asset,
                    registryUrl: asset.registryUrl.toString(),
                }))
            },
            async instruments() {
                const { store } = await signedIn()
                const network = await store.getCurrentNetwork()
                const urls = await registries.forNetwork(network.id)
                const lists = await Promise.all(urls.map(registryInstruments))
                return lists.flat()
            },
            transfer: {
                async create({
                    sender,
                    receiver,
                    instrumentId,
                    amount,
                    expiry,
                    memo,
                    tokenStandardVersion,
                }) {
                    const user = await ownerOf(sender)
                    const expirationDate = new Date(expiry)
                    if (Number.isNaN(expirationDate.getTime())) {
                        throw new Error('The expiry is not a valid date')
                    }
                    const sdk = await sdkFor(user)
                    const asset = await findAsset(sdk, instrumentId)
                    const { used } = resolveTransferVersion(
                        asset,
                        tokenStandardVersion
                    )
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
                    await submit(user, sender, command)
                },
                async withdraw({ partyId, contractId, instrumentId, version }) {
                    const user = await ownerOf(partyId)
                    const sdk = await sdkFor(user)
                    const { registryUrl } = await findAsset(sdk, instrumentId)
                    const command =
                        version === 'v2'
                            ? await sdk.token.v2.transfer.withdraw(
                                  contractId,
                                  [partyId],
                                  registryUrl
                              )
                            : await sdk.token.v1.transfer.withdraw({
                                  transferInstructionCid: contractId,
                                  registryUrl,
                              })
                    await submit(user, partyId, command)
                },
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
