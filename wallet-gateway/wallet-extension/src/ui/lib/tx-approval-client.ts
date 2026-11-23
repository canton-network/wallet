// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createProxyService } from '@webext-core/proxy-service'

import type { TxApprovalService } from '@/background/tx-approval.ts'
import { TX_APPROVAL_RPC_KEY } from '@/shared/service-keys.ts'

let client: TxApprovalService | undefined

export function getTxApprovalClient(): TxApprovalService {
    client ??= createProxyService(TX_APPROVAL_RPC_KEY)
    return client
}
