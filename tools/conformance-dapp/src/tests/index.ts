// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { cases as connect } from './connect.ts'
import { cases as status } from './status.ts'
import { cases as accounts } from './accounts.ts'
import { cases as network } from './network.ts'
import { cases as request } from './request.ts'
import { cases as signMessage } from './sign-message.ts'
import { cases as prepareExecute } from './prepare-execute.ts'
import { cases as disconnect } from './disconnect.ts'
import type { Case } from './types.ts'

export type { Case, TestRuntime } from './types.ts'

/** One entry per test file/category, in execution order. */
export const groups: { category: string; cases: Case[] }[] = [
    { category: connect[0].category, cases: connect },
    { category: status[0].category, cases: status },
    { category: accounts[0].category, cases: accounts },
    { category: network[0].category, cases: network },
    { category: request[0].category, cases: request },
    { category: signMessage[0].category, cases: signMessage },
    { category: prepareExecute[0].category, cases: prepareExecute },
    { category: disconnect[0].category, cases: disconnect },
]

export const cases: Case[] = groups.flatMap((group) => group.cases)
