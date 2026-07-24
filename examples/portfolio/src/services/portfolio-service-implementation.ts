// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { v4 } from 'uuid'
import { PartyId } from '@canton-network/core-types'
import * as sdk from '@canton-network/dapp-sdk'
import { resolveAmuletService } from './resolve'

export const tap = async ({
    registryUrls,
    party,
    sessionToken,
    validatorUrl,
    instrumentId,
    amount,
}: {
    registryUrls: ReadonlyMap<PartyId, string>
    party: string
    sessionToken: string
    validatorUrl: string
    instrumentId: { admin: string; id: string }
    amount: number
}) => {
    // TODO: resolve this BEFORE calling this function so we can gray out the
    // button?
    const registryUrl = registryUrls.get(instrumentId.admin)
    if (!registryUrl)
        throw new Error(`no registry URL for admin ${instrumentId.admin}`)

    const amuletService = await resolveAmuletService({
        sessionToken,
        validatorUrl,
    })
    const [tapCommand, disclosedContracts] = await amuletService.createTap(
        party,
        `${amount}`,
        instrumentId.admin,
        instrumentId.id,
        registryUrl
    )

    const request = {
        commands: [{ ExerciseCommand: tapCommand }],
        commandId: v4(),
        actAs: [party],
        disclosedContracts,
    }

    const provider = sdk.getConnectedProvider()
    // TODO: check success
    await provider?.request({
        method: 'prepareExecuteAndWait',
        params: request,
    })
}

export const isDevNet = async ({
    sessionToken,
    validatorUrl,
}: {
    sessionToken: string
    validatorUrl: string
}): Promise<boolean> => {
    const amuletService = await resolveAmuletService({
        sessionToken,
        validatorUrl,
    })
    return await amuletService.isDevNet()
}
