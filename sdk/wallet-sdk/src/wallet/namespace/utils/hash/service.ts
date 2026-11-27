// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    HashingSchemeVersion,
    type PreparedTransaction,
} from '@canton-network/core-ledger-proto'
import {
    computeTopologyMultiHash,
    type Converter,
    type HashingScheme,
    hashPreparedTransaction,
    type HashOptions,
    TxHashingError,
} from '@canton-network/core-tx-hashing'

import type { OfflineSDKContext } from '../../../sdk.ts'

export class HashNamespace {
    constructor(private readonly ctx: OfflineSDKContext) {}

    /**
     * @deprecated use preparedTransaction
     */
    public async preparedTransacation(
        value: PreparedTransaction | string
    ): Promise<Converter> {
        return await this.preparedTransaction(value)
    }

    /**
     * Computes the hash of a prepared transaction with `hashPreparedTransaction` of `@canton-network/core-tx-hashing`.
     *
     * @param value - The prepared transaction, or its bytes in base64 as the JSON API returns them
     * @param scheme - The hashing scheme the participant used, V2 by default
     * @param options - `limits` overrides core-tx-hashing's `DEFAULT_LIMITS`
     * @throws {SDKError} `BadRequest`, with the `TxHashingError` as `context.originalError`, when the input is refused
     */
    public async preparedTransaction(
        value: PreparedTransaction | string,
        scheme: HashingScheme = HashingSchemeVersion.V2,
        options?: HashOptions
    ): Promise<Converter> {
        try {
            return await hashPreparedTransaction(value, {
                hashingScheme: scheme,
                limits: options?.limits,
            })
        } catch (error) {
            if (!(error instanceof TxHashingError)) throw error
            const at = error.path === undefined ? '' : ` at ${error.path}`
            this.ctx.error.throw({
                type: 'BadRequest',
                message: `prepared transaction refused: ${error.code}${at}: ${error.message}`,
                originalError: error,
            })
        }
    }

    /**
     * Computes the multi-hash that one signature over a set of topology transactions is made on.
     *
     * @param preparedTransactions - The topology transactions, in base64 as the Ledger API returns them or as bytes
     * @returns The multi-hash in base64
     * @throws {SDKError} `BadRequest`, with the `TxHashingError` as `context.originalError`, when the set is empty or a transaction is not canonical base64
     */
    public async topologyTransaction(
        preparedTransactions: Uint8Array[] | string[]
    ) {
        try {
            return await computeTopologyMultiHash(preparedTransactions)
        } catch (error) {
            if (!(error instanceof TxHashingError)) throw error
            this.ctx.error.throw({
                type: 'BadRequest',
                message: `topology transactions refused: ${error.code}: ${error.message}`,
                originalError: error,
            })
        }
    }
}
