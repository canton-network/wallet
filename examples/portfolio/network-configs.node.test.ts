// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { portfolioConfigSchema } from './src/lib/schemas'

const ROOT = path.resolve(import.meta.dirname, '../..')
const DOCS_DIR = path.join(ROOT, 'docs/dapp-building/examples/portfolio')
const VALIDATOR_URL = 'https://validator.example.invalid/api/validator'

const NETWORKS = [
    ['devnet', 'DevNet'],
    ['testnet', 'TestNet'],
    ['mainnet', 'MainNet'],
] as const

type Asset = {
    symbol?: string
    instrumentId?: { admin?: string; id?: string }
    registryURLs?: string[]
}

type RegistryRow = {
    name: string
    partyId: string
    url: string
}

const scanUrl = (urls: readonly string[]): string => {
    const digitalAsset = urls.filter((url) => url.includes('digitalasset.com'))
    return (
        digitalAsset.find((url) => url.includes('://scan.sv-1.')) ??
        digitalAsset[0] ??
        urls[0] ??
        ''
    )
}

const registriesFromAssets = (assets: readonly Asset[]): RegistryRow[] => {
    const amulet = assets.find(
        (asset) => asset.instrumentId?.id === 'Amulet' || asset.symbol === 'CC'
    )
    const byUrl = new Map<string, { partyId: string; symbols: string[] }>()

    for (const asset of assets) {
        if (asset === amulet) continue
        const partyId = asset.instrumentId?.admin ?? ''
        for (const url of asset.registryURLs ?? []) {
            const current = byUrl.get(url) ?? { partyId, symbols: [] }
            if (current.partyId !== partyId) {
                throw new Error(`${url} lists more than one admin`)
            }
            if (asset.symbol && !current.symbols.includes(asset.symbol)) {
                current.symbols.push(asset.symbol)
            }
            byUrl.set(url, current)
        }
    }

    return [...byUrl.entries()]
        .map(([url, entry]) => ({
            name:
                entry.symbols.length === 1
                    ? (entry.symbols[0] ?? entry.partyId)
                    : (entry.partyId.split('::')[0] ?? entry.partyId),
            partyId: entry.partyId,
            url,
        }))
        .sort(
            (left, right) =>
                left.name.localeCompare(right.name) ||
                left.url.localeCompare(right.url)
        )
}

const readNetworkConfig = (fileName: string): unknown =>
    JSON.parse(readFileSync(path.join(DOCS_DIR, fileName), 'utf8')) as unknown

describe('Splice Portfolio network configs', () => {
    const assets = JSON.parse(
        readFileSync(path.join(ROOT, 'api-specs/assets.json'), 'utf8')
    ) as Record<string, Asset[]>

    it.each(NETWORKS)(
        '%s config matches assets.json and the portfolio schema',
        (fileName, assetKey) => {
            const raw = readNetworkConfig(`config.${fileName}.json`)
            const parsed = portfolioConfigSchema.parse(raw)
            const networkAssets = assets[assetKey] ?? []
            const amulet = networkAssets.find(
                (asset) =>
                    asset.instrumentId?.id === 'Amulet' || asset.symbol === 'CC'
            )
            const expectedRegistries = registriesFromAssets(networkAssets)

            expect(parsed.amulet.validatorUrl).toBe(VALIDATOR_URL)
            expect(parsed.token.validatorUrl).toBe(VALIDATOR_URL)
            expect(parsed.amulet.registry).toBe(
                scanUrl(amulet?.registryURLs ?? [])
            )
            expect(parsed.token.registries).toEqual(expectedRegistries)
            expect(raw).not.toHaveProperty('signingWorker')
        }
    )

    it('omits a blank registry party id', () => {
        const parsed = portfolioConfigSchema.parse({
            amulet: {
                validatorUrl: VALIDATOR_URL,
                registry: 'https://scan.example.invalid/registry/',
            },
            token: {
                validatorUrl: VALIDATOR_URL,
                registries: [
                    {
                        name: 'Example',
                        partyId: '',
                        url: 'https://registry.example.invalid/',
                    },
                ],
            },
        })

        expect(parsed.token.registries[0]?.partyId).toBeUndefined()
    })

    it('accepts a registry with only a url', () => {
        const parsed = portfolioConfigSchema.parse({
            amulet: {
                validatorUrl: VALIDATOR_URL,
                registry: 'https://scan.example.invalid/registry/',
            },
            token: {
                validatorUrl: VALIDATOR_URL,
                registries: [{ url: 'https://registry.example.invalid/' }],
            },
        })

        expect(parsed.token.registries).toEqual([
            { url: 'https://registry.example.invalid/' },
        ])
    })

    it.each([null, {}, { amulet: {}, token: {} }])('rejects %j', (raw) => {
        expect(portfolioConfigSchema.safeParse(raw).success).toBe(false)
    })
})
