// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, vi, expect } from 'vitest'
import { parseAssets, ParsedURL } from './url.js'
import type { SDKContext } from '../../init/types/context.js'
import { SDKLogger } from '../../logger/index.js'
import { SDKError, SDKErrorHandler } from '../../error/index.js'
import { SDKUtilsNamespace } from './index.js'
import { capabilities } from '../../__tests__/mocks'
import {
    HashingSchemeVersion,
    PreparedTransaction,
    type Value,
} from '@canton-network/core-ledger-proto'
import {
    TxHashingError,
    type TxHashingErrorCode,
} from '@canton-network/core-tx-hashing'
import { base64ToBytes } from './encoding.js'

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
    registryUrl: new URL('http://registry.com'),
    admin: 'adminParty:123',
    capabilities,
}

const testAsset = {
    id: 'test',
    displayName: 'test',
    symbol: 'test',
    registryUrl: new URL('http://registry.com'),
    admin: 'adminParty:123',
    capabilities,
}

const pingTx =
    'CoQGCgMyLjESATAa1QUKATDCPs4FCssFCgMyLjESQjAwODM2ZmE0NzAxNmQ4OWJmZWRlNjM5NzlhZDA0OTJkZWI3OGQ5Yzc4MDYzNWNiNDhlMTdhYWE5YjRlNGE2OTczOBoiY2FudG9uLWJ1aWx0aW4tYWRtaW4td29ya2Zsb3ctcGluZyJeCkBkZTJjYzJmOTBlYjUyMzQxNGZmNTRlODk5OTUxZGFkZDg3ODlhNGMwN2UwZjcxZjZkNmM5ZWFmNTdkNDEyYTU0EhRDYW50b24uSW50ZXJuYWwuUGluZxoEUGluZyrVAnLSAgpeCkBkZTJjYzJmOTBlYjUyMzQxNGZmNTRlODk5OTUxZGFkZDg3ODlhNGMwN2UwZjcxZjZkNmM5ZWFmNTdkNDEyYTU0EhRDYW50b24uSW50ZXJuYWwuUGluZxoEUGluZxIsCgJpZBImQiQwNGQ4ODdkZC0xNWI4LTQ5NTQtOGI3OS1hODUzODExY2U3Y2YSYAoJaW5pdGlhdG9yElM6UXYxLTAxLWFsaWNlOjoxMjIwZWUyNjI0MTkwODM0ZGRkZjI4ZjE5NDY4NWFjZWU4ZjAwY2JkZTllZTBkMjExZGFlMjc3ZjRkNzk5ODg0ZjI4ORJgCglyZXNwb25kZXISUzpRdjEtMDEtYWxpY2U6OjEyMjBlZTI2MjQxOTA4MzRkZGRmMjhmMTk0Njg1YWNlZThmMDBjYmRlOWVlMGQyMTFkYWUyNzdmNGQ3OTk4ODRmMjg5MlF2MS0wMS1hbGljZTo6MTIyMGVlMjYyNDE5MDgzNGRkZGYyOGYxOTQ2ODVhY2VlOGYwMGNiZGU5ZWUwZDIxMWRhZTI3N2Y0ZDc5OTg4NGYyODk6UXYxLTAxLWFsaWNlOjoxMjIwZWUyNjI0MTkwODM0ZGRkZjI4ZjE5NDY4NWFjZWU4ZjAwY2JkZTllZTBkMjExZGFlMjc3ZjRkNzk5ODg0ZjI4OSIiEiC8zzmuPyGPcD7usKyRMqdiVWlRskpjZ3ZiBoyD9maILhL/ARJ5ClF2MS0wMS1hbGljZTo6MTIyMGVlMjYyNDE5MDgzNGRkZGYyOGYxOTQ2ODVhY2VlOGYwMGNiZGU5ZWUwZDIxMWRhZTI3N2Y0ZDc5OTg4NGYyODkSJDUxMjFkMTIwLTNjNTMtNDEwMy04NmFhLTdhM2VhNjZlYzQ2NRpTZ2xvYmFsLWRvbWFpbjo6MTIyMGI5NTM5MWNkMDNlMTE4NzFkNTRlOTBjMjAyNTc1ZDI5ZTc2YzI2NWRkMzg4YjhhZmIwNWFhZDU0ZDY3MGRmYzYqJDhiOTBhNDQ4LTFmZmEtNDA0OS04NTNlLWY4YjRmZTg1M2RjMjCwqJjB5v+UAw=='
