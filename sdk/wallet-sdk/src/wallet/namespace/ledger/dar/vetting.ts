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
 */
export async function vetDar(
    ledgerProvider: AbstractLedgerProvider,
    darBytes: Uint8Array | Buffer,
    synchronizerId: string
): Promise<void> {
    await ledgerProvider.request<Ops.PostV2Packages>({
        method: 'ledgerApi',
        params: {
            resource: '/v2/packages',
            requestMethod: 'post',
            query: { synchronizerId, vetAllPackages: true },
            body: darBytes as never,
            headers: { 'Content-Type': 'application/octet-stream' },
        },
    })
}

/**
 * Like {@link vetDar}, but tolerates the case where a package with the same
 * name+version is already vetted on the participant.
 *
 * On a persistent network, a previous build of a DAR (e.g. `splice-test-token-v1`)
 * may already be vetted. Re-vetting after rebuilding the DAR produces a different
 * package hash for the same name+version, which Canton rejects with
 * `KNOWN_PACKAGE_VERSION`. Since the already-vetted package is resolved by
 * package-name at command-submission time, it is safe to reuse it and continue.
 *
 * @param ledgerProvider - The ledger provider for the target participant node.
 * @param darBytes - Raw DAR file bytes.
 * @param synchronizerId - The synchronizer on which the package should be vetted.
 * @param logger - Optional logger; a warning is emitted when an existing package
 *   is reused.
 */
export async function vetDarIdempotent(
    ledgerProvider: AbstractLedgerProvider,
    darBytes: Uint8Array | Buffer,
    synchronizerId: string,
    logger?: { warn(message: string): void }
): Promise<void> {
    try {
        await vetDar(ledgerProvider, darBytes, synchronizerId)
    } catch (e) {
        const code = (e as { code?: string })?.code
        const message = `${(e as { cause?: unknown })?.cause ?? (e as Error)?.message ?? e}`
        if (
            code === 'KNOWN_PACKAGE_VERSION' ||
            message.includes('same name and version')
        ) {
            logger?.warn(
                'A package with the same name+version is already vetted; reusing the existing package.'
            )
            return
        }
        throw e
    }
}
