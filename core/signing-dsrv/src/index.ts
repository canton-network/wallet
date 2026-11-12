// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    buildController,
    type CreateKeyParams,
    type CreateKeyResult,
    type Error as RpcError,
    type GetConfigurationResult,
    type GetKeysResult,
    type GetTransactionParams,
    type GetTransactionResult,
    type GetTransactionsParams,
    type GetTransactionsResult,
    type Key,
    PartyMode,
    type SetConfigurationParams,
    type SetConfigurationResult,
    type SigningDriverInterface,
    SigningProvider,
    type SignMessageResult,
    type SignTransactionParams,
    type SignTransactionResult,
    type SubscribeTransactionsParams,
    type SubscribeTransactionsResult,
    type Transaction,
} from '@canton-network/core-signing-lib'
import type { AuthContext } from '@canton-network/core-wallet-auth'
import {
    type DsrvApiError,
    DsrvSigningApiClient,
} from './signing-api-client.js'

export {
    DsrvSigningApiClient,
    type CreateKeyRequest,
    type DsrvApiError,
    type DsrvSigningApiConfiguration,
    type DsrvSigningOperation,
    type GetTransactionRequest,
    type GetTransactionsRequest,
    type SignTransactionRequest,
} from './signing-api-client.js'

export interface DsrvConfig {
    /** Base URL of the DSRV signing API, called at `{baseUrl}/api/signing/{operation}` */
    baseUrl: string
    /**
     * Sent as `Authorization: Bearer <token>` on every request. It identifies
     * the calling Wallet Gateway, not the user or the request.
     */
    bearerToken: string
}

function isApiError(result: object): result is DsrvApiError {
    return 'error' in result && typeof result.error === 'string'
}

function toRpcError(result: DsrvApiError): RpcError {
    return {
        error: result.error,
        error_description: result.error_description ?? result.error,
    }
}

function toTransaction(tx: Transaction): Transaction {
    // The Wallet Gateway fails on a signed transaction without a signature,
    // so it stays pending until the signature is there
    const status =
        tx.status === 'signed' && !tx.signature ? 'pending' : tx.status
    return {
        txId: tx.txId,
        status,
        ...(tx.signature !== undefined && { signature: tx.signature }),
        ...(tx.publicKey !== undefined && { publicKey: tx.publicKey }),
        ...(tx.metadata !== undefined && { metadata: tx.metadata }),
    }
}

function toKey(key: Key): Key {
    return { id: key.id, name: key.name, publicKey: key.publicKey }
}

export default class DsrvSigningDriver implements SigningDriverInterface {
    private client: DsrvSigningApiClient

    constructor(config: DsrvConfig) {
        this.client = new DsrvSigningApiClient(
            config.baseUrl,
            config.bearerToken
        )
    }

    public partyMode = PartyMode.EXTERNAL
    public signingProvider = SigningProvider.DSRV

    public controller = (userId: AuthContext['userId'] | undefined) => {
        // The Wallet Gateway user is sent along for the signing API's audit
        // trail. It is not a credential.
        const requestedBy = userId ? { requestedBy: userId } : {}

        return buildController({
            createKey: async (
                params: CreateKeyParams
            ): Promise<CreateKeyResult> => {
                try {
                    const result = await this.client.createKey({
                        name: params.name,
                        ...requestedBy,
                    })
                    return isApiError(result)
                        ? toRpcError(result)
                        : toKey(result)
                } catch (error) {
                    return {
                        error: 'create_key_error',
                        error_description: (error as Error).message,
                    }
                }
            },

            getKeys: async (): Promise<GetKeysResult> => {
                try {
                    const result = await this.client.getKeys()
                    return isApiError(result)
                        ? toRpcError(result)
                        : { keys: result.keys.map(toKey) }
                } catch (error) {
                    return {
                        error: 'fetch_error',
                        error_description: (error as Error).message,
                    }
                }
            },

            signTransaction: async (
                params: SignTransactionParams
            ): Promise<SignTransactionResult> => {
                try {
                    const result = await this.client.signTransaction({
                        tx: params.tx,
                        txHash: params.txHash,
                        keyIdentifier: params.keyIdentifier,
                        ...(params.internalTxId !== undefined && {
                            internalTxId: params.internalTxId,
                        }),
                        ...requestedBy,
                    })
                    return isApiError(result)
                        ? toRpcError(result)
                        : toTransaction(result)
                } catch (error) {
                    return {
                        error: 'signing_error',
                        error_description: (error as Error).message,
                    }
                }
            },

            getTransaction: async (
                params: GetTransactionParams
            ): Promise<GetTransactionResult> => {
                try {
                    const result = await this.client.getTransaction({
                        txId: params.txId,
                    })
                    return isApiError(result)
                        ? toRpcError(result)
                        : toTransaction(result)
                } catch (error) {
                    return {
                        error: 'transaction_not_found',
                        error_description: (error as Error).message,
                    }
                }
            },

            getTransactions: async (
                params: GetTransactionsParams
            ): Promise<GetTransactionsResult> => {
                if (!params.txIds && !params.publicKeys) {
                    return {
                        error: 'bad_arguments',
                        error_description:
                            'either public key or txIds must be supplied',
                    }
                }
                try {
                    const result = await this.client.getTransactions({
                        ...(params.txIds && { txIds: params.txIds }),
                        ...(params.publicKeys && {
                            publicKeys: params.publicKeys,
                        }),
                    })
                    return isApiError(result)
                        ? toRpcError(result)
                        : {
                              transactions: (result.transactions ?? []).map(
                                  toTransaction
                              ),
                          }
                } catch (error) {
                    return {
                        error: 'fetch_error',
                        error_description: (error as Error).message,
                    }
                }
            },

            // The signing API signs prepared transaction hashes only
            signMessage: async (): Promise<SignMessageResult> => ({
                error: 'not_allowed',
                error_description:
                    'Signing messages is not supported by the DSRV signing provider.',
            }),

            getConfiguration: async (): Promise<GetConfigurationResult> =>
                this.client.getConfiguration(),

            setConfiguration: async (
                params: SetConfigurationParams
            ): Promise<SetConfigurationResult> => {
                const { baseUrl, bearerToken } = params
                return this.client.setConfiguration({
                    ...(typeof baseUrl === 'string' && { baseUrl }),
                    ...(typeof bearerToken === 'string' && { bearerToken }),
                })
            },

            // TODO remove comment below and write a test once / if ever implemented
            // v8 ignore next -- @preserve
            subscribeTransactions: async (
                _params: SubscribeTransactionsParams
            ): Promise<SubscribeTransactionsResult> =>
                Promise.resolve({} as SubscribeTransactionsResult),
        })
    }
}
