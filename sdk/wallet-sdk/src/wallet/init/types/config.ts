// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { URLInput } from '../../namespace/utils/url.js'
import { TokenProviderConfig } from '@canton-network/core-wallet-auth'

export type RegistryAuth = TokenProviderConfig | 'none'

type RegistryAuthConfig = {
    /**
     * Authentication for token-standard registry requests.
     * Use 'none' for public registries. When omitted, defaults to auth.
     * Does not affect validator or scan authentication.
     */
    registryAuth?: RegistryAuth
}

export type AmuletConfig = RegistryAuthConfig & {
    validatorUrl?: URLInput
    scanApiUrl: URLInput
    auth: TokenProviderConfig
    registryUrl: URLInput
}

export type TokenConfig = RegistryAuthConfig & {
    validatorUrl?: URLInput
    auth: TokenProviderConfig
    registries: URLInput[]
}

export type AssetConfig = RegistryAuthConfig & {
    auth: TokenProviderConfig
    registries: URLInput[]
}

export type EventsConfig = {
    websocketURL: URLInput
    auth: TokenProviderConfig
}
