// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defaultConfig } from '@canton-network/example-test-token-v1-registry'

export const ALICE_AMULET_TAP_AMOUNT = '2000000'
export const BOB_TOKEN_MINT_AMOUNT = '500'
export const TRADE_AMULET_AMOUNT = '100'
export const TRADE_TOKEN_AMOUNT = '20'

// Port + URL of the local TestToken registry that implements the four
// CIP-56 Token Standard off-ledger APIs (served by
// `@canton-network/example-test-token-v1-registry`).
export const TEST_TOKEN_REGISTRY_PORT = parseInt(
    process.env['REGISTRY_PORT'] ?? defaultConfig.port.toString(),
    10
)
export const TEST_TOKEN_REGISTRY_URL = new URL(
    `http://localhost:${TEST_TOKEN_REGISTRY_PORT}`
)
