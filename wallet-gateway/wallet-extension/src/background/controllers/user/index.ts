// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { UserControllerDeps } from './deps.ts'
import { messages } from './messages.ts'
import { networks } from './networks.ts'
import buildController from './rpc-gen/index.ts'
import { sessions } from './sessions.ts'
import { transactions, type TxPrompts } from './transactions.ts'
import { unsupported } from './unsupported.ts'
import { wallets } from './wallets.ts'

export type { UserControllerDeps } from './deps.ts'

/**
 * The user API, called by the extension pages. Each area module returns its
 * part of `Methods`; `buildController` fails to typecheck if one is missing.
 */
export const userController = (
    deps: UserControllerDeps,
    txPrompts: TxPrompts
) =>
    buildController({
        ...sessions(deps),
        ...networks(deps),
        ...wallets(deps),
        ...transactions(deps, txPrompts),
        ...messages(),
        ...unsupported(),
    })
