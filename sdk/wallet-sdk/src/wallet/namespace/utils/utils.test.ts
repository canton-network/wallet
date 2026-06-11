// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, vi, expect } from 'vitest'
import { parseAssets, ParsedURL } from './url.js'
import { SDKContext } from '../../sdk.js'
import { SDKLogger } from '../../logger/index.js'
import { SDKError, SDKErrorHandler } from '../../error/index.js'

const makeProvider = (overrides: Record<string, unknown> = {}) => ({
    request: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    off: vi.fn(),
    ...overrides,
})

const ctx: SDKContext = {
    ledgerProvider: makeProvider(),
    userId: 'ledger-api-user',
    logger: new SDKLogger('console'),
    error: new SDKErrorHandler(new SDKLogger('console')),
    defaultSynchronizerId: 'synchronizerId',
}

const amuletAsset = {
    id: 'Amulet',
    displayName: 'Amulet',
    symbol: 'CC',
    registryUrl: 'http://registry.com',
    admin: 'adminParty:123',
}

const testAsset = {
    id: 'test',
    displayName: 'test',
    symbol: 'test',
    registryUrl: 'http://registry.com',
    admin: 'adminParty:123',
}

describe('utils package', () => {
    it('tests ParsedURL with string input', () => {
        const urlAsString = 'http://registry.com/path'
        const parsedUrlAsString = new ParsedURL(ctx, urlAsString)
        expect(parsedUrlAsString.href).toBe('http://registry.com/path')
        expect(parsedUrlAsString).toBeInstanceOf(URL)
    })

    it('tests ParsedURL with URL input', () => {
        const urlAsString = new URL('http://registry.com/path')
        const parsedUrlAsString = new ParsedURL(ctx, urlAsString)
        expect(parsedUrlAsString.href).toBe('http://registry.com/path')
        expect(parsedUrlAsString).toBeInstanceOf(URL)
    })

    it('tests ParsedURL with bad input', () => {
        const urlAsString = 'registry.com'

        try {
            new ParsedURL(ctx, urlAsString)
        } catch (e) {
            expect(e).toBeInstanceOf(SDKError)
            const err = e as SDKError
            expect(err.context.type).toBe('BadRequest')
            expect(err.context.message).toBe(
                'Invalid URL provided registry.com.'
            )
        }
    })

    it('parses assets with valid registry urls', () => {
        const assets = [amuletAsset, testAsset]
        const result = parseAssets(ctx, assets)
        expect(result).toHaveLength(2)
        result.forEach((r, i) => {
            expect(r.registryUrl).toBeInstanceOf(ParsedURL)
            expect(r.registryUrl.href).toBe(assets[i].registryUrl + '/')
            expect(r.id).toBe(assets[i].id)
        })
    })

    it('throws error for bad asset registry url', () => {
        const asset = {
            id: 'test',
            displayName: 'test',
            symbol: 'test',
            registryUrl: 'reg.com',
            admin: 'adminParty:123',
        }

        expect(() => parseAssets(ctx, [asset])).toThrow()
    })
})
