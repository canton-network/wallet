// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'

import manifest from '../../../../../docs/docs-sync.json' with { type: 'json' }
import * as constants from './constants.ts'

// The pages of the links are checked at compile time (DocsPage), their anchors here

// Vite bundles the pages into the test, so the browser project reads them too
const sources = import.meta.glob('../../../../../docs/**/*.mdx', {
    eager: true,
    import: 'default',
    query: '?raw',
}) as Record<string, string>

// docs-main/integrations/foo.mdx -> /integrations/foo
const sourceBySitePath = new Map(
    Object.entries(manifest).map(([source, published]) => [
        `/${published.replace(/^docs-main\//, '').replace(/\.mdx$/, '')}`,
        source,
    ])
)

// The heading ids docs.canton.network generates, e.g. `auth` vs `adminAuth` -> auth-vs-adminauth
const headingSlug = (heading: string) =>
    heading
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s/_-]/gu, '')
        .trim()
        .replace(/\s+/g, '-')

const headingSlugs = (mdx: string) =>
    [...mdx.matchAll(/^#{1,6}\s+(.+)$/gm)].map(([, heading]) =>
        headingSlug(heading!)
    )

const anchoredLinks = Object.values(constants)
    .flatMap((value) =>
        typeof value === 'object' && value !== null
            ? Object.values(value)
            : [value]
    )
    .filter(
        (value): value is string =>
            typeof value === 'string' &&
            value.startsWith('https://docs.canton.network/') &&
            value.includes('#')
    )

describe('docs links', () => {
    it('finds the links with an anchor', () => {
        expect(anchoredLinks.length).toBeGreaterThan(5)
    })

    it.each(anchoredLinks)('%s points to a heading of its page', (url) => {
        const { pathname, hash } = new URL(url)
        const source =
            sources[`../../../../../${sourceBySitePath.get(pathname)}`]

        expect(headingSlugs(source ?? '')).toContain(hash.slice(1))
    })
})
