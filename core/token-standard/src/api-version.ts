// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { components as metadataRegistryTypes } from './generated-clients/splice-api-token-metadata-v1/token-metadata-v1.js'

export type TokenApiVersion = 'v1' | 'v2'
export type TokenApiVersionPreference = TokenApiVersion | 'auto'

export type InstrumentMetadata = metadataRegistryTypes['schemas']['Instrument']

const V2_API_MARKERS = [
    'splice-api-token-holding-v2',
    'splice-api-token-transfer-instruction-v2',
    'splice-api-token-allocation-v2',
    'splice-api-token-allocation-instruction-v2',
    'splice-api-token-allocation-request-v2',
    'splice-api-token-transfer-events-v2',
]

/**
 * Resolve which token-standard major API version to use for an instrument.
 * Prefer V2 when advertised unless the caller forces a version.
 */
export function resolveTokenApiVersion(
    preference: TokenApiVersionPreference,
    supportedApis: Record<string, string> | undefined
): TokenApiVersion {
    const advertisedV2 = instrumentSupportsV2(supportedApis)
    const advertisedV1 = instrumentSupportsV1(supportedApis)

    if (preference === 'v2') {
        if (
            !advertisedV2 &&
            supportedApis &&
            Object.keys(supportedApis).length > 0
        ) {
            throw new Error(
                'Forced apiVersion=v2 but instrument does not advertise V2 token standard APIs'
            )
        }
        return 'v2'
    }

    if (preference === 'v1') {
        if (!advertisedV1 && advertisedV2) {
            // Still allow forced V1 against dual-version instruments that omit explicit v1 keys
            // only when nothing is advertised; otherwise require V1 advertisement when present.
        }
        return 'v1'
    }

    // auto
    if (advertisedV2) return 'v2'
    return 'v1'
}

export function instrumentSupportsV2(
    supportedApis: Record<string, string> | undefined
): boolean {
    if (!supportedApis) return false
    return Object.keys(supportedApis).some((key) =>
        V2_API_MARKERS.some((marker) => key.includes(marker) || key === marker)
    )
}

export function instrumentSupportsV1(
    supportedApis: Record<string, string> | undefined
): boolean {
    if (!supportedApis) return true
    const keys = Object.keys(supportedApis)
    if (keys.length === 0) return true
    return keys.some(
        (key) =>
            key.includes('-v1') ||
            key.includes('HoldingV1') ||
            key.includes('transfer-instruction-v1') ||
            key.includes('allocation-v1')
    )
}

export type InstrumentPauseInfo = {
    id: string
    paused?: boolean
    pauseInfo?: { reason?: string; until?: string }
}

export function assertInstrumentNotPaused(
    instrument: InstrumentPauseInfo
): void {
    if (instrument.paused) {
        const reason = instrument.pauseInfo?.reason
        const until = instrument.pauseInfo?.until
        throw new Error(
            [
                `Instrument ${instrument.id} is paused`,
                reason ? `reason=${reason}` : undefined,
                until ? `until=${until}` : undefined,
            ]
                .filter(Boolean)
                .join('; ')
        )
    }
}

/** True when an OffLedger registry call failed because the V2 (or other) route is not mounted. */
export function isMissingOffLedgerEndpoint(error: unknown): boolean {
    const message =
        typeof error === 'string'
            ? error
            : error && typeof error === 'object' && 'error' in error
              ? String((error as { error: unknown }).error)
              : error instanceof Error
                ? error.message
                : JSON.stringify(error)

    return (
        /could not be found/i.test(message) ||
        /\b404\b/.test(message) ||
        /not found/i.test(message)
    )
}
