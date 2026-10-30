// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { RawConfig } from './Config.js'

export const REDACTED = '*****'

// Matches config keys that may hold a secret value. Keys ending in `Env` only
// name the environment variable that holds the secret and are safe to show.
// The postgres connection accepts arbitrary driver options, so this matches
// by key name rather than relying on the config schema.
const SECRET_KEY =
    /secret|password|passphrase|token|privatekey|^key$|^cert$|^pfx$|connectionstring/i

export function isSecretKey(key: string): boolean {
    return !key.endsWith('Env') && SECRET_KEY.test(key)
}

function redact(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(redact)
    }
    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, entry]) => [
                key,
                isSecretKey(key) ? REDACTED : redact(entry),
            ])
        )
    }
    return value
}

/**
 * Returns the config as written by the operator (before resolving values from
 * environment variables) with any inline secret values redacted.
 */
export function toDisplayConfig(rawConfig: RawConfig): Record<string, unknown> {
    return redact(rawConfig) as Record<string, unknown>
}
