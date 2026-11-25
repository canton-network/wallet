// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { RegistryInstrument } from '@canton-network/core-wallet-ui-components/react/token'
import { usePortfolioConfig } from '@contexts/PortfolioConfigContext'
import { normalizeRegistryUrl } from '@utils/registry'
import { useMemo } from 'react'

import type { PreapprovalRow } from '../types/preapprovals.ts'
import { useInstruments } from './useInstruments.ts'
import { useRegistryUrls } from './useRegistryUrls.ts'

const AMULET_INSTRUMENT_ID = 'Amulet'

const isAmuletInstrument = ({
    registryUrl,
    instrument,
    amuletRegistryUrl,
}: {
    registryUrl: string
    instrument: RegistryInstrument
    amuletRegistryUrl: string
}) =>
    instrument.id === AMULET_INSTRUMENT_ID &&
    normalizeRegistryUrl(registryUrl) ===
        normalizeRegistryUrl(amuletRegistryUrl)

export const formatInstrumentName = (instrument: RegistryInstrument) => {
    const name = instrument.name || instrument.id
    return instrument.symbol ? `${name} (${instrument.symbol})` : name
}

export function usePreapprovalRows(): PreapprovalRow[] {
    const registryUrls = useRegistryUrls()
    const instruments = useInstruments()
    const {
        amulet: { registry: amuletRegistryUrl },
    } = usePortfolioConfig()

    return useMemo(
        () =>
            Array.from(registryUrls.entries())
                .flatMap(([registryPartyId, registryUrl]) =>
                    (instruments.get(registryPartyId) ?? []).map(
                        (instrument): PreapprovalRow => ({
                            key: `${registryPartyId}:${instrument.id}`,
                            registryPartyId,
                            registryUrl,
                            instrument,
                            kind: isAmuletInstrument({
                                registryUrl,
                                instrument,
                                amuletRegistryUrl,
                            })
                                ? 'amulet'
                                : 'utility',
                        })
                    )
                )
                .sort((left, right) =>
                    formatInstrumentName(left.instrument).localeCompare(
                        formatInstrumentName(right.instrument)
                    )
                ),
        [amuletRegistryUrl, instruments, registryUrls]
    )
}
