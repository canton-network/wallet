// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InternalLedgerNamespace } from './namespace'
import * as mock from '../../../__test__/mocks'
import { LedgerCommonSchemas } from '@canton-network/core-ledger-client-types'

const { ledgerProvider, ctx } = mock

const { v4 } = vi.hoisted(() => {
    const v4 = vi.fn()

    return {
        v4,
    }
})

vi.mock('uuid', () => ({
    v4,
}))

describe('Internal Leger Namespace', () => {
    let internal: InternalLedgerNamespace

    beforeEach(() => {
        vi.clearAllMocks()
        ledgerProvider.request.mockClear()

        internal = new InternalLedgerNamespace(ctx)
    })

    it('should submit a command', async () => {
        const expectedResult: LedgerCommonSchemas['SubmitAndWaitResponse'] = {
            updateId: 'updateId',
            completionOffset: 100,
        }
        ledgerProvider.request.mockResolvedValueOnce(expectedResult)

        const arg: Parameters<InternalLedgerNamespace['submit']>[0] = {
            commands: [
                {
                    CreateCommand: {
                        templateId: 'templateId',
                        createArguments: {},
                    },
                },
            ],
            actAs: ['partyId'],
        }
        const result = await internal.submit(arg)

        expect(result).toEqual(expectedResult)
        expect(ledgerProvider.request).toHaveBeenCalledWith({
            method: 'ledgerApi',
            params: expect.objectContaining({
                resource: '/v2/commands/submit-and-wait',
                requestMethod: 'post',
            }),
        })
    })

    it('should prepare a command', async () => {
        const expectedResult: LedgerCommonSchemas['JsPrepareSubmissionResponse'] =
            {
                preparedTransaction: 'preparedTransaction',
                preparedTransactionHash: 'hash',
                hashingSchemeVersion: 'HASHING_SCHEME_VERSION_V2',
            }
        ledgerProvider.request.mockResolvedValueOnce(expectedResult)

        const arg: Parameters<InternalLedgerNamespace['prepare']>[0] = {
            commands: [
                {
                    CreateCommand: {
                        templateId: 'templateId',
                        createArguments: {},
                    },
                },
            ],
            actAs: ['partyId'],
        }
        const result = await internal.prepare(arg)

        expect(result).toEqual(expectedResult)
        expect(ledgerProvider.request).toHaveBeenCalledWith({
            method: 'ledgerApi',
            params: expect.objectContaining({
                resource: '/v2/interactive-submission/prepare',
                requestMethod: 'post',
            }),
        })
    })
})
