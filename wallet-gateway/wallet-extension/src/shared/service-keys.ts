// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ProxyServiceKey } from '@webext-core/proxy-service'

import type { DappService } from '@/background/controllers/dapp/dispatch.ts'
import type { Methods as UserRpcMethods } from '@/background/controllers/user/rpc-gen/index.ts'
import type { SiteApprovalService } from '@/background/site-approval.ts'
import type { TokenService } from '@/background/token/service.ts'
import type { TxApprovalService } from '@/background/tx-approval.ts'

/** The user API, called by the extension pages. */
export const USER_RPC_KEY =
    'user-rpc-service' as ProxyServiceKey<UserRpcMethods>

/** The dApp API dispatcher, called by the content script. */
export const DAPP_RPC_KEY = 'dapp-rpc-service' as ProxyServiceKey<DappService>

/**
 * The read-only token API, called by the extension pages. The background
 * builds the wallet SDK, so the user's token stays there.
 */
export const TOKEN_RPC_KEY =
    'token-rpc-service' as ProxyServiceKey<TokenService>

/** Approves or rejects a site's `connect`, called by the approval page. */
export const SITE_APPROVAL_RPC_KEY =
    'site-approval-rpc-service' as ProxyServiceKey<SiteApprovalService>

/** Approves or rejects a dApp's transaction, called by the approval page. */
export const TX_APPROVAL_RPC_KEY =
    'tx-approval-rpc-service' as ProxyServiceKey<TxApprovalService>