const topologyTx = [
    'CvEBCAEQARrqAUrnAQpPdjEtMDEtYm9iOjoxMjIwMjdlYjczZGRiODBhYTY0MWE2ZDQwZjhjY2I2MWU0MzIyMjFjZjdlZTI3NTJlMzAxZGIzMWMxYzZmMGRhZGYzNRABGlUKUXBhcnRpY2lwYW50OjoxMjIwOWIxZDBkZDhiMjVlMjAwMmE0NTJiOTlkNGJjMGRlZmVhZDY0ZmQ3YTkyNWEzY2I1MGM3MDJhMDYxNTQyNzVhZBACMjsKNxAEGiwwKjAFBgMrZXADIQCQesJGtB8HQ/zNPGhX6gG/fnapj7qC1nSAoXEMIWR3mCoDAQUEMAEQARAe',
]
// Prepared transactions of other tests in this repository
// core/tx-visualizer/src/Tx.test.ts, 'decode a base 64 encoded prepared tx'
const visualizerTx =
    'Cp8GCgMyLjESATAa8AUKATDCPukFCuYFCgMyLjESQjAwNTUwODAyZGRiMTYzNzFmNWZjNmQzNjRlNmNkNGIzMjgzYTllYjVjMGNjYjEyMWFlMzY4Y2RlYmJhZDBmYmY1NhoOQWRtaW5Xb3JrZmxvd3MiXgpAMmEzOGI5NjNmNmFiZjQ1Yjc2YzcwMmY5NzAwYmZkOTA2MDU1NTg3MmFmOTE1ZWY3ZjhmNjg3OTVlMmM4MzFiZBIUQ2FudG9uLkludGVybmFsLlBpbmcaBFBpbmcqtgJyswIKXgpAMmEzOGI5NjNmNmFiZjQ1Yjc2YzcwMmY5NzAwYmZkOTA2MDU1NTg3MmFmOTE1ZWY3ZjhmNjg3OTVlMmM4MzFiZBIUQ2FudG9uLkludGVybmFsLlBpbmcaBFBpbmcSDwoCaWQSCUIHcGluZ19pZBJdCglpbml0aWF0b3ISUDpOb3BlcmF0b3I6OjEyMjBkNDRmYzFjM2JhMGI1YmRmN2I5NTZlZTcxYmM5NGViZTJkMjMyNThkYzI2OGZkZjA4MjRmYmFlZmYyYzYxNDI0EmEKCXJlc3BvbmRlchJUOlJwYXJ0aWNpcGFudDE6OjEyMjBkNDRmYzFjM2JhMGI1YmRmN2I5NTZlZTcxYmM5NGViZTJkMjMyNThkYzI2OGZkZjA4MjRmYmFlZmYyYzYxNDI0Mk5vcGVyYXRvcjo6MTIyMGQ0NGZjMWMzYmEwYjViZGY3Yjk1NmVlNzFiYzk0ZWJlMmQyMzI1OGRjMjY4ZmRmMDgyNGZiYWVmZjJjNjE0MjQ6Tm9wZXJhdG9yOjoxMjIwZDQ0ZmMxYzNiYTBiNWJkZjdiOTU2ZWU3MWJjOTRlYmUyZDIzMjU4ZGMyNjhmZGYwODI0ZmJhZWZmMmM2MTQyNDpScGFydGljaXBhbnQxOjoxMjIwZDQ0ZmMxYzNiYTBiNWJkZjdiOTU2ZWU3MWJjOTRlYmUyZDIzMjU4ZGMyNjhmZGYwODI0ZmJhZWZmMmM2MTQyNCIiEiBr2qJTURRRnXWp6y1EyXQiB69cfe50kJw0eYN1UF39nhL1ARJ2Ck5vcGVyYXRvcjo6MTIyMGQ0NGZjMWMzYmEwYjViZGY3Yjk1NmVlNzFiYzk0ZWJlMmQyMzI1OGRjMjY4ZmRmMDgyNGZiYWVmZjJjNjE0MjQSJGYyZWM0ZDhmLWNjYzEtNDAyYi1iMjc4LTc1NTZmZGQyYjQxMhpMd2FsbGV0OjoxMjIwZTdiMjNlYTUyZWI1YzY3MmZiMGIxY2RiYzkxNjkyMmZmZWQzZGQ3Njc2YzIyM2E2MDU2NjQzMTVlMmQ0M2VkZCokYTMyODE2MmUtNzI4ZS00ZTA1LWFjNzgtYjM0ZjA3MDk4M2JhMK7Y9/LU944D'
