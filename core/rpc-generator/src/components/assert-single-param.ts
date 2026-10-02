// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { FHook } from '@open-rpc/generator/build/components/types'

// Generated clients and controllers pass the whole JSON-RPC `params` as a single argument.
export const assertSingleParam: FHook = async (
    _dest,
    _from,
    _component,
    openrpcDocument
): Promise<void> => {
    const invalid = openrpcDocument.methods.flatMap((method) =>
        'params' in method && method.params.length > 1 ? [method.name] : []
    )
    if (invalid.length > 0) {
        throw new Error(
            `Methods must declare at most one param: ${invalid.join(', ')}`
        )
    }
}
