// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LedgerClient, type Types } from '@canton-network/core-ledger-client'
import type {
    Commands,
    DisclosedContracts,
    PackageIdSelectionPreference,
} from '@/entrypoints/background/dapp/rpc-gen/typings.js'

export interface PrepareParams {
    commandId?: string
    commands?: Commands
    actAs?: string[]
    readAs?: string[]
    disclosedContracts?: DisclosedContracts
    packageIdSelectionPreference?: PackageIdSelectionPreference
}

export function ledgerPrepareParams(
    userId: string,
    partyIds: string[],
    synchronizerId: string,
    params: PrepareParams
): Types['JsPrepareSubmissionRequest'] {
    const disclosedContracts =
        params.disclosedContracts?.map((contract) => ({
            templateId: contract.templateId || '',
            contractId: contract.contractId || '',
            createdEventBlob: contract.createdEventBlob,
            synchronizerId: contract.synchronizerId || '',
        })) || []

    return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        commands: params.commands as any,
        commandId: params.commandId || crypto.randomUUID(),
        userId,
        actAs: params.actAs || partyIds,
        readAs: params.readAs || [],
        disclosedContracts,
        synchronizerId,
        verboseHashing: false,
        packageIdSelectionPreference: params.packageIdSelectionPreference || [],
        hashingSchemeVersion: 'HASHING_SCHEME_VERSION_V3',
    }
}

type NetworkStatus = {
    isConnected: boolean
    reason?: string
    cantonVersion?: string
}

export async function networkStatus(
    ledgerClient: LedgerClient
): Promise<NetworkStatus> {
    try {
        const response = await ledgerClient.get('/v2/version')
        return {
            isConnected: true,
            cantonVersion: response.version,
        }
    } catch (e) {
        return {
            isConnected: false,
            reason: `Ledger unreachable: ${(e as Error).message}`,
        }
    }
}