// core/tx-visualizer/src/Tx.test.ts, 'hash from preparedTx ledger api call
// should match calculated hash': its hash is the one the Ledger API returned
const ledgerApiTx =
    'CsoHCgMyLjESATAamwcKATDCPpQHCpEHCgMyLjESQjAwMTY4Nzc3ODEwNzU3MmJlZWVjYzQzODk3MmQxODQ4M2VhZDI1MGQxZDUwYmI2MzU3ZjdmYjhmNjdkY2U3ZDYzNRoNc3BsaWNlLXdhbGxldCKCAQpAZWI2ZTAxZWZhY2MzMzk3ZTIzYzZiZThiOWJlN2RiNGJmMzc2NzIyMTE5NzRkNjllMjRiNDg5ODBlMmY5OGI3ZRIhU3BsaWNlLldhbGxldC5UcmFuc2ZlclByZWFwcHJvdmFsGhtUcmFuc2ZlclByZWFwcHJvdmFsUHJvcG9zYWwqtQNysgMKggEKQGViNmUwMWVmYWNjMzM5N2UyM2M2YmU4YjliZTdkYjRiZjM3NjcyMjExOTc0ZDY5ZTI0YjQ4OTgwZTJmOThiN2USIVNwbGljZS5XYWxsZXQuVHJhbnNmZXJQcmVhcHByb3ZhbBobVHJhbnNmZXJQcmVhcHByb3ZhbFByb3Bvc2FsElcKCHJlY2VpdmVyEks6SWJvYjo6MTIyMDViZTNiOWQxNzc1NzNmZmZiNjhlYjI0NTk4NmY4OGI5ZGY1OGQ0NGNlNTc1ODE5MDc4OTcwNTgwZDg3ZDFkYzAScgoIcHJvdmlkZXISZjpkYXBwX3VzZXJfbG9jYWxuZXQtbG9jYWxwYXJ0eS0xOjoxMjIwM2E1MmZlNWFmM2I4N2UwNjk2MTgyYWM2NjhhNmNiMzE1ZGFiNGJkYzMwZGE5ZTViNmRkYTllYjcyODc4NDIxNhJeCgtleHBlY3RlZERzbxJPUk0KSzpJRFNPOjoxMjIwYmJkMDAwYjY5ODc1NzNiOGMwOWY0NDRlNGRmNTUwOWFmODk5N2I4MzkxMDlkN2UyYzIxMmQ1NDdmMGFmMDk1MDJJYm9iOjoxMjIwNWJlM2I5ZDE3NzU3M2ZmZmI2OGViMjQ1OTg2Zjg4YjlkZjU4ZDQ0Y2U1NzU4MTkwNzg5NzA1ODBkODdkMWRjMDpkYXBwX3VzZXJfbG9jYWxuZXQtbG9jYWxwYXJ0eS0xOjoxMjIwM2E1MmZlNWFmM2I4N2UwNjk2MTgyYWM2NjhhNmNiMzE1ZGFiNGJkYzMwZGE5ZTViNmRkYTllYjcyODc4NDIxNjpJYm9iOjoxMjIwNWJlM2I5ZDE3NzU3M2ZmZmI2OGViMjQ1OTg2Zjg4YjlkZjU4ZDQ0Y2U1NzU4MTkwNzg5NzA1ODBkODdkMWRjMCIiEiDBzeNcgqLvsssBxhNx7wP9pK71TsAprgz+a8jag/Lb3RL3ARJxCklib2I6OjEyMjA1YmUzYjlkMTc3NTczZmZmYjY4ZWIyNDU5ODZmODhiOWRmNThkNDRjZTU3NTgxOTA3ODk3MDU4MGQ4N2QxZGMwEiQ5NzU4ZTQ2ZS05ZmJlLTRmOTQtOTczZC04NWQ5ZTBmMTMyNzUaU2dsb2JhbC1kb21haW46OjEyMjBiYmQwMDBiNjk4NzU3M2I4YzA5ZjQ0NGU0ZGY1NTA5YWY4OTk3YjgzOTEwOWQ3ZTJjMjEyZDU0N2YwYWYwOTUwKiQ5NGJkYmFmNS0wYjJjLTQwYmMtOTZjZC1jM2M5YTlkODQ3ZDIw+eaGkdz0jwM='
