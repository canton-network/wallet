// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PartyId } from '@canton-network/core-types'
import type { Instruments, PortfolioInstrument } from '../types/instruments'
import { normalizeRegistryUrl } from './registry'

export const resolveAllocationAsset = ({
    instrumentId,
    instruments,
    registryUrls,
    reachableRegistryUrls,
}: {
    instrumentId: { admin: PartyId; id: string }
    instruments: Instruments
    registryUrls: ReadonlyMap<PartyId, string>
    reachableRegistryUrls: ReadonlyMap<PartyId, string>
}): PortfolioInstrument => {
    const registryUrl = registryUrls.get(instrumentId.admin)
    if (!registryUrl) {
        throw new Error(`no registry URL for admin ${instrumentId.admin}`)
    }

    const reachableRegistryUrl = reachableRegistryUrls.get(instrumentId.admin)
    if (
        !reachableRegistryUrl ||
        normalizeRegistryUrl(reachableRegistryUrl) !==
            normalizeRegistryUrl(registryUrl)
    ) {
        throw new Error(
            `Registry for admin ${instrumentId.admin} is not reachable`
        )
    }

    const asset = instruments
        .get(instrumentId.admin)
        ?.find((instrument) => instrument.id === instrumentId.id)

    if (
        !asset ||
        normalizeRegistryUrl(asset.registryUrl.href) !==
            normalizeRegistryUrl(reachableRegistryUrl)
    ) {
        throw new Error(
            `Instrument ${instrumentId.id} for admin ${instrumentId.admin} is not available`
        )
    }

    return asset
}
