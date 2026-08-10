// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest'

const use = vi.fn().mockReturnThis()
const listen = vi.fn()
const json = vi.fn()

const expressFactory = vi.fn(() => ({
    use,
    listen,
}))

const initOperatorParty = vi.fn()
const vetDar = vi.fn()

vi.mock('express', () => {
    const defaultFn = () => expressFactory()
    defaultFn.json = json
    return {
        default: defaultFn,
    }
})

vi.mock('./common/operator', () => ({
    initOperatorParty,
}))

vi.mock('./common/sdk', () => ({
    default: {},
}))

vi.mock('./api/metadata/index.js', () => ({
    default: 'metadataRouter',
}))

vi.mock('./api/transfer-instruction/index.js', () => ({
    default: 'transferInstructionRouter',
}))

vi.mock('./api/allocation/index.js', () => ({
    default: 'allocationRouter',
}))

vi.mock('./api/allocation-instruction/index.js', () => ({
    default: 'allocationInstructionRouter',
}))

vi.mock('@canton-network/core-splice-codegen', () => ({
    TestToken: {
        utils: {
            vetDar,
        },
    },
}))

describe('entry file', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should initialize the app and start listening', async () => {
        await import('./index')

        expect(initOperatorParty).toHaveBeenCalledOnce()
        expect(json).toHaveBeenCalledOnce()
        expect(use).toHaveBeenCalledTimes(6)
        expect(listen).toHaveBeenCalledOnce()
        expect(listen).toHaveBeenCalledWith(5634, expect.any(Function))
        expect(vetDar).not.toHaveBeenCalled()
    })
})
