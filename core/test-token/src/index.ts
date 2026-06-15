// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Splice, packageId } from '@daml.js/splice-test-token-v1-1.0.0'
export { Splice, packageId }

export {
    buildCreateTokenRulesCommand,
    buildMintTokenCommand,
    buildTransferTokenCommand,
    buildAcceptTransferInstructionCommand,
} from './commands.js'

export { allocateTestToken } from './allocation.js'
export type { AllocateTestTokenParams } from './allocation.js'

export { createTokenRules, mintTestToken } from './setup.js'
export type {
    SigningParty,
    CreateTokenRulesParams,
    MintTestTokenParams,
} from './setup.js'

export { selfTransferTestToken, selfTransferAllTestTokens } from './transfer.js'
export type {
    SelfTransferTestTokenParams,
    SelfTransferAllTestTokensParams,
} from './transfer.js'
