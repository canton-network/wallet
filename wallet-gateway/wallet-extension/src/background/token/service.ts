// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { rpcErrors } from '@canton-network/core-rpc-errors'
import type { PartyId } from '@canton-network/core-types'
import type { AuthContext } from '@canton-network/core-wallet-auth'
import { hashAccessToken } from '@canton-network/core-wallet-store'
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
        /** The instruments of the current network's registries. */
        instruments(): Promise<RegistryInstrument[]>
        /**
         * The extension page's review step is the approval: these prepare,
         * sign and execute in one call, and resolve once executed. They
         * reject with an `Error`; a -32603 error code means the transaction
         * was signed and may have executed.
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

// Messaging sends a rejection that is no `Error` as `{}`, and the page's
// promise resolves with it, as if the transfer had executed.
function toError(cause: unknown): Error {
    if (cause instanceof Error) return cause
    return new Error(
        typeof cause === 'string' && cause !== ''
            ? cause
            : 'The transfer failed without an error message'
    )
}

async function rejectingWithError(write: () => Promise<void>): Promise<void> {
    try {
        await write()
    } catch (cause) {
        throw toError(cause)
    }
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

    /** The extension's session for the user's token. */
    async function extensionSession({ context, store }: SignedIn) {
        const accessTokenHash = await hashAccessToken(context.accessToken)
        const session = (await store.listSessions()).find(
            (candidate) =>
                candidate.origin === EXTENSION_ORIGIN &&
                candidate.accessTokenHash === accessTokenHash
        )
        if (!session) throw new Error('The extension is not connected')
        return session
    }

    /**
     * Prepares, signs and executes a command as `partyId`, in the
     * extension's session.
     */
    async function submit(
        user: SignedIn,
        partyId: PartyId,
        [command, disclosedContracts]: PreparedCommand
    ): Promise<void> {
        const { context, store } = user
        const session = await extensionSession(user)
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
        } catch (cause) {
            const message = toError(cause).message
            // Unsigned, it can't reach the ledger. A signed one is kept, as
            // its outcome is unknown, unless the ledger reported it failed.
            const removed = await store
                .removePendingTransaction(transactionId)
                .catch(() => false)
            const status = removed
                ? 'pending'
                : await store
                      .getTransaction(transactionId)
                      .then((transaction) => transaction?.status)
                      .catch(() => undefined)
            if (status === 'pending' || status === 'failed') {
                throw rpcErrors.transactionRejected({ message })
            }
            throw rpcErrors.internal({
                message: `The outcome of the transaction is unknown: ${message}`,
            })
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

    async function create({
        sender,
        receiver,
        instrumentId,
        amount,
        expiry,
        memo,
        tokenStandardVersion,
    }: CreateTransferParams): Promise<void> {
        const user = await ownerOf(sender)
        const expirationDate = new Date(expiry)
        if (Number.isNaN(expirationDate.getTime())) {
            throw new Error('The expiry is not a valid date')
        }
        const sdk = await sdkFor(user)
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
        await submit(user, sender, command)
    }

    async function withdraw({
        partyId,
        contractId,
        instrumentId,
        version,
    }: TransferChoiceParams): Promise<void> {
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
                create: (params) => rejectingWithError(() => create(params)),
                withdraw: (params) =>
                    rejectingWithError(() => withdraw(params)),
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
