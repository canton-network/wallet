// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    buildController,
    type CreateKeyResult,
    type GetConfigurationResult,
    type GetKeysResult,
    type GetTransactionParams,
    type GetTransactionResult,
    type GetTransactionsParams,
    type GetTransactionsResult,
    PartyMode,
    type SetConfigurationParams,
    type SetConfigurationResult,
    type SigningDriverInterface,
    SigningProvider,
    type SigningStatus,
    type SignMessageResult,
    type SignTransactionParams,
    type SignTransactionResult,
    type SubscribeTransactionsResult,
    type Transaction,
} from '@canton-network/core-signing-lib'
import { AuthContext } from '@canton-network/core-wallet-auth'
import _ from 'lodash'
import { z } from 'zod'
import {
    GatewayClient,
    type GatewayTxStatus,
    type GatewayTxStatusInfo,
} from './gateway-client.js'

export {
    GatewayClient,
    GatewayError,
    routingOnlyCommands,
    type GatewayAccount,
    type GatewayConnectResult,
    type GatewayPrepareExecuteResult,
    type GatewayTxStatus,
    type GatewayTxStatusInfo,
    type PrepareExecuteOutcome,
    type PrepareExecuteParams,
    type TaurusProtectGatewayConfig,
} from './gateway-client.js'

export interface TaurusProtectConfig {
    /** Base URL of the gateway JSON-RPC endpoint. */
    baseUrl: string
    /** Bearer api-key (HMAC-JWT); mint via the gateway's `api-key issue` command. */
    token: string
}

// Not .url(): the gateway is routinely reached on a bare host:port inside the cluster.
const TaurusProtectConfigSchema = z.object({
    baseUrl: z.string().min(1),
    token: z.string().min(1),
})

// signing-lib has no 'executed' state; map it to 'signed' and carry the real state in metadata.gatewayStatus.
function toSigningStatus(status: GatewayTxStatus): SigningStatus {
    switch (status) {
        case 'pending':
            return 'pending'
        case 'signed':
        case 'executed':
            return 'signed'
        case 'failed':
        default:
            return 'failed'
    }
}

function toTransaction(
    commandId: string,
    info: GatewayTxStatusInfo
): Transaction {
    return {
        txId: commandId,
        status: toSigningStatus(info.status),
        metadata: {
            gatewayStatus: info.status,
            ...(info.updateId ? { updateId: info.updateId } : {}),
            ...(info.contractId ? { contractId: info.contractId } : {}),
        },
    }
}

/**
 * Custodies Canton parties via the gateway, which prepares, signs (ECDSA P-256), and submits
 * each CIP-103 command. This driver never signs a hash — it forwards commands and tracks status.
 */
export default class TaurusProtectSigningDriver implements SigningDriverInterface {
    private config: TaurusProtectConfig
    private client: GatewayClient

    public partyMode = PartyMode.EXTERNAL
    public signingProvider = SigningProvider.TAURUS_PROTECT

