// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const CANTON_SCOPES = {
    'base:read':
        'Read basic participant information, such as its participant id, connected synchronizers and ledger end',
    'ledger:read':
        'Read contracts, transactions and command completions of your parties, and prepare transactions for signing',
    'ledger:act':
        'Submit commands that the participant signs on behalf of your parties',
    'ledger:execute':
        'Execute transactions that your parties signed with their own keys',
    'users:self': 'Read your own ledger user and its rights',
    'users:read': 'Read all ledger users and their rights',
    'users:write':
        'Create, change and delete ledger users, and grant or revoke their rights',
    'parties:self': 'Read details of the parties you can read as',
    'parties:read': 'List and read all parties on the participant',
    'parties:allocate': 'Allocate new parties, including external ones',
    'parties:write': 'Allocate and change parties',
    'idps:read': 'Read identity provider configurations',
    'idps:write': 'Create, change and delete identity provider configurations',
    'packages:write': 'Upload Daml packages to the participant',
    'vetting:write': 'Change which Daml packages the participant vets',
    'traffic:self': 'Read the traffic accounts your parties may use',
    'traffic:read': 'Read all traffic accounts',
    'traffic:write': 'Change traffic accounts and prune traffic data',
} as const satisfies Record<string, string>

export type CantonScope = keyof typeof CANTON_SCOPES

export const isCantonScope = (scope: string): scope is CantonScope =>
    Object.hasOwn(CANTON_SCOPES, scope)

export type ScopesAssessment =
    // No scopes requested, the token has full access
    | { verdict: 'none' }
    // All scopes are recognized, the token is restricted to them
    | { verdict: 'scoped'; recognized: CantonScope[] }
    // The token is restricted to the recognized scopes, the unrecognized ones may have any effect
    | {
          verdict: 'partial'
          recognized: CantonScope[]
          unrecognized: string[]
      }
    // No scope is recognized, so the token likely has full access
    | { verdict: 'unrecognized'; unrecognized: string[] }

export function assessScopes(scopes: string[] = []): ScopesAssessment {
    const requested = [
        ...new Set(scopes.map((scope) => scope.trim()).filter(Boolean)),
    ]
    const recognized = requested.filter(isCantonScope)
    const unrecognized = requested.filter((scope) => !isCantonScope(scope))

    if (!requested.length) return { verdict: 'none' }
    if (!unrecognized.length) return { verdict: 'scoped', recognized }
    if (!recognized.length) return { verdict: 'unrecognized', unrecognized }
    return { verdict: 'partial', recognized, unrecognized }
}
