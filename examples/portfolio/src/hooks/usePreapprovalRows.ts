// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react'
import { usePortfolioConfig } from '@contexts/PortfolioConfigContext'
import { useInstruments } from './useInstruments'
import { useRegistryUrls } from './useRegistryUrls'
import type { PreapprovalRow } from '../types/preapprovals'
import type { Instrument } from '../types/instruments'

const AMULET_INSTRUMENT_ID = 'Amulet'

const normalizeRegistryUrl = (value: string) => {
    const { origin, pathname } = new URL(value)
    const normalizedPath = pathname
        .replace(/\/+$/, '')
        .replace(/\/registry$/, '')
    return `${origin}${normalizedPath}`
}

const isAmuletInstrument = ({
    registryUrl,
    instrument,
    amuletRegistryUrl,
}: {
    registryUrl: string
    instrument: Instrument
    amuletRegistryUrl: string
}) =>
    instrument.id === AMULET_INSTRUMENT_ID &&
    normalizeRegistryUrl(registryUrl) ===
        normalizeRegistryUrl(amuletRegistryUrl)

export const formatInstrumentName = (instrument: Instrument) => {
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