// core/signing-bitgo/src/bitgo.test.ts, TRANSACTION_TX: its hash is the one
// BitGo signed, TRANSACTION_SIGNED_MSG.payload
const bitgoTx =
    'CrYHCgMyLjESATAahwcKATDCPoAHCv0GCgMyLjESQjAwNmVlMWI3MDg4OGI1Y2E3ODZiZDU4MTc2OGMwOGYyMTA2Yjc0MzU1MGU5MDM1YTNlNmNmNTI4NGJhYjJkMTUxORoNc3BsaWNlLXdhbGxldCKCAQpAZjc5OWE1OGZhNTNkZmU0OGJhZTUyYmQ1ZGJjYzJiNTc4YTdkNGRmZWUzYWUzZjRlYjc2MzVmZTlhOGNjNjdkMxIhU3BsaWNlLldhbGxldC5UcmFuc2ZlclByZWFwcHJvdmFsGhtUcmFuc2ZlclByZWFwcHJvdmFsUHJvcG9zYWwqqgNypwMKggEKQGY3OTlhNThmYTUzZGZlNDhiYWU1MmJkNWRiY2MyYjU3OGE3ZDRkZmVlM2FlM2Y0ZWI3NjM1ZmU5YThjYzY3ZDMSIVNwbGljZS5XYWxsZXQuVHJhbnNmZXJQcmVhcHByb3ZhbBobVHJhbnNmZXJQcmVhcHByb3ZhbFByb3Bvc2FsElkKCHJlY2VpdmVyEk06SzEyMjA2OjoxMjIwNjZjM2IwZWQ3ZTQ4Nzk1NzlkNTNhMGYwNGNhYmY1NDg5NWZjNGI0MTA4NzdhZGY4OGU2MWI2ODk5OWI2ZTM4ZBJlCghwcm92aWRlchJZOldiaXRnby12YWxpZGF0b3ItMTo6MTIyMDY4NDI2MDE3ODBmZGRlZjQ2N2JhZmEyZTA1MGNhYTk5MjNhNGQyOWJmYzM0NTRjNzcxNmE3MDBlZTkyMWVmMGMSXgoLZXhwZWN0ZWREc28ST1JNCks6SURTTzo6MTIyMGYyMmE4YjhmMmQ4MTNjMjViOWE2ODRkYzRkZDUyYjUzMmEwMTc0ZDhlNzNhMTNjZGYyYmFhYmZmZjc1MTgzMzcySzEyMjA2OjoxMjIwNjZjM2IwZWQ3ZTQ4Nzk1NzlkNTNhMGYwNGNhYmY1NDg5NWZjNGI0MTA4NzdhZGY4OGU2MWI2ODk5OWI2ZTM4ZDpLMTIyMDY6OjEyMjA2NmMzYjBlZDdlNDg3OTU3OWQ1M2EwZjA0Y2FiZjU0ODk1ZmM0YjQxMDg3N2FkZjg4ZTYxYjY4OTk5YjZlMzhkOldiaXRnby12YWxpZGF0b3ItMTo6MTIyMDY4NDI2MDE3ODBmZGRlZjQ2N2JhZmEyZTA1MGNhYTk5MjNhNGQyOWJmYzM0NTRjNzcxNmE3MDBlZTkyMWVmMGMiIhIgiZHCTklv38y4B+If2FRvOAU3toMMkJ1HiW+9+4NLeKQSoAISkwEKSzEyMjA2OjoxMjIwNjZjM2IwZWQ3ZTQ4Nzk1NzlkNTNhMGYwNGNhYmY1NDg5NWZjNGI0MTA4NzdhZGY4OGU2MWI2ODk5OWI2ZTM4ZBJEMTIyMDY2YzNiMGVkN2U0ODc5NTc5ZDUzYTBmMDRjYWJmNTQ4OTVmYzRiNDEwODc3YWRmODhlNjFiNjg5OTliNmUzOGQaWWdsb2JhbC1kb21haW46OjEyMjBmMjJhOGI4ZjJkODEzYzI1YjlhNjg0ZGM0ZGQ1MmI1MzJhMDE3NGQ4ZTczYTEzY2RmMmJhYWJmZmY3NTE4MzM3OjozNS0yKiQzNGM5YzhmYi03NjJmLTQ4MjEtYWMzMy1mYWI3NWZkNWNkOWIwktLKp63ZlQM='
