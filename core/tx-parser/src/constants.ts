// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    TRANSFER_INSTRUCTION_INTERFACE_ID,
    TRANSFER_FACTORY_INTERFACE_ID,
    ALLOCATION_FACTORY_INTERFACE_ID,
    ALLOCATION_INSTRUCTION_INTERFACE_ID,
    HOLDING_INTERFACE_ID,
    ALLOCATION_INTERFACE_ID,
    ALLOCATION_REQUEST_INTERFACE_ID,
} from '@canton-network/core-token-standard'
import { TRANSFER_INSTRUCTION_INTERFACE_ID_V2 } from '@canton-network/core-token-standard-v2'
import {
    ALLOCATION_FACTORY_INTERFACE_ID_V2,
    ALLOCATION_INSTRUCTION_INTERFACE_ID_V2,
    ALLOCATION_INTERFACE_ID_V2,
    ALLOCATION_REQUEST_INTERFACE_ID_V2,
    HOLDING_INTERFACE_ID_V2,
    TRANSFER_FACTORY_INTERFACE_ID_V2,
} from '@canton-network/core-token-standard-v2'
export interface InterfaceIdParts {
    packageName: string
    moduleName: string
    entityName: string
}

export function splitInterfaceId(interfaceId: string): InterfaceIdParts | null {
    // Captures 3 groups: pkg or package-id, module and entity
    // Accepts both #<package-name>:<module>:<entity> and <package-id>:<module>:<entity>
    const regExp = /^#?([^:]+):([^:]+):([^:]+)$/
    const match = regExp.exec(interfaceId)
    if (!match) return null
    const [, packageName, moduleName, entityName] = match // [0]=full, [1]=pkg, [2]=module, [3]=entity
    return {
        packageName,
        moduleName,
        entityName,
    }
}

export function matchInterfaceIds(a: string, b: string): boolean {
    const aParts = splitInterfaceId(a)
    const bParts = splitInterfaceId(b)

    return (
        aParts !== null &&
        bParts !== null &&
        aParts.moduleName === bParts.moduleName &&
        aParts.entityName === bParts.entityName
    )
}

export const TokenStandardTransactionInterfaces = [
    HOLDING_INTERFACE_ID,
    TRANSFER_FACTORY_INTERFACE_ID,
    TRANSFER_INSTRUCTION_INTERFACE_ID,
    ALLOCATION_FACTORY_INTERFACE_ID,
    ALLOCATION_INSTRUCTION_INTERFACE_ID,
    ALLOCATION_INTERFACE_ID,
    ALLOCATION_REQUEST_INTERFACE_ID,
]

export const V2TokenStandardTransactionInterfaces = [
    HOLDING_INTERFACE_ID_V2,
    TRANSFER_FACTORY_INTERFACE_ID_V2,
    TRANSFER_INSTRUCTION_INTERFACE_ID_V2,
    ALLOCATION_FACTORY_INTERFACE_ID_V2,
    ALLOCATION_INSTRUCTION_INTERFACE_ID_V2,
    ALLOCATION_INTERFACE_ID_V2,
    ALLOCATION_REQUEST_INTERFACE_ID_V2,
]

export const TOKEN_STANDARD_INTERFACES_BY_VERSION = {
    v1: TokenStandardTransactionInterfaces,
    v2: V2TokenStandardTransactionInterfaces,
} as const satisfies Record<string, readonly string[]>

export type TokenStandardVersion =
    keyof typeof TOKEN_STANDARD_INTERFACES_BY_VERSION

export const ALL_TOKEN_STANDARD_VERSIONS = Object.keys(
    TOKEN_STANDARD_INTERFACES_BY_VERSION
) as TokenStandardVersion[]

export function getTokenStandardInterfaces(
    versions: readonly TokenStandardVersion[] = ALL_TOKEN_STANDARD_VERSIONS
): string[] {
    if (versions.length === 0) {
        throw new Error('At least one token standard version must be specified')
    }
    const ids = versions.flatMap((v) => TOKEN_STANDARD_INTERFACES_BY_VERSION[v])
    return [...new Set(ids)]
}

const SpliceMetaKeyPrefix = 'splice.lfdecentralizedtrust.org/'
export const TxKindMetaKey = `${SpliceMetaKeyPrefix}tx-kind`
export const SenderMetaKey = `${SpliceMetaKeyPrefix}sender`
export const ReasonMetaKey = `${SpliceMetaKeyPrefix}reason`
export const BurnedMetaKey = `${SpliceMetaKeyPrefix}burned`
export const AllKnownMetaKeys = [
    TxKindMetaKey,
    SenderMetaKey,
    ReasonMetaKey,
    BurnedMetaKey,
]
