// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** An unsigned JWT; the extension only decodes tokens. */
export function jwt(claims: Record<string, unknown>): string {
    const encode = (value: object) =>
        btoa(JSON.stringify(value))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '')
    return `${encode({ alg: 'none' })}.${encode(claims)}.sig`
}

export const inAnHour = () => Math.floor(Date.now() / 1000) + 3600
