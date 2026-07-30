// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { vi } from 'vitest'

const execute = vi.fn().mockResolvedValue({
    completionOffset: 100,
})
const sign = vi.fn().mockReturnValue({ execute })
const prepare = vi.fn().mockReturnValue({ sign })
const create = vi.fn().mockReturnValue({ sign })

const sdk = {
    ledger: {
        acsReader: {
            readJsContracts: vi.fn(),
        },
        prepare,
    },
    keys: {
        generate: vi.fn().mockReturnValue({
            publicKey: 'test-public-key',
            privateKey: 'test-private-key',
        }),
    },
    testToken: {
        create: {
            rules: vi.fn(),
        },
    },
    party: {
        external: {
            create,
        },
    },
}

export const mock = {
    sdk,
    prepare,
    sign,
    execute,
    create,
}