// Copied from core/tx-hashing/vectors/v3/v3-max-record-time.json: a prepare
// response of Canton 3.5.10 on protocol version 35 under hashing scheme V3,
// with maxRecordTime set
const v3Tx =
    'Ct8ECgMyLjESATAasAQKATDCPqkECqYECgMyLjESQjAwYjBmZDE2MDYwNjdiMDA3OTRlYjBmMzFhYWJmYjU3NjliNDBjMmFkNzVlNjg4MzA4MjQ5YTY1MzI2ZDdlZGM5ZRoMaGFzaC12ZWN0b3JzIlYKQDdhYzA2NTBlZjRkMzg2YTQyYmNiYzdmZTEyOWY0MTgwNmRhYTA0MDYzZmYwOTcwYTVhM2NkZDZmNGY4MjllNjgSC0hhc2hWZWN0b3JzGgVQbGFpbirAAXK9AQpWCkA3YWMwNjUwZWY0ZDM4NmE0MmJjYmM3ZmUxMjlmNDE4MDZkYWEwNDA2M2ZmMDk3MGE1YTNjZGQ2ZjRmODI5ZTY4EgtIYXNoVmVjdG9ycxoFUGxhaW4SYwoFb3duZXISWjpYaGFzaC12ZWN0b3JzLW93bmVyOjoxMjIwZWQzYjIxNzQ1NGJiNmRmNzE1MzlkODExOWQ2NzkyMTBlZjUyOGNhOGQzNjcxMTc3OWViMDlkNWQ3MzM3YjA5NTJYaGFzaC12ZWN0b3JzLW93bmVyOjoxMjIwZWQzYjIxNzQ1NGJiNmRmNzE1MzlkODExOWQ2NzkyMTBlZjUyOGNhOGQzNjcxMTc3OWViMDlkNWQ3MzM3YjA5NTpYaGFzaC12ZWN0b3JzLW93bmVyOjoxMjIwZWQzYjIxNzQ1NGJiNmRmNzE1MzlkODExOWQ2NzkyMTBlZjUyOGNhOGQzNjcxMTc3OWViMDlkNWQ3MzM3YjA5NSIiEiCRwVu8/ZRfekahF6ue0nlRXLjtZSzBMz6VH6pUGup65xKPAhKAAQpYaGFzaC12ZWN0b3JzLW93bmVyOjoxMjIwZWQzYjIxNzQ1NGJiNmRmNzE1MzlkODExOWQ2NzkyMTBlZjUyOGNhOGQzNjcxMTc3OWViMDlkNWQ3MzM3YjA5NRIkNWFiYzYyYjUtY2E1Zi00MTNiLWFiZTYtYWU3NWE2ZWU0OWQ4GlJ3YWxsZXQ6OjEyMjBlN2IyM2VhNTJlYjVjNjcyZmIwYjFjZGJjOTE2OTIyZmZlZDNkZDc2NzZjMjIzYTYwNTY2NDMxNWUyZDQzZWRkOjozNS0wKiQzZDllYTI4Ni0zN2M1LTRjZjQtYjAyNS1mNDVhMjZhZmRlMmYwzbz/lvrTlwNYgMvNy4fUlwM='

