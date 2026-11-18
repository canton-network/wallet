// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'

import { templateIdOf } from './template.ts'

const ping = {
    context: {
        template: {
            packageId: 'pkg',
            moduleName: 'Canton.Internal.Ping',
            entityName: 'Ping',
        },
    },
}

describe('templateIdOf', () => {
    it('reads the template a stored descriptor replaces', () => {
        expect(templateIdOf(ping)).toEqual(ping.context.template)
    })

    it('rejects a descriptor that does not name a template', () => {
        expect(() => templateIdOf({ context: { template: {} } })).toThrow(
            /no template/
        )
        expect(() =>
            templateIdOf({
                context: {
                    template: {
                        packageId: '',
                        moduleName: 'M',
                        entityName: 'E',
                    },
                },
            })
        ).toThrow(/no template/)
    })
})
