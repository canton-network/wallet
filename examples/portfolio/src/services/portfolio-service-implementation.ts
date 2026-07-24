// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { v4 } from 'uuid'
import { PartyId } from '@canton-network/core-types'
import * as sdk from '@canton-network/dapp-sdk'
import { type PrettyContract } from '@canton-network/core-tx-parser'
import {
    ALLOCATION_INSTRUCTION_INTERFACE_ID,
    ALLOCATION_INTERFACE_ID,
    ALLOCATION_REQUEST_INTERFACE_ID,
    type AllocationInstructionView,
    type AllocationRequestView,
    type AllocationSpecification,
    type AllocationView,
} from '@canton-network/core-token-standard'
import { resolveTokenStandardService, resolveAmuletService } from './resolve'

export const listAllocationRequests = async ({
    party,
}: {
    party: PartyId
}): Promise<PrettyContract<AllocationRequestView>[]> => {
    const tokenStandardService = await resolveTokenStandardService()
    const contracts =
        await tokenStandardService.listContractsByInterface<AllocationRequestView>(
            ALLOCATION_REQUEST_INTERFACE_ID,
            party
        )
    return contracts
}

export const createAllocation = async ({
    registryUrls,
    party,
    allocationSpecification,
}: {
    registryUrls: ReadonlyMap<PartyId, string>
    party: PartyId
    allocationSpecification: AllocationSpecification
}): Promise<void> => {
    const { instrumentId } = allocationSpecification.transferLeg
    const registryUrl = registryUrls.get(instrumentId.admin)
    if (!registryUrl)
        throw new Error(`no registry URL for admin ${instrumentId.admin}`)
    const tokenStandardService = await resolveTokenStandardService()

    const [command, disclosedContracts] =
        await tokenStandardService.allocation.createAllocationInstruction(
            allocationSpecification,
            instrumentId.admin,
            registryUrl,
            undefined, // inputUtxos
            undefined // requestedAt
        )

    const request = {
        commands: [{ ExerciseCommand: command }],
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

export const listAllocations = async ({
    party,
}: {
    party: PartyId
}): Promise<PrettyContract<AllocationView>[]> => {
    const tokenStandardService = await resolveTokenStandardService()
    const contracts =
        await tokenStandardService.listContractsByInterface<AllocationView>(
            ALLOCATION_INTERFACE_ID,
            party
        )
    return contracts
}

export const withdrawAllocation = async ({
    registryUrls,
    party,
    contractId,
    instrumentId,
}: {
    registryUrls: ReadonlyMap<PartyId, string>
    party: PartyId
    contractId: string
    instrumentId: { admin: string; id: string }
}) => {
    // TODO: resolve this BEFORE calling this function so we can gray out the
    // button?
    const registryUrl = registryUrls.get(instrumentId.admin)
    if (!registryUrl)
        throw new Error(`no registry URL for admin ${instrumentId.admin}`)

    const tokenStandardService = await resolveTokenStandardService()
    const [acceptCommand, disclosedContracts] =
        await tokenStandardService.allocation.createWithdrawAllocation(
            contractId,
            registryUrl
        )

    const request = {
        commands: [{ ExerciseCommand: acceptCommand }],
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

export const listAllocationInstructions = async ({
    party,
}: {
    party: PartyId
}): Promise<PrettyContract<AllocationInstructionView>[]> => {
    const tokenStandardService = await resolveTokenStandardService()
    const contracts =
        await tokenStandardService.listContractsByInterface<AllocationInstructionView>(
            ALLOCATION_INSTRUCTION_INTERFACE_ID,
            party
        )
    return contracts
}

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
