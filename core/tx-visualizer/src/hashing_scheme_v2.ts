// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { mkByteArray, sha256, toHex } from './utils.js'

async function encodeInt32(value: number): Promise<Uint8Array> {
    const buffer = new ArrayBuffer(4)
    const view = new DataView(buffer)
    view.setInt32(0, value, false) // true for little-endian
    return new Uint8Array(buffer)
}

export async function computeSha256CantonHash(
    purpose: number,
    bytes: Uint8Array
) {
    const encodedPurpose = await encodeInt32(purpose)

    const hashInput = await mkByteArray(encodedPurpose, bytes)
    const hashBytes = await sha256(hashInput)
    const multiprefix = new Uint8Array([0x12, 0x20])
    return mkByteArray(multiprefix, hashBytes)
}

export async function computeMultiHashForTopology(hashes: Uint8Array[]) {
    const sortedHashes = hashes
        .slice()
        .sort((a, b) => toHex(a).localeCompare(toHex(b)))

    const numHashesBytes = await encodeInt32(sortedHashes.length)

    const concatenatedHashes = [numHashesBytes]

    for (const h of sortedHashes) {
        const lengthBytes = await encodeInt32(h.length)
        concatenatedHashes.push(lengthBytes, h)
    }

    return mkByteArray(...concatenatedHashes)
}
