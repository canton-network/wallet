// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    Fetch,
    PreparedTransaction,
    Rollback,
    type Identifier,
} from '@canton-network/core-ledger-proto'
import { describe, expect, it } from 'vitest'

import { decode, rootNodes } from './roots.ts'

const templateId: Identifier = {
    packageId: 'ab',
    moduleName: 'Mod',
    entityName: 'Ent',
}

function rooted(
    nodeType: NonNullable<
        Extract<
            NonNullable<
                PreparedTransaction['transaction']
            >['nodes'][number]['versionedNode'],
            { oneofKind: 'v1' }
        >['v1']['nodeType']
    >,
    rootId = '0'
): PreparedTransaction {
    return PreparedTransaction.create({
        transaction: {
            version: '2.1',
            roots: [rootId],
            nodes: [
                {
                    nodeId: '0',
                    versionedNode: { oneofKind: 'v1', v1: { nodeType } },
                },
            ],
        },
    })
}

describe('rootNodes', () => {
    it('returns a fetch, a rollback, a queryByKey, a missing root and an empty node', () => {
        const fetch = rootNodes(
            rooted({
                oneofKind: 'fetch',
                fetch: Fetch.create({
                    lfVersion: '2.1',
                    contractId: '00',
                    packageName: 'pkg',
                    templateId,
                    signatories: ['alice'],
                    stakeholders: ['alice'],
                    actingParties: ['alice'],
                }),
            })
        )
        expect(fetch).toEqual([
            {
                nodeId: '0',
                kind: 'other',
                nodeType: 'fetch',
                template: templateId,
            },
        ])

        const rollback = rootNodes(
            rooted({
                oneofKind: 'rollback',
                rollback: Rollback.create({ children: ['1'] }),
            })
        )
        expect(rollback).toEqual([
            { nodeId: '0', kind: 'other', nodeType: 'rollback' },
        ])

        const query = rootNodes(
            rooted({
                oneofKind: 'queryByKey',
                queryByKey: {
                    lfVersion: '2',
                    packageName: 'pkg',
                    templateId,
                    exhaustive: true,
                    result: [],
                },
            })
        )
        expect(query).toEqual([
            {
                nodeId: '0',
                kind: 'other',
                nodeType: 'queryByKey',
                template: templateId,
            },
        ])

        const missing = rootNodes(
            rooted(
                {
                    oneofKind: 'rollback',
                    rollback: Rollback.create({ children: [] }),
                },
                '1'
            )
        )
        expect(missing).toEqual([
            { nodeId: '1', kind: 'other', nodeType: 'missing' },
        ])

        const empty = rootNodes(rooted({ oneofKind: undefined }))
        expect(empty).toEqual([
            { nodeId: '0', kind: 'other', nodeType: 'empty' },
        ])
    })
})

describe('malformed transactions', () => {
    it('refuses bytes that are not a prepared transaction', () => {
        // Field 1 is a length-delimited message that claims more bytes than follow.
        const truncated = btoa(String.fromCharCode(0x0a, 0x7f))
        expect(() => decode(truncated)).toThrow(
            expect.objectContaining({ code: 'MALFORMED_TRANSACTION' })
        )
    })

    it('refuses a transaction with no transaction', () => {
        expect(() => rootNodes(PreparedTransaction.create({}))).toThrow(
            expect.objectContaining({ code: 'MALFORMED_TRANSACTION' })
        )
    })

    it('refuses a fetch root without a template ID', () => {
        const tx = rooted({
            oneofKind: 'fetch',
            fetch: Fetch.create({}),
        })
        expect(() => rootNodes(tx)).toThrow(
            expect.objectContaining({
                code: 'MALFORMED_TRANSACTION',
                message: "node '0' has no template ID",
            })
        )
    })
})
