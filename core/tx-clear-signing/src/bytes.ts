// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** Decodes standard base64. `atob` is available in Node and in the browser. */
export function fromBase64(b64: string): Uint8Array {
    const binaryString = atob(b64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
}

/** Encodes bytes as standard base64. `btoa` is available in Node and in the browser. */
export function toBase64(data: Uint8Array): string {
    let binaryString = ''
    for (let i = 0; i < data.byteLength; i++) {
        binaryString += String.fromCharCode(data[i])
    }
    return btoa(binaryString)
}
