// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'

import type {
    ClearSigner,
    ClearSigningError,
    ClearSigningResult,
    OperationDescription,
} from './index.ts'

const template = { packageId: 'p', moduleName: 'M', entityName: 'E' }

function isComplete({ operations }: ClearSigningResult): boolean {
    return operations.every(
        (op) =>
            op.status === 'described' && op.fields.every((f) => 'value' in f)
    )
}

describe('ClearSigner', () => {
    it('is implemented by an object with a clearSign method', async () => {
        const result: ClearSigningResult = {
            operations: [
                {
                    kind: 'create',
                    template,
                    status: 'undescribed',
                    intent: 'Create M:E',
                    fields: [],
                },
            ],
        }
        const signer: ClearSigner = {
            clearSign: () => Promise.resolve(result),
        }

        await expect(
            signer.clearSign({
                preparedTransaction: 'tx',
                preparedTransactionHash: 'hash',
                descriptors: [],
            })
        ).resolves.toBe(result)
        expect(isComplete(result)).toBe(false)
    })

    it('rejects with an error whose code says whether the hash is the problem', async () => {
        const error: ClearSigningError = Object.assign(new Error('x'), {
            code: 'HASH_MISMATCH' as const,
        })
        const signer: ClearSigner = {
            clearSign: () => Promise.reject(error),
        }

        await expect(
            signer.clearSign({
                preparedTransaction: 'tx',
                preparedTransactionHash: 'hash',
                descriptors: [],
            })
        ).rejects.toMatchObject({ code: 'HASH_MISMATCH' })
    })

    it('carries choice and interface only on an exercise', () => {
        const exercise: OperationDescription = {
            kind: 'exercise',
            template,
            choiceId: 'Respond',
            interface: template,
            status: 'unfilled',
            intent: 'The descriptor does not match this transaction.',
            reason: "placeholder '{id}' failed: 'id' is None",
            fields: [{ label: 'id', error: "'id' is None" }],
            descriptor: {
                name: 'Ping',
                version: '1.0.0',
                publisher: 'Blockdaemon',
                url: 'https://example.com',
            },
        }
        const create: OperationDescription = {
            kind: 'create',
            template,
            // @ts-expect-error a create has no choice
            choiceId: 'Respond',
            status: 'undescribed',
            intent: 'Create M:E',
            fields: [],
        }

        expect(isComplete({ operations: [exercise] })).toBe(false)
        expect(create.kind).toBe('create')
    })
})
