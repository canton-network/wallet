// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { prepareExecuteAndWait } from '@canton-network/dapp-sdk'
import type { AmuletNamespace } from '@canton-network/wallet-sdk'

export async function tapAmuletWithWallet(
    amulet: Pick<AmuletNamespace, 'tap'>,
    partyId: string,
    execute: (
        params: Parameters<typeof prepareExecuteAndWait>[0]
    ) => Promise<unknown>
): Promise<void> {
    const [command, disclosedContracts] = await amulet.tap(partyId, '10')
    await execute({
        commandId: crypto.randomUUID(),
        actAs: [partyId],
        commands: [command],
        disclosedContracts,
    })
}
