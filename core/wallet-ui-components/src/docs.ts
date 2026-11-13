// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const DOCS_SITE = 'https://docs.canton.network'

/** A path on docs.canton.network, e.g. /appdev/deep-dives/authorization */
export type DocsSitePath = `/${string}`

/** URL of a page on docs.canton.network. `anchor` is the slug of a heading. */
export const docsSiteUrl = (path: DocsSitePath, anchor?: string): string =>
    DOCS_SITE + path + (anchor ? `#${anchor}` : '')
