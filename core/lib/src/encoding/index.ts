// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// base64 conversions
export function base64ToBytes(input: string): Uint8Array {
    const binaryString = atob(input)
    const bytes = new Uint8Array(binaryString.length)

    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
}
export function bytesToBase64(bytes: Uint8Array): string {
    // using browser + node support
    let binaryString = ''
    for (let i = 0; i < bytes.length; i++) {
        binaryString += String.fromCharCode(bytes[i])
    }
    return btoa(binaryString)
}

// hex conversions
export function hexToBytes(input: string): Uint8Array {
    const byteLength = input.length / 2
    const bytes = new Uint8Array(byteLength)

    for (let i = 0; i < byteLength; i++) {
        bytes[i] = parseInt(input.substr(i * 2, 2), 16)
    }
    return bytes
}
export function bytesToHex(bytes: Uint8Array): string {
    let hexString = ''
    for (let i = 0; i < bytes.length; i++) {
        const hex = bytes[i].toString(16).padStart(2, '0')
        hexString += hex
    }
    return hexString.toLocaleLowerCase('en-US')
}

// utf8 conversions
export function utf8ToBytes(input: string): Uint8Array {
    const encoder = new TextEncoder()
    return encoder.encode(input)
}

export function bytesToUtf8(bytes: Uint8Array): string {
    const decoder = new TextDecoder()
    return decoder.decode(bytes)
}

// helper classes for type safety and ergonomic conversions between base64, hex, and bytes
class EncodedString {
    constructor(protected readonly value: Uint8Array) {}

    static fromBytes<T extends EncodedString>(
        this: new (bytes: Uint8Array) => T,
        bytes: Uint8Array
    ): T {
        return new this(bytes)
    }

    static fromString<T extends EncodedString>(
        this: new (bytes: Uint8Array) => T,
        str: string
    ): T {
        return new this(utf8ToBytes(str))
    }

    asBytes(): Uint8Array {
        return this.value
    }
}

export class Base64String extends EncodedString {
    asString(): string {
        return bytesToBase64(this.value)
    }

    asHex(): HexString {
        return new HexString(this.value)
    }
}

export class HexString extends EncodedString {
    asString(): string {
        return bytesToHex(this.value)
    }

    asBase64(): Base64String {
        return new Base64String(this.value)
    }
}
