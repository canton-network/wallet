// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'
import { allocateTestToken } from '@canton-network/core-test-token'
import type { MultiSyncSetup } from './_setup.js'

export async function allocateTokenForBob(
    setup: MultiSyncSetup,
    logger: Logger
): Promise<{ legId: string }> {
    const { appProviderSdk, bob, tokenAdmin, globalSynchronizerId } = setup

    return allocateTestToken({
        sdk: appProviderSdk,
        sender: { partyId: bob.partyId, privateKey: bob.keyPair.privateKey },
        adminPartyId: tokenAdmin.partyId,
        globalSynchronizerId,
        logger,
    })
}
