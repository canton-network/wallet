// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { toBase64, toHex } from './bytes.ts'

/** A hash, to read in base64 or hex */
export class Converter {
    constructor(private readonly hash: Uint8Array) {}

    public toHex(): string {
        return toHex(this.hash)
    }

    public toBase64(): string {
        return toBase64(this.hash)
    }
}
