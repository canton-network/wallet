// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    AbstractLedgerProvider,
    Ops,
} from '@canton-network/core-provider-ledger'
import { SDKErrorHandler } from './error/handler.js'

/**
 * Resolves the synchronizer id to use for a ledger operation.
 *
 * The wallet SDK no longer guesses a synchronizer when several are connected —
 * callers are responsible for selecting the appropriate one and passing it
 * explicitly. As a convenience, when exactly one synchronizer is connected it
 * is used implicitly.
 *
 * @param provider ledger provider used to query connected synchronizers
 * @param error SDK error handler used to raise structured errors
 * @param explicit synchronizer id supplied by the caller, returned as-is when present
 * @returns the resolved synchronizer id
 * @throws when no synchronizer is connected, or when several are connected and
 * no explicit synchronizer id was provided
 */
export async function resolveSynchronizerId(
    provider: AbstractLedgerProvider,
    error: SDKErrorHandler,
    explicit?: string
): Promise<string> {
    if (explicit) return explicit

    const connected =
        await provider.request<Ops.GetV2StateConnectedSynchronizers>({
            method: 'ledgerApi',
            params: {
                resource: '/v2/state/connected-synchronizers',
                requestMethod: 'get',
                query: {},
            },
        })

    const synchronizers = connected?.connectedSynchronizers ?? []

    if (synchronizers.length === 0) {
        return error.throw({
            message: 'No connected synchronizers found',
            type: 'NotFound',
        })
    }

    if (synchronizers.length > 1) {
        return error.throw({
            message:
                `Multiple synchronizers are connected (${synchronizers.length}). ` +
                'Pass synchronizerId explicitly to select which one to use.',
            type: 'BadRequest',
        })
    }

    return synchronizers[0].synchronizerId
}