const isBrowserEnv = typeof process === 'undefined'
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

        let thrownError
        try {
            new ParsedURL(ctx, urlAsString)
        } catch (e) {
            thrownError = e as SDKError
        }

        expect(thrownError).toBeDefined()
        expect(thrownError).toBeInstanceOf(SDKError)
        if (thrownError) {
            const err = thrownError as SDKError
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
            expect(r.registryUrl.href).toBe('http://registry.com/')
            expect(r.id).toBe(assets[i].id)
        })
    })

    it('throws error for bad asset registry url', () => {
        const asset = {
            id: 'test',
            displayName: 'test',
            symbol: 'test',
            // deliberately invalid: registries are external input
            registryUrl: 'reg.com' as unknown as URL,
            admin: 'adminParty:123',
            capabilities,
        }

        expect(() => parseAssets(ctx, [asset])).toThrow()
    })

    it('throws error for asset missing admin party', () => {
        const asset = {
            id: 'test',
            displayName: 'test',
            symbol: 'test',
            registryUrl: new URL('http://registry.com'),
            admin: undefined as unknown as string,
            capabilities,
        }

        let thrownError
        try {
            parseAssets(ctx, [asset])
        } catch (e) {
            thrownError = e as SDKError
        }

        expect(thrownError).toBeDefined()
        expect(thrownError).toBeInstanceOf(SDKError)
        if (thrownError) {
            const err = thrownError as SDKError
            expect(err.context.type).toBe('Unexpected')
            expect(err.context.message).toBe(
                'Registry response for asset "test" is missing the "admin" (DSO) party.'
            )
        }
    })

    it('tests ping service', () => {
        const utils = new SDKUtilsNamespace({
            logger: new SDKLogger('console'),
            error: new SDKErrorHandler(new SDKLogger('console')),
        })

        const ping = utils.ping.create([
            {
                initiator: 'alice::abc',
                responder: 'bob::def',
                id: 'c5977c20-5078-46b0-ad3d-eef9b27ec981',
            },
        ])

        expect(ping).toStrictEqual([
            {
                CreateCommand: {
                    createArguments: {
                        id: 'c5977c20-5078-46b0-ad3d-eef9b27ec981',
                        initiator: 'alice::abc',
                        responder: 'bob::def',
                    },
                    templateId:
                        '#canton-builtin-admin-workflow-ping:Canton.Internal.Ping:Ping',
                },
            },
        ])
    })

    it.skipIf(isBrowserEnv)('tests hash service', async () => {
        const utils = new SDKUtilsNamespace({
            logger: new SDKLogger('console'),
            error: new SDKErrorHandler(new SDKLogger('console')),
        })

        const preparedTxHash = (
            await utils.hash.preparedTransaction(pingTx)
        ).toBase64()
        const topologyHash = await utils.hash.topologyTransaction(topologyTx)
        expect(topologyHash).toBe(
            'EiAuQ/LV6dYD1fIWldav2upEt/c9Wc0k3KbACxMMEBA5lw=='
        )
        expect(preparedTxHash).toBe(
            'Bp2sK8iqD+0g0Qh9cgmPf0Kl7XtJs710fySuuzs3LcI='
        )
    })
})

