// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { URLInput } from '../../namespace/utils/url.js'
import { TokenProviderConfig } from '@canton-network/core-wallet-auth'
import type { TokenApiVersionPreference } from '@canton-network/core-token-standard'

export type AmuletConfig = {
    validatorUrl?: URLInput
    scanApiUrl: URLInput
    auth: TokenProviderConfig
    registryUrl: URLInput
}

export type TokenConfig = {
    validatorUrl?: URLInput
    auth: TokenProviderConfig
    registries: URLInput[]
    /** Default token-standard API major version preference. Default: 'auto'. */
    apiVersion?: TokenApiVersionPreference
}

export type AssetConfig = {
    auth: TokenProviderConfig
    registries: URLInput[]
}

export type EventsConfig = {
    websocketURL: URLInput
    auth: TokenProviderConfig
}
