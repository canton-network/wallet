// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** Take a base64 encoded string and return a Uint8Array of the decoded bytes */
export function fromBase64(b64: string): Uint8Array {
    const binaryString = atob(b64)
    const len = binaryString.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
}

/** Take a byte buffer (Uint8Array) and encode it into a base64 string */
export function toBase64(data: Uint8Array): string {
    let binaryString = ''
    const len = data.byteLength
    for (let i = 0; i < len; i++) {
        binaryString += String.fromCharCode(data[i])
    }
    return btoa(binaryString)
}
