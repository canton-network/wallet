// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest'
import { stopRegistry } from '.'

const mocks = vi.hoisted(() => {
    const use = vi.fn().mockReturnThis()
    const close = vi.fn()
    const listen = vi.fn().mockReturnValue({
        close,
    })
    const json = vi.fn()

    const expressFactory = vi.fn(() => ({
        use,
        listen,
    }))

    const initOperatorParty = vi.fn()
    const vetDar = vi.fn()

    return {
        use,
        close,
        listen,
        json,
        expressFactory,
        initOperatorParty,
        vetDar,
    }
})

vi.mock('express', () => {
    const defaultFn = () => mocks.expressFactory()
    defaultFn.json = mocks.json
    return {
        default: defaultFn,
    }
})

vi.mock('./common/operator', () => ({
    initOperatorParty: mocks.initOperatorParty,
    operator: {
        party: 'operator-party',
        keys: {
            privateKey: 'operator-private-key',
        },
    },
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
            vetDar: mocks.vetDar,
        },
    },
}))

describe('entry file', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    it("shouldn't do anything", async () => {
        stopRegistry()
        expect(mocks.close).not.toHaveBeenCalled()
    })

    it('should initialize the app and start listening', async () => {
        const { startRegistry } = await import('.')

        await startRegistry()

        expect(mocks.initOperatorParty).toHaveBeenCalledOnce()
        expect(mocks.json).toHaveBeenCalledOnce()
        expect(mocks.use).toHaveBeenCalledTimes(6)
        expect(mocks.listen).toHaveBeenCalledOnce()
        expect(mocks.listen).toHaveBeenCalledWith(5634, expect.any(Function))
        expect(mocks.vetDar).not.toHaveBeenCalled()
    })

    it('should properly close the server', async () => {
        const { startRegistry, stopRegistry } = await import('.')

        await startRegistry()

        expect(mocks.close).not.toHaveBeenCalled()

        stopRegistry()

        expect(mocks.close).toHaveBeenCalledOnce()
    })
})
