// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { queryOptions } from '@tanstack/react-query'
import { queryKeys } from '@/ui/lib/query/keys'
import { getUserClient } from '@/ui/lib/user-client'

/** The configured networks. */
export const networksQuery = () =>
    queryOptions({
        queryKey: queryKeys.networks.list(),
        queryFn: async () =>
            (await getUserClient().request({ method: 'listNetworks' }))
                .networks,
    })
