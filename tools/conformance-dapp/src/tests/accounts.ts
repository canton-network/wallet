// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod'
import { requireCondition, walletSchema } from './helpers.ts'
import type { Case } from './types.ts'

const category = 'Accounts'

export const cases: Case[] = [
    {
        id: 'listAccounts',
        name: 'Accounts carry the fields the dApp API requires',
        category,
        run: async (runtime) => {
            await runtime.ensureConnected()
            const accounts = z
                .array(walletSchema)
                .parse(await runtime.request({ method: 'listAccounts' }))
            requireCondition(
                accounts.filter((account) => account.primary).length === 1,
                'listAccounts did not return exactly one primary account'
            )
        },
    },
    {
        id: 'getPrimaryAccount',
        name: 'The primary account is the one listAccounts marks primary',
        category,
        run: async (runtime) => {
            await runtime.ensureConnected()
            const accounts = await runtime.request({ method: 'listAccounts' })
            const expected = accounts.find((account) => account.primary)
            requireCondition(
                expected,
                'No account is marked primary, so there is none to return'
            )
            const primary = walletSchema.parse(
                await runtime.request({ method: 'getPrimaryAccount' })
            )
            requireCondition(
                primary.primary,
                'getPrimaryAccount returned an account not marked primary'
            )
            requireCondition(
                primary.partyId === expected.partyId,
                `getPrimaryAccount returned ${primary.partyId}, but listAccounts marks ${expected.partyId} primary`
            )
        },
    },
]
