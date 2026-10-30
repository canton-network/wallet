// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** Bytes as lower case hex, two digits each, as the tests and vectors write hashes */
export function toHex(bytes: Uint8Array): string {
    let hex = ''
    for (const byte of bytes) hex += byte.toString(16).padStart(2, '0')
    return hex
}
