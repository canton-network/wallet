// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Ops } from '@canton-network/core-provider-ledger'
import { SDKContext } from '../../../sdk.js'

/**
 * Vets a DAR package on the specified synchronizer.
 *
 * Tolerates the case where a package with the same name+version is already
 * vetted on the participant.
 * @param sdkContext - The SDK context for the target participant node.
 *   Obtain via `(sdk.ledger as any).sdkContext`.
 * @param darBytes - Raw DAR file bytes.
 * @param synchronizerId - The synchronizer on which the package should be vetted.
 */
export async function vetDar(
    sdkContext: SDKContext,
    darBytes: Uint8Array | Buffer,
    synchronizerId: string
): Promise<void> {
    try {
        await sdkContext.ledgerProvider.request<Ops.PostV2Packages>({
            method: 'ledgerApi',
            params: {
                resource: '/v2/packages',
                requestMethod: 'post',
                query: { synchronizerId, vetAllPackages: true },
                body: darBytes as never,
                headers: { 'Content-Type': 'application/octet-stream' },
            },
        })
    } catch (e) {
        const code = (e as { code?: string })?.code
        const message = `${(e as { cause?: unknown })?.cause ?? (e as Error)?.message ?? e}`
        if (
            code === 'KNOWN_PACKAGE_VERSION' ||
            message.includes('same name and version')
        ) {
            sdkContext.logger.warn(
                'A package with the same name+version is already vetted; reusing the existing package.'
            )
            return
        }
        throw e
    }
}
