// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { LedgerClient, Types } from '@canton-network/core-ledger-client'
import type {
    ClaimName,
    ClaimsFor,
    IdentityClaims,
    Methods,
    SigningDriverInterface,
} from '@canton-network/core-signing-lib'
import type { AuthContext } from '@canton-network/core-wallet-auth'
import type {
    DisclosedContracts,
    Commands,
    PackageIdSelectionPreference,
} from '@canton-network/core-wallet-dapp-rpc-client'
import type { Logger } from 'pino'

import type { HASHING_SCHEME_VERSION } from './types.ts'

export interface PrepareParams {
    commandId?: string
    commands?: Commands
    actAs?: string[]
    readAs?: string[]
    disclosedContracts?: DisclosedContracts
    packageIdSelectionPreference?: PackageIdSelectionPreference
}

interface LedgerPrepareParamsArgs {
    userId: string
    commandId: string
    actAs: string[]
    synchronizerId: string
    params: PrepareParams
    hashingSchemeVersion: HASHING_SCHEME_VERSION
}

export function ledgerPrepareParams(
    args: LedgerPrepareParamsArgs
): Types['JsPrepareSubmissionRequest'] {
    const {
        userId,
        commandId,
        actAs,
        synchronizerId,
        params,
        hashingSchemeVersion,
    } = args

    // Map disclosed contracts to ledger api format (which wrongly defines optional fields as mandatory)
    const disclosedContracts =
        params.disclosedContracts?.map((d) => {
            return {
                templateId: d.templateId || '',
                contractId: d.contractId || '',
                createdEventBlob: d.createdEventBlob,
                synchronizerId: d.synchronizerId || '',
            }
        }) ?? []

    return {
        // oxlint-disable-next-line typescript/no-explicit-any -- because OpenRPC codegen type is incompatible with ledger codegen type
        commands: params.commands as any,
        commandId,
        userId,
        actAs,
        readAs: params.readAs ?? [],
        disclosedContracts,
        synchronizerId,
        verboseHashing: false,
        packageIdSelectionPreference: params.packageIdSelectionPreference ?? [],
        hashingSchemeVersion,
    }
}

interface DynamicLogParams {
    info?: object
    debug: object
}

/**
 * A helper function to enrich log messages with additional data when debug logging is enabled,
 * while keeping logs cleaner at higher log levels.
 *
 * TODO: remove when switching to logtape for Wallet Gateway
 */
export function logDynamically(
    logger: Logger,
    msg: string,
    data: DynamicLogParams
): void {
    if (logger.isLevelEnabled('debug')) {
        logger.debug({ ...data.info, ...data.debug }, msg)
    } else {
        if (data.info) {
            logger.info(data.info, msg)
        } else {
            logger.info(msg)
        }
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
            reason: `Ledger status check failed: ${(e as Error).message}`,
        }
    }
}

const claimMap = {
    sub: 'userId',
    email: 'email',
} as const satisfies Record<keyof IdentityClaims, keyof AuthContext>

export function getSigningController(
    driver: SigningDriverInterface,
    authContext: AuthContext
): Methods
export function getSigningController(
    driver: SigningDriverInterface | undefined,
    authContext: AuthContext
): Methods | undefined
export function getSigningController(
    driver: SigningDriverInterface | undefined,
    authContext: AuthContext
): Methods | undefined {
    if (!driver) return undefined

    const claims: Partial<Record<ClaimName, string>> = {}
    for (const claim of driver.requiredClaims) {
        const value = authContext[claimMap[claim]]
        if (!value) {
            throw new Error(
                `Required claim ${claim} is not present in auth context`
            )
        }
        claims[claim] = value
    }

    // Safe: the loop above guarantees every required claim is present.
    return driver.controller(claims as ClaimsFor<ClaimName>)
}
