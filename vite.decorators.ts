// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import swc from '@rollup/plugin-swc'
import { withFilter } from 'vite'

export function standardDecorators(include: string) {
    return withFilter(
        swc({
            include,
            swc: {
                jsc: {
                    target: 'es2022',
                    parser: { syntax: 'typescript', decorators: true },
                    transform: { decoratorVersion: '2023-11' },
                },
            },
        }),
        { transform: { code: '@' } }
    )
}
