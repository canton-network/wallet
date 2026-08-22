// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ProxyServiceKey } from '@webext-core/proxy-service'
import type { Methods as UserRpcMethods } from '@/entrypoints/background/user/rpc-gen/index'
import type { Methods as DappRpcMethods } from '@/entrypoints/background/dapp/rpc-gen/index'
import { AuthService } from '@/entrypoints/background/auth-service'

export const USER_RPC_KEY =
    'user-rpc-service' as ProxyServiceKey<UserRpcMethods>

export const DAPP_RPC_KEY =
    'dapp-rpc-service' as ProxyServiceKey<DappRpcMethods>

export const AUTH_SERVICE_KEY = 'auth-service' as ProxyServiceKey<
    typeof AuthService
>
