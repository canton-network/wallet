// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { QueryClient } from '@tanstack/react-query'

export function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            // The pages talk to the background, not the network, so the
            // browser's offline state must never pause a request.
            queries: { staleTime: 5_000, retry: 1, networkMode: 'always' },
            mutations: { networkMode: 'always' },
        },
    })
}
