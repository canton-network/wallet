// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createProxyService } from '@webext-core/proxy-service'
import type { SiteApprovalService } from '@/background/site-approval'
import { SITE_APPROVAL_RPC_KEY } from '@/shared/service-keys'

let client: SiteApprovalService | undefined

export function getSiteApprovalClient(): SiteApprovalService {
    client ??= createProxyService(SITE_APPROVAL_RPC_KEY)
    return client
}
