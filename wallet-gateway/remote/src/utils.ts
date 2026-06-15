// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { v4 } from 'uuid'
import { LedgerClient, Types } from '@canton-network/core-ledger-client'
import type {
    DisclosedContracts,
    Commands,
    PackageIdSelectionPreference,
} from './dapp-api/rpc-gen/typings.js'
import { Logger } from 'pino'

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
    partyId: string,
    synchronizerId: string,
    params: PrepareParams
): Types['JsPrepareSubmissionRequest'] {
    // Map disclosed contracts to ledger api format (which wrongly defines optional fields as mandatory)
    const disclosedContracts =
        params.disclosedContracts?.map((d) => {
            return {
                templateId: d.templateId || '',
                contractId: d.contractId || '',
                createdEventBlob: d.createdEventBlob,
                synchronizerId: d.synchronizerId || '',
            }
        }) || []
    return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- because OpenRPC codegen type is incompatible with ledger codegen type
        commands: params.commands as any,
        commandId: params.commandId || v4(),
        userId,
        actAs: params.actAs || [partyId],
        readAs: params.readAs || [],
        disclosedContracts,
        synchronizerId,
        verboseHashing: false,
        packageIdSelectionPreference: params.packageIdSelectionPreference || [],
    }
}

interface DynamicLogParams {
    info?: object
    debug: object
}

/**
 * A helper function to enrich log messages with additional data when debug logging is enabled,
 * while keeping logs cleaner at higher log levels.
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

/**
 * Pino does not support recursively redacting fields within objects of arbitrary depth,
 * so this helper function generates redactions up to depth N (default 6).
 * Supports both object nesting (.) and array access ([*]) at arbitrary depths.
 */
export function nestedRedact(keys: string[], depth: number = 5): string[] {
    return keys.flatMap((k) => {
        const key = k.includes('-') ? `["${k}"]` : k
        const redactions = []

        // Generate object-only nesting patterns (depth 0 to depth-1)
        for (let i = 0; i < depth; i++) {
            const prefix = Array.from({ length: i }).fill('*').join('.')
            if (prefix) {
                const fullKey = key.startsWith('["')
                    ? `${prefix}${key}`
                    : `${prefix}.${key}`
                redactions.push(fullKey)
            } else {
                redactions.push(key)
            }
        }

        // Generate array patterns: object nesting followed by array access
        for (let i = 0; i < depth; i++) {
            const prefix = Array.from({ length: i }).fill('*').join('.')
            const arrayPrefix = prefix ? `${prefix}.*[*]` : `*[*]`
            const fullKey = key.startsWith('["')
                ? `${arrayPrefix}${key}`
                : `${arrayPrefix}.${key}`
            redactions.push(fullKey)
        }

        return redactions
    })
}
