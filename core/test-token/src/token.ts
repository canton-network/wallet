// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Splice } from '@daml.js/test-token-v1'

export { packageId } from '@daml.js/test-token-v1'
export const TestTokenV1 = Splice.Testing.Tokens.TestTokenV1

export const TestTokenID = 'TestToken'

export type Token = Splice.Testing.Tokens.TestTokenV1.Token
export type TokenAllocation = Splice.Testing.Tokens.TestTokenV1.TokenAllocation
export type TokenRules = Splice.Testing.Tokens.TestTokenV1.TokenRules
export type TokenTransferOffer =
    Splice.Testing.Tokens.TestTokenV1.TokenTransferOffer
