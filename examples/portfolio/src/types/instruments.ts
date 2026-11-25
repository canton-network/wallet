// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { OffLedger } from '@canton-network/core-token-standard'
import type { PartyId } from '@canton-network/core-types'
import type { RegistryInstrument } from '@canton-network/core-wallet-ui-components/react/token'
import { resolveCapabilities } from '@canton-network/wallet-sdk'

export type Instrument =
    OffLedger.MetadataV1.components['schemas']['Instrument']

export const toRegistryInstrument = ({
    instrument,
    admin,
    registryUrl,
}: {
    instrument: Instrument
    admin: PartyId
    registryUrl: string
}): RegistryInstrument => ({
    id: instrument.id,
    admin,
    registryUrl: new URL(registryUrl).href,
    displayName: instrument.name,
    name: instrument.name,
    symbol: instrument.symbol,
    decimals: instrument.decimals,
    capabilities: resolveCapabilities({
        supportedApis: instrument.supportedApis,
    }),
})

export type TokenStandardVersion = 'v1' | 'v2'
