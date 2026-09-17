// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as TestTokenPackage from '@daml.js/test-token-v1'

const { Splice } = TestTokenPackage

export const packageId = TestTokenPackage.packageId
export const TestTokenV1 = Splice.Testing.Tokens.TestTokenV1

export const TestTokenID = 'TestToken'
