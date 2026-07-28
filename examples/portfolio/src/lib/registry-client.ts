// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { TokenStandardClient } from '@canton-network/core-token-standard'
import type { AccessTokenProvider } from '@canton-network/core-wallet-auth'
import { pino } from 'pino'
import { normalizeRegistryUrl } from '@utils/registry'

const logger = pino({ name: 'example-portfolio-registry', level: 'debug' })
const registryClients = new Map<string, TokenStandardClient>()

const noAuthAccessTokenProvider: AccessTokenProvider = {
    async getAccessToken() {
        return ''
    },
    async getAuthContext() {
        return {
            accessToken: '',
            userId: '',
        }
    },
}

export const resolveRegistryClient = (
    registryUrl: string
): TokenStandardClient => {
    const normalizedUrl = normalizeRegistryUrl(registryUrl)
    const cached = registryClients.get(normalizedUrl)
    if (cached) return cached

    const client = new TokenStandardClient(
        normalizedUrl,
        logger,
        noAuthAccessTokenProvider
    )
    registryClients.set(normalizedUrl, client)
    return client
}

export const fetchRegistryInfo = (registryUrl: string) =>
    resolveRegistryClient(registryUrl).get('/registry/metadata/v1/info')
