// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
    Error as RpcError,
    Key,
    KeyIdentifier,
    Keys,
    Transaction,
    TransactionsResult,
} from '@canton-network/core-signing-lib'

/**
 * Operations of the DSRV signing API. Each one is served at
 * `POST {baseUrl}/api/signing/{operation}` with a JSON body.
 */
export type DsrvSigningOperation =
    | 'createKey'
    | 'getKeys'
    | 'signTransaction'
    | 'getTransaction'
    | 'getTransactions'

/**
 * Optional audit field sent with the requests that create keys or ask for a
 * signature: the Wallet Gateway user the request is made for.
 */
interface RequestedBy {
    requestedBy?: string
}

export interface CreateKeyRequest extends RequestedBy {
    name: string
}

export interface SignTransactionRequest extends RequestedBy {
    tx: string
    txHash: string
    keyIdentifier: KeyIdentifier
    internalTxId?: string
}

export interface GetTransactionRequest {
    txId: string
}

export interface GetTransactionsRequest {
    txIds?: string[]
    publicKeys?: string[]
}

/**
 * A refused request is answered with HTTP 200 and this body, so the driver
 * can hand it to the Wallet Gateway as an RPC error.
 */
export type DsrvApiError = Pick<RpcError, 'error'> &
    Partial<Pick<RpcError, 'error_description'>>

// Error bodies are cut to this length before they become error messages
const MAX_ERROR_BODY_LENGTH = 300

const stripTrailingSlash = (url: string) =>
    url.endsWith('/') ? url.slice(0, -1) : url

/** What getConfiguration shows: the bearer token is never returned */
export type DsrvSigningApiConfiguration = {
    baseUrl: string
    bearerToken: '***HIDDEN***'
}

/**
 * HTTP client for the DSRV signing API. Every request carries
 * `Authorization: Bearer <token>`.
 */
export class DsrvSigningApiClient {
    private baseUrl: string
    private bearerToken: string

    constructor(baseUrl: string, bearerToken: string) {
        this.baseUrl = stripTrailingSlash(baseUrl)
        this.bearerToken = bearerToken
    }

    public createKey(request: CreateKeyRequest): Promise<Key | DsrvApiError> {
        return this.post('createKey', request)
    }

    public getKeys(): Promise<Keys | DsrvApiError> {
        return this.post('getKeys', {})
    }

    public signTransaction(
        request: SignTransactionRequest
    ): Promise<Transaction | DsrvApiError> {
        return this.post('signTransaction', request)
    }

    public getTransaction(
        request: GetTransactionRequest
    ): Promise<Transaction | DsrvApiError> {
        return this.post('getTransaction', request)
    }

    public getTransactions(
        request: GetTransactionsRequest
    ): Promise<TransactionsResult | DsrvApiError> {
        return this.post('getTransactions', request)
    }

    public getConfiguration(): DsrvSigningApiConfiguration {
        return { baseUrl: this.baseUrl, bearerToken: '***HIDDEN***' }
    }

    /** An empty bearerToken is ignored */
    public setConfiguration(params: {
        baseUrl?: string
        bearerToken?: string
    }): DsrvSigningApiConfiguration {
        if (params.baseUrl !== undefined) {
            this.baseUrl = stripTrailingSlash(params.baseUrl)
        }
        if (params.bearerToken) {
            this.bearerToken = params.bearerToken
        }
        return this.getConfiguration()
    }

    private async post<O>(
        operation: DsrvSigningOperation,
        body: object
    ): Promise<O> {
        const response = await fetch(
            `${this.baseUrl}/api/signing/${operation}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.bearerToken}`,
                },
                body: JSON.stringify(body),
            }
        )

        if (!response.ok) {
            const errorText = (await response.text()).slice(
                0,
                MAX_ERROR_BODY_LENGTH
            )
            throw new Error(
                `DSRV signing API ${operation} failed (${response.status}): ${errorText || response.statusText}`
            )
        }

        return (await response.json()) as O
    }
}
