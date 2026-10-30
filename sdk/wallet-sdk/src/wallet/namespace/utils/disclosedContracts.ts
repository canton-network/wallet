// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { DisclosedContract } from '@canton-network/core-token-standard-service'

/**
 * Removes duplicate disclosures by contract ID.
 *
 * The same contract can come from multiple sources, but a submission must
 * disclose it only once.
 */
export function dedupeDisclosedContracts(
    disclosures: DisclosedContract[]
): DisclosedContract[] {
    return Array.from(
        new Map(
            disclosures.map((disclosure) => [disclosure.contractId, disclosure])
        ).values()
    )
}
