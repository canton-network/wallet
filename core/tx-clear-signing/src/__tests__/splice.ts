// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Captured Splice fixtures for splice-contracts.test.ts, and the reference descriptors those tests
// describe them with. Each fixture is a prepared transaction from a local Canton.

import { type Descriptor, parseDescriptor } from '../descriptor.js'

interface Fixture {
    id: string
    preparedTransaction: string
    preparedTransactionHash: string
    hashingSchemeVersion: string
}

const fixtureFiles = import.meta.glob<Fixture>('./fixtures/splice/*.json', {
    eager: true,
    import: 'default',
})
const descriptorFiles = import.meta.glob(
    '../../examples/descriptors/splice/*.json',
    { eager: true, import: 'default' }
)

export const capturedIds = Object.values(fixtureFiles).map((f) => f.id)

export function captured(id: string): Fixture {
    const fixture = fixtureFiles[`./fixtures/splice/${id}.json`]
    if (!fixture) throw new Error(`no captured fixture '${id}'`)
    return fixture
}

export const spliceDescriptors: Descriptor[] = Object.values(
    descriptorFiles
).map((json) => parseDescriptor(json))

/** `descriptor`, bound to `packageId`: a capture prepared on another version of the package. */
export function rebind(descriptor: Descriptor, packageId: string): Descriptor {
    return {
        ...descriptor,
        context: {
            template: { ...descriptor.context.template, packageId },
        },
    }
}

// The parties the fixtures were prepared with.
const PARTICIPANT =
    '1220d44fc1c3ba0b5bdf7b956ee71bc94ebe2d23258dc268fdf0824fbaeff2c61424'
export const ALICE = `csalice::${PARTICIPANT}`
export const BOB = `csbob::${PARTICIPANT}`
export const PROVIDER = `csprovider::${PARTICIPANT}`
