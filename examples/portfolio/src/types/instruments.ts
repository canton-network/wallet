// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { type metadataRegistryTypes } from '@canton-network/core-token-standard'
import { type PartyId } from '@canton-network/core-types'
import type { AssetBody } from '@canton-network/wallet-sdk'

export type Instrument = metadataRegistryTypes['schemas']['Instrument']

export type PortfolioInstrument = AssetBody & {
    name: string
    decimals: number
}

export const toPortfolioInstrument = ({
    instrument,
    admin,
    registryUrl,
}: {
    instrument: Instrument
    admin: PartyId
    registryUrl: string
}): PortfolioInstrument => ({
    id: instrument.id,
    admin,
    registryUrl: new URL(registryUrl),
    displayName: instrument.name,
    name: instrument.name,
    symbol: instrument.symbol,
    decimals: instrument.decimals,
    supportedApis: Object.fromEntries(
        Object.entries(instrument.supportedApis ?? {}).map(([k, v]) => [
            k,
            String(v),
        ])
    ),
    paused: instrument.paused ?? false,
    ...(instrument.pauseInfo ? { pauseInfo: instrument.pauseInfo } : {}),
    ...(instrument.showAccountInputFields !== undefined
        ? { showAccountInputFields: instrument.showAccountInputFields }
        : {}),
    ...(instrument.accountInputFieldsToShow !== undefined
        ? { accountInputFieldsToShow: instrument.accountInputFieldsToShow }
        : {}),
})

export type Instruments = ReadonlyMap<PartyId, PortfolioInstrument[]>
