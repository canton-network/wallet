// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest'
import {
    base64ToBytes,
    bytesToBase64,
    hexToBytes,
    bytesToHex,
    utf8ToBytes,
    bytesToUtf8,
    Base64String,
    HexString,
} from './index'

const utf8String = 'Hello World'
const base64Encoded = 'SGVsbG8gV29ybGQ='
const hexEncoded = '48656c6c6f20576f726c64'
const expectedByteArray = new Uint8Array([
    72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100,
])

describe('encoding', () => {
    describe('decodeToByteArray', () => {
        it('should decode base64 to Uint8Array', () => {
            const result = base64ToBytes(base64Encoded)
            expect(result).toEqual(expectedByteArray)
        })

        it('should decode hex to Uint8Array', () => {
            const result = hexToBytes(hexEncoded)
            expect(result).toEqual(expectedByteArray)
        })
    })

    describe('decodeToUtf8', () => {
        it('should decode base64 to UTF-8 string', () => {
            const result = bytesToUtf8(base64ToBytes(base64Encoded))
            expect(result).toEqual(utf8String)
        })

        it('should decode hex to UTF-8 string', () => {
            const result = bytesToUtf8(hexToBytes(hexEncoded))
            expect(result).toEqual(utf8String)
        })
    })

    describe('encodeToBase64', () => {
        it('should encode UTF-8 string to base64', () => {
            const result = bytesToBase64(utf8ToBytes(utf8String))
            expect(result).toEqual(base64Encoded)
        })

        it('should encode Uint8Array to base64', () => {
            const result = bytesToBase64(expectedByteArray)
            expect(result).toEqual(base64Encoded)
        })
    })

    describe('encodeToHex', () => {
        it('should encode UTF-8 string to hex', () => {
            const result = bytesToHex(utf8ToBytes(utf8String))
            expect(result).toEqual(hexEncoded)
        })

        it('should encode Uint8Array to hex', () => {
            const result = bytesToHex(expectedByteArray)
            expect(result).toEqual(hexEncoded)
        })
    })

    describe('EncStr classes', () => {
        it('should convert Base64String to HexString and back', () => {
            const base64Str = new Base64String(utf8ToBytes(utf8String))
            const hexStr = base64Str.asHex()
            const backToBase64 = hexStr.asBase64()

            expect(base64Encoded).toEqual(base64Str.asString())
            expect(base64Str.asString()).toEqual(backToBase64.asString())
        })

        it('should convert HexString to Base64String and back', () => {
            const hexStr = new HexString(utf8ToBytes(utf8String))
            const base64Str = hexStr.asBase64()
            const backToHex = base64Str.asHex()

            expect(hexEncoded).toEqual(hexStr.asString())
            expect(hexStr.asString()).toEqual(backToHex.asString())
        })

        it('should test the static fromBytes and fromString methods', () => {
            const base64FromBytes = Base64String.fromBytes(expectedByteArray)
            const base64FromString = Base64String.fromString(utf8String)

            expect(base64FromBytes.asString()).toEqual(base64Encoded)
            expect(base64FromString.asString()).toEqual(base64Encoded)

            const hexFromBytes = HexString.fromBytes(expectedByteArray)
            const hexFromString = HexString.fromString(utf8String)

            expect(hexFromBytes.asString()).toEqual(hexEncoded)
            expect(hexFromString.asString()).toEqual(hexEncoded)
        })
    })
})
