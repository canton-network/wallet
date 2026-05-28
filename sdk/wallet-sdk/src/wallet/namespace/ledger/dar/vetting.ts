// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    AbstractLedgerProvider,
    Ops,
} from '@canton-network/core-provider-ledger'

/**
 * Vets a DAR package on the specified synchronizer.
 *
 * @param ledgerProvider - The ledger provider for the target participant node.
 *   Obtain via `(sdk.ledger as any).sdkContext.ledgerProvider`.
 * @param darBytes - Raw DAR file bytes.
 * @param synchronizerId - The synchronizer on which the package should be vetted.
 * @param vetAllPackages - When true (default) all packages inside the DAR are
 *   vetted, not only the main dalf. Matches the behaviour of `dar.upload`.
 */
export async function vetPackage(
    ledgerProvider: AbstractLedgerProvider,
    darBytes: Uint8Array | Buffer,
    synchronizerId: string,
    vetAllPackages = true
): Promise<void> {
    await ledgerProvider.request<Ops.PostV2Packages>({
        method: 'ledgerApi',
        params: {
            resource: '/v2/packages',
            requestMethod: 'post',
            query: { synchronizerId, vetAllPackages },
            body: darBytes as never,
            headers: { 'Content-Type': 'application/octet-stream' },
        },
    })
}
