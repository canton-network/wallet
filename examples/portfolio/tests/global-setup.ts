// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { FullConfig } from '@playwright/test'
import { ensureLedgerUsers } from '@canton-network/core-wallet-test-utils'
import { fundValidatorOperator } from './fund-validator'
import {
    GATEWAY_URL,
    LOCALNET_CLIENT_ID,
    LOCALNET_LEDGER_API_URL,
    LOCALNET_NETWORK_ID,
    gatewayUserForWorker,
} from './utils'

/**
 * Runs once before any worker starts. Two things the suite needs:
 *
 * 1. Amulet in the validator operator's wallet. It pays the fee when accepting
 *    a preapproval proposal, and a fresh LocalNet gives it none, so proposals
 *    would never be accepted.
 *
 * 2. A ledger user per worker. Workers connect to the gateway as their own user
 *    to avoid fighting over the primary wallet, and Canton rejects tokens whose
 *    subject does not exist on the participant.
 *
 * Both belong here rather than in a `beforeAll` so they happen exactly once,
 * whatever the worker count.
 */
export default async function globalSetup(config: FullConfig): Promise<void> {
    await fundValidatorOperator()

    const workerUsers = Array.from({ length: config.workers }, (_, index) =>
        gatewayUserForWorker(index)
    ).filter((userId) => userId !== LOCALNET_CLIENT_ID)

    await ensureLedgerUsers({
        gatewayUrl: GATEWAY_URL,
        ledgerApiUrl: LOCALNET_LEDGER_API_URL,
        networkId: LOCALNET_NETWORK_ID,
        adminClientId: LOCALNET_CLIENT_ID,
        userIds: workerUsers,
    })
}
