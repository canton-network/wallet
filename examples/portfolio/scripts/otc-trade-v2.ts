// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { OTCTradeV2 } from '@canton-network/core-wallet-test-utils'
import { input, confirm } from '@inquirer/prompts'
import { REGISTRY_URL } from '../tests/utils'

const venue = await input({ message: 'Party ID for Venue' })
const alice = await input({ message: 'Party ID for Alice' })
const bob = await input({ message: 'Party ID for Bob' })
const carol = await input({ message: 'Party ID for Carol' })

const tradeHelper = new OTCTradeV2({
    venue,
    alice,
    bob,
    carol: carol.trim() || undefined,
    registryUrl: REGISTRY_URL,
})

const tradeDetails = await tradeHelper.setup()

await confirm({
    message: 'Please confirm once all parties have made their allocations',
})

await tradeHelper.settle(tradeDetails)