    constructor(config: TaurusProtectConfig) {
        this.config = config
        this.client = new GatewayClient(config)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- a single machine token serves all users; userId is unused
    public controller = (_userId: AuthContext['userId'] | undefined) =>
        buildController({
            signTransaction: async (
                params: SignTransactionParams
            ): Promise<SignTransactionResult> => {
                let parsed: unknown
                try {
                    parsed = JSON.parse(params.tx)
                } catch {
                    parsed = undefined
                }
                // JSON.parse('null') and '"str"' succeed; guard the shape too.
                if (typeof parsed !== 'object' || parsed === null) {
                    return {
                        error: 'bad_arguments',
                        error_description:
                            'tx must be a JSON-encoded CIP-103 command { commands, actAs?, commandId? }',
                    }
                }
                const command = parsed as {
                    commands?: unknown
                    actAs?: string[]
                    commandId?: string
                    preparedTransaction?: string
                }
                if (command.commands === undefined) {
                    return {
                        error: 'bad_arguments',
                        error_description: 'tx.commands is required',
                    }
                }
                try {
                    // Only the four fields the gateway reads. disclosedContracts, readAs and
                    // packageIdSelectionPreference are inert there and already inside the PTX.
                    const result = await this.client.prepareExecute({
                        commands: command.commands,
                        ...(command.actAs ? { actAs: command.actAs } : {}),
                        ...(command.commandId
                            ? { commandId: command.commandId }
                            : {}),
                        ...(command.preparedTransaction
                            ? {
                                  preparedTransaction:
                                      command.preparedTransaction,
                              }
                            : {}),
                    })
                    // Gateway only submitted; signing/execution are async under governance, so surface 'pending'.
                    return {
                        // The client's effective commandId — it defaults one when tx omitted it,
                        // and getStatus is keyed off exactly that.
                        txId: result.commandId,
                        status: 'pending',
                        metadata: {
                            gatewayStatus: 'pending',
                            requestId: result.requestId,
                            commandId: result.commandId,
                        },
                    }
                } catch (error) {
                    return {
                        error: 'signing_error',
                        error_description: (error as Error).message,
                    }
                }
            },

            signMessage: async (): Promise<SignMessageResult> => ({
                error: 'not_allowed',
                error_description:
                    'Signing messages is not yet supported with Taurus-PROTECT.',
            }),

            getTransaction: async (
                params: GetTransactionParams
            ): Promise<GetTransactionResult> => {
                try {
                    // Re-seed requestId for the RPC fallback (cache is cold after restart).
                    if (
                        typeof params.requestId === 'string' &&
                        params.requestId
                    ) {
                        this.client.rememberRequestId(
                            params.txId,
                            params.requestId
                        )
                    }
                    const info = await this.client.getStatus(params.txId)
                    if (!info) {
                        return {
                            error: 'transaction_not_found',
                            error_description: `no status available for ${params.txId}`,
                        }
                    }
                    return toTransaction(params.txId, info)
                } catch (error) {
                    return {
                        error: 'fetch_error',
                        error_description: (error as Error).message,
                    }
                }
            },

            getTransactions: async (
                params: GetTransactionsParams
            ): Promise<GetTransactionsResult> => {
                if (!params.txIds || params.txIds.length === 0) {
                    return {
                        error: 'bad_arguments',
                        error_description:
                            'txIds must be supplied (Taurus-PROTECT does not enumerate by public key)',
                    }
                }
                try {
                    const resolved = await Promise.all(
                        params.txIds.map(async (txId) => {
                            const info = await this.client.getStatus(txId)
                            return info ? toTransaction(txId, info) : undefined
                        })
                    )
                    const transactions: Transaction[] = resolved.filter(
                        (tx): tx is Transaction => tx !== undefined
                    )
                    return { transactions }
                } catch (error) {
                    return {
                        error: 'fetch_error',
                        error_description: (error as Error).message,
                    }
                }
            },

            getKeys: async (): Promise<GetKeysResult> => {
                try {
                    const accounts = await this.client.listAccounts()
                    return {
                        keys: accounts
                            // Skip parties not yet ready ('initializing') and
                            // any returned without a publicKey — an empty one
                            // would persist a keyless wallet.
                            .filter(
                                (account) =>
                                    account.status === 'allocated' &&
                                    !!account.publicKey
                            )
                            .map((account) => ({
                                id: account.partyId,
                                name: account.prefix || account.partyId,
                                publicKey: account.publicKey,
                            })),
                    }
                } catch (error) {
                    return {
                        error: 'fetch_error',
                        error_description: (error as Error).message,
                    }
                }
            },

            createKey: async (): Promise<CreateKeyResult> => ({
                error: 'not_allowed',
                error_description:
                    'Parties are provisioned in Taurus-PROTECT; this driver imports existing parties and cannot create new ones.',
            }),

            getConfiguration: async (): Promise<GetConfigurationResult> => ({
                baseUrl: this.config.baseUrl,
                token: this.config.token ? '***HIDDEN***' : undefined,
            }),

            setConfiguration: async (
                params: SetConfigurationParams
            ): Promise<SetConfigurationResult> => {
                const validated = TaurusProtectConfigSchema.safeParse(params)
                if (!validated.success) {
                    return {
                        error: 'bad_arguments',
                        error_description: validated.error.message,
                    }
                }
                const newConfig: TaurusProtectConfig = {
                    baseUrl: validated.data.baseUrl,
                    token: validated.data.token,
                }
                if (!_.isEqual(newConfig, this.config)) {
                    this.config = newConfig
                    this.client = new GatewayClient(this.config)
                }
                // Never echo the bearer token back.
                return { baseUrl: newConfig.baseUrl, token: '***HIDDEN***' }
            },

            subscribeTransactions:
                async (): Promise<SubscribeTransactionsResult> =>
                    Promise.resolve({} as SubscribeTransactionsResult),
        })
}
