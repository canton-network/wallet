// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import manifest from '../../../docs/docs-sync.json' with { type: 'json' }

const DOCS_SITE = 'https://docs.canton.network'

/** A path on docs.canton.network, e.g. /appdev/deep-dives/authorization */
type DocsSitePath = `/${string}`

/** The docs pages in this repo that the UI links to, see docs/README.md */
export type DocsPage =
    | 'docs/wallet-gateway/automation/service-account-automations.mdx'
    | 'docs/wallet-gateway/operate/configure.mdx'
    | 'docs/wallet-gateway/operate/networks-and-identity.mdx'
    | 'docs/wallet-gateway/operate/self-issued-authentication.mdx'
    | 'docs/wallet-gateway/use/approve-and-sign.mdx'
    | 'docs/wallet-gateway/use/party-management.mdx'

// Doesn't compile if a page above isn't published through docs-sync.json
const publishedPages = manifest satisfies Record<DocsPage, string>

/** URL of a page on docs.canton.network. `anchor` is the slug of a heading. */
export const docsSiteUrl = (path: DocsSitePath, anchor?: string): string =>
    DOCS_SITE + path + (anchor ? `#${anchor}` : '')

/** The page's path on the site, taken from docs/docs-sync.json */
const docsSitePath = (page: DocsPage): DocsSitePath =>
    `/${publishedPages[page].replace(/^docs-main\//, '').replace(/\.mdx$/, '')}`

/**
 * URL of a docs page in this repo, with its path on the site taken from
 * docs-sync.json so the links follow when a page moves
 */
export const docsUrl = (page: DocsPage, anchor?: string): string =>
    docsSiteUrl(docsSitePath(page), anchor)
