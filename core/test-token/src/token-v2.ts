// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Splice } from '@daml.js/test-token-v2'

export { packageId as packageIdV2 } from '@daml.js/test-token-v2'
export const TestTokenV2 = Splice.Testing.Tokens.TestTokenV2

export const TestTokenV2ID = 'test-token-v2'

export type TokenRulesV2 = Splice.Testing.Tokens.TestTokenV2.TokenRules