describe('hash.preparedTransaction', () => {
    const { hash } = new SDKUtilsNamespace(ctx)
    const decoded = (base64: string) =>
        PreparedTransaction.fromBinary(base64ToBytes(base64))
    const refusal = (code: TxHashingErrorCode) =>
        expect.objectContaining({
            message: expect.stringContaining(
                `prepared transaction refused: ${code}`
            ),
            context: expect.objectContaining({
                type: 'BadRequest',
                originalError: expect.objectContaining({
                    name: 'TxHashingError',
                    code,
                }),
            }),
        })
    const pingHex =
        '069dac2bc8aa0fed20d1087d72098f7f42a5ed7b49b3bd747f24aebb3b372dc2'

    it('returns the same hex as before for the wallet repo fixtures', async () => {
        // Each with the hash its own test expects, in hex
        const fixtures: [name: string, base64: string, hex: string][] = [
            ['pingTx', pingTx, pingHex],
            [
                'visualizerTx',
                visualizerTx,
                '0fc0f45865f72a061c63f6e41c3726e8ec47a60bd35fc4d094351e18866d073a',
            ],
            [
                'ledgerApiTx',
                ledgerApiTx,
                '7fdec2bf504eed04bb8e6498d37a79e891ac3dfeb4571fc0057991b9bee28902',
            ],
            [
                'bitgoTx',
                bitgoTx,
                'a57e6b4cd42f304dfc2cfe99a73aa118a8afd90fd4043fb179888fc5c1097a83',
            ],
        ]
        for (const [name, base64, hex] of fixtures) {
            const fromBase64 = await hash.preparedTransaction(base64)
            const fromMessage = await hash.preparedTransaction(decoded(base64))
            expect(fromBase64.toHex(), `${name} as base64`).toBe(hex)
            expect(fromMessage.toHex(), `${name} as a message`).toBe(hex)
        }
    })

    it('hashes under V2 through the deprecated preparedTransacation', async () =>
        expect((await hash.preparedTransacation(pingTx)).toHex()).toBe(pingHex))

    it('rejects duplicate node ids', async () => {
        const prepared = decoded(pingTx)
        const { nodes } = prepared.transaction!
        nodes.push({ ...nodes[0] })

        await expect(hash.preparedTransaction(prepared)).rejects.toThrow(
            refusal('DUPLICATE_NODE_ID')
        )
    })

    it('refuses an unknown field, in base64 or kept in a message, as the hash would not cover it', async () => {
        // Field 999 holding the varint 1, appended: protobuf decodes two
        // concatenated messages as one
        const field999 = [0xb8, 0x3e, 0x01]
        const bytes = Uint8Array.from([...base64ToBytes(pingTx), ...field999])
        const inputs = [
            btoa(String.fromCharCode(...bytes)),
            PreparedTransaction.fromBinary(bytes, { readUnknownField: true }),
        ]
        for (const input of inputs) {
            await expect(hash.preparedTransaction(input)).rejects.toThrow(
                refusal('UNKNOWN_FIELD')
            )
        }
    })

    it('refuses maxRecordTime, which V2 does not hash', async () => {
        const prepared = decoded(pingTx)
        prepared.metadata!.maxRecordTime = 1n

        await expect(hash.preparedTransaction(prepared)).rejects.toThrow(
            refusal('FIELD_NOT_COVERED_BY_SCHEME')
        )
    })

    it('reports a refusal as a BadRequest SDKError that names the code and path, with the TxHashingError as its originalError', async () => {
        const prepared = decoded(pingTx)
        prepared.transaction!.roots = []

        const error = await hash
            .preparedTransaction(prepared)
            .catch((e: unknown) => e)

        expect(error).toBeInstanceOf(SDKError)
        const { context, message } = error as SDKError<TxHashingError>
        expect(context.type).toBe('BadRequest')
        expect(context.originalError).toBeInstanceOf(TxHashingError)
        expect(context.originalError).toMatchObject({
            code: 'MISSING_FIELD',
            path: 'transaction.roots',
        })
        expect(message).toBe(
            `prepared transaction refused: MISSING_FIELD at transaction.roots: ${context.originalError!.message}`
        )
    })

    it('passes on unchanged an error that is not a refusal, such as the one protobuf-ts throws for a value it cannot encode', async () => {
        const prepared = decoded(pingTx)
        // Not a uint32, so protobuf-ts throws while encoding the message
        prepared.metadata!.mediatorGroup = 2 ** 40
        const encodingError = await (async () =>
            PreparedTransaction.toBinary(prepared))().catch((e: unknown) => e)

        expect(encodingError).toBeInstanceOf(Error)
        await expect(hash.preparedTransaction(prepared)).rejects.toStrictEqual(
            encodingError
        )
    })

    it('hashes V3 when asked', async () => {
        const converter = await hash.preparedTransaction(
            v3Tx,
            'HASHING_SCHEME_VERSION_V3'
        )
        // The hash the participant returned
        expect(converter.toHex()).toBe(
            'd11d76be5d5ffa63bdc49bc2a54536aafea6aab6ea28c3729d65e5635447e0b1'
        )
    })

    it('refuses the ping, whose argument is two values deep, with limits.maxValueDepth 1, and hashes it with 2', async () => {
        const withMaxValueDepth = (maxValueDepth: number) =>
            hash.preparedTransaction(pingTx, HashingSchemeVersion.V2, {
                limits: { maxValueDepth },
            })

        await expect(withMaxValueDepth(1)).rejects.toThrow(
            refusal('DEPTH_LIMIT_EXCEEDED')
        )
        expect((await withMaxValueDepth(2)).toHex()).toBe(pingHex)
    })

    it('hashes a value nested 101 levels deep by default, and refuses one of 102 levels', async () => {
        // The ping with its create argument replaced by `levels` nested lists
        const withArgument = (levels: number) => {
            let value: Value = {
                sum: { oneofKind: 'list', list: { elements: [] } },
            }
            for (let depth = 1; depth < levels; depth++) {
                value = {
                    sum: { oneofKind: 'list', list: { elements: [value] } },
                }
            }
            const prepared = decoded(pingTx)
            const node = prepared.transaction!.nodes[0].versionedNode
            if (
                node.oneofKind !== 'v1' ||
                node.v1.nodeType.oneofKind !== 'create'
            ) {
                throw new Error('the ping is no create')
            }
            node.v1.nodeType.create.argument = value
            return prepared
        }

        expect(
            (await hash.preparedTransaction(withArgument(101))).toHex()
        ).toMatch(/^[0-9a-f]{64}$/)
        await expect(
            hash.preparedTransaction(withArgument(102))
        ).rejects.toThrow(refusal('DEPTH_LIMIT_EXCEEDED'))
    })

    it('accepts scheme and options.limits given as undefined and hashes under V2', async () => {
        // Under exactOptionalPropertyTypes this compiles only because the
        // options allow undefined
        const converter = await hash.preparedTransaction(pingTx, undefined, {
            limits: undefined,
        })
        expect(converter.toHex()).toBe(pingHex)
    })
})
