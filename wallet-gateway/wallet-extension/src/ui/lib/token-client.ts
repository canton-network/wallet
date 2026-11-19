// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createProxyService } from '@webext-core/proxy-service'
import type { TokenService } from '@/background/token/service'
import { TOKEN_RPC_KEY } from '@/shared/service-keys'

let client: TokenService | undefined

export function getTokenClient(): TokenService {
    client ??= createProxyService(TOKEN_RPC_KEY)
    return client
}
