// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'

import { docsUrl } from './docs.ts'

describe('docsUrl', () => {
    it('links a page by its path on the site from docs-sync.json', () => {
        expect(
            docsUrl('docs/wallet-gateway/use/party-management.mdx', 'log-in')
        ).toBe(
            'https://docs.canton.network/integrations/wallet-gateway/use/party-management#log-in'
        )
    })
})
