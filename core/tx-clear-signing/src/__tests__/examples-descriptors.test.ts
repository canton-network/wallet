// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'

import { clearSign, verifySignatures, type Descriptor } from '../index.ts'
import { REFERENCE_SIGNER, TRUSTED_KEYS } from '../trusted-keys.ts'
import { builtinPingCreate } from './fixtures/ping.ts'
import allocateOnLocalNet from './fixtures/token-standard/amulet-v2-allocation-factory-allocate.json'
import { hashEither, intentText, shown } from './helpers.ts'

/** splice-amulet 0.1.25, which the example ExternalPartyAmuletRules descriptor is bound to. */
const AMULET_0_1_25 =
    'c5203dee918350373a993328e345872113bd5f8c8f0f51967014d813e583ae66'

// The example directory is what a user uploads. Every file is passed: descriptors for templates
// the transaction does not use are ignored.
const descriptorFiles = {
    ...import.meta.glob<Descriptor>('../../examples/descriptors/*.json', {
        eager: true,
        import: 'default',
    }),
    ...import.meta.glob<Descriptor>(
        '../../examples/descriptors/splice/*.json',
        { eager: true, import: 'default' }
    ),
}

function exampleDescriptors(): Descriptor[] {
    return Object.values(descriptorFiles)
}

async function described(tx: string) {
    return clearSign(tx, exampleDescriptors(), await hashEither(tx))
}

const pingPackageId =
    'de2cc2f90eb523414ff54e899951dadd8789a4c07e0f71f6d6c9eaf57d412a54'

describe('example descriptors', () => {
    it('is signed by the reference key', async () => {
        for (const [name, json] of Object.entries(descriptorFiles)) {
            const verified = await verifySignatures(json, TRUSTED_KEYS)
            expect(verified, name).toEqual({
                ok: true,
                signers: [REFERENCE_SIGNER],
            })
        }
    })

    it('fully describes the builtin Ping create', async () => {
        const descriptor = exampleDescriptors().find(
            (d) => d.context.template.entityName === 'Ping'
        )

        expect(descriptor?.context.template).toEqual({
            packageId: pingPackageId,
            moduleName: 'Canton.Internal.Ping',
            entityName: 'Ping',
        })
        expect((await described(builtinPingCreate)).complete).toBe(true)
    })

    it('describes a captured allocation on the package the example is bound to', async () => {
        const result = await described(allocateOnLocalNet.preparedTransaction)
        const op = result.operations[0]

        expect(result.complete).toBe(true)
        expect(result.operations).toHaveLength(1)
        expect(op).toMatchObject({
            kind: 'exercise',
            choiceId: 'AllocationFactory_Allocate',
            status: 'described',
            template: {
                packageId: AMULET_0_1_25,
                moduleName: 'Splice.ExternalPartyAmuletRules',
                entityName: 'ExternalPartyAmuletRules',
            },
            interface: {
                packageId:
                    '9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c',
                moduleName: 'Splice.Api.Token.AllocationInstructionV2',
                entityName: 'AllocationFactory',
            },
        })
        expect(intentText(op)).toContain('of 1 legs')
        const legs = shown(op?.fields.find((f) => f.label === 'Legs'))
        expect(JSON.parse(legs as string)).toMatchObject([
            { side: 'SenderSide', instrumentId: 'Amulet' },
        ])
    })
})
