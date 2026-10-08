// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import swc from '@rollup/plugin-swc'

/**
 * Transforms standard decorators (and `accessor`) with SWC, as oxc does not
 * transform them. Only files containing a `@` are passed to SWC.
 */
export function standardDecorators(include: string) {
    const { transform, ...plugin } = swc({
        include,
        swc: {
            jsc: {
                target: 'es2022',
                parser: { syntax: 'typescript', decorators: true },
                transform: { decoratorVersion: '2023-11' },
            },
        },
    })
    // The object hook with a filter is what `withFilter` of vite 8 and
    // rolldown-vite would add, but that export is missing in vite 7.
    return {
        ...plugin,
        transform: { filter: { code: '@' }, handler: transform },
    } as typeof plugin
}
