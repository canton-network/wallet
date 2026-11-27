// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PartyId } from '@canton-network/core-types'
import type { TokenInstruments } from '@canton-network/core-wallet-ui-components/react/token'
import type { AssetBody } from '@canton-network/wallet-sdk'

import { normalizeRegistryUrl } from './registry.ts'

export const resolveAllocationAsset = ({
    instrumentId,
    instruments,
    registryUrls,
    reachableRegistryUrls,
}: {
    instrumentId: { admin: PartyId; id: string }
    instruments: TokenInstruments
    registryUrls: ReadonlyMap<PartyId, string>
    reachableRegistryUrls: ReadonlyMap<PartyId, string>
}): AssetBody => {
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

    const registryInstruments = instruments.get(instrumentId.admin)
    if (!registryInstruments) {
        throw new Error(
            `Instrument metadata for admin ${instrumentId.admin} is not available`
        )
    }

    const asset = registryInstruments.find(
        (instrument) => instrument.id === instrumentId.id
    )

    if (!asset) {
        throw new Error(
            `Instrument ${instrumentId.id} was not found for admin ${instrumentId.admin}`
        )
    }

    if (
        normalizeRegistryUrl(asset.registryUrl) !==
        normalizeRegistryUrl(reachableRegistryUrl)
    ) {
        throw new Error(
            `Registry URL for instrument ${instrumentId.id} does not match the reachable registry URL`
        )
    }

    return { ...asset, registryUrl: new URL(asset.registryUrl) }
}
