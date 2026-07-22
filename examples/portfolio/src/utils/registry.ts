// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpUrl } from '@canton-network/core-types'

export const normalizeRegistryUrl = (registryUrl: string): string => {
    const normalized = new URL(registryUrl.trim())
    normalized.pathname = normalized.pathname
        .replace(/\/+$/, '')
        .replace(/\/registry$/, '')
    normalized.search = ''
    normalized.hash = ''
    return normalized.toString().replace(/\/+$/, '')
}

export const isInsecureRegistryUrl = (registryUrl: string): boolean => {
    const result = HttpUrl.safeParse(registryUrl)
    return result.success && new URL(result.data).protocol === 'http:'
}
