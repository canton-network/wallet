// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod'
import {
    CIP103_ERROR_CODES,
    isCip103ErrorCode,
    type Cip103ErrorCode,
} from '@canton-network/core-types'

const userUrl = z.url()
export const providerSchema = z.strictObject({
    id: z.string().min(1),
    version: z.string().optional(),
    providerType: z.enum(['browser', 'desktop', 'mobile', 'remote']),
    url: z.string().optional(),
    userUrl: userUrl.optional(),
})
export const connectResultSchema = z.strictObject({
    isConnected: z.boolean(),
    isNetworkConnected: z.boolean(),
    reason: z.string().optional(),
    networkReason: z.string().optional(),
    userUrl: userUrl.optional(),
})
export const networkSchema = z.strictObject({
    networkId: z.string().min(1),
    ledgerApi: z.url().optional(),
    accessToken: z.string().optional(),
})
export const statusEventSchema = z.strictObject({
    provider: providerSchema,
    connection: connectResultSchema,
    network: networkSchema.optional(),
    session: z
        .strictObject({
            accessToken: z.string().min(1),
            userId: z.string().min(1),
        })
        .optional(),
})
export const signMessageResultSchema = z.strictObject({
    signature: z.string().min(1),
})

const commandId = z.string().min(1)
export const txChangedEventSchema = z.discriminatedUnion('status', [
    z.strictObject({ status: z.literal('pending'), commandId }),
    z.strictObject({
        status: z.literal('signed'),
        commandId,
        payload: z.strictObject({
            signature: z.string().min(1),
            signedBy: z.string().min(1),
            party: z.string().min(1),
        }),
    }),
    z.strictObject({
        status: z.literal('executed'),
        commandId,
        payload: z.strictObject({
            updateId: z.string().min(1),
            completionOffset: z.number().int(),
        }),
    }),
    z.strictObject({ status: z.literal('failed'), commandId }),
])
export const walletSchema = z.strictObject({
    primary: z.boolean(),
    partyId: z.string().min(1),
    status: z.enum(['initialized', 'allocated', 'removed']),
    hint: z.string(),
    publicKey: z.string().min(1),
    namespace: z.string().min(1),
    networkId: z.string().min(1),
    signingProviderId: z.string().min(1),
    externalTxId: z.string().optional(),
    topologyTransactions: z.string().optional(),
    disabled: z.boolean().optional(),
    reason: z.string().optional(),
})

export function describeError(error: unknown): string {
    if (error instanceof Error) return error.message
    return JSON.stringify(error, Object.getOwnPropertyNames(error))
}

// Error codes are only loossely specified in CIP-103, so the suite allows multiple codes for the same logical error.
export const INVALID_PARAMS_CODES = [
    CIP103_ERROR_CODES.InvalidParams,
    CIP103_ERROR_CODES.InvalidInput,
] as const
export const UNKNOWN_METHOD_CODES = [
    CIP103_ERROR_CODES.UnsupportedMethod,
    CIP103_ERROR_CODES.MethodNotFound,
    CIP103_ERROR_CODES.MethodNotSupported,
] as const
export const USER_REJECTED_CODES = [
    CIP103_ERROR_CODES.UserRejectedRequest,
] as const
export const UNAUTHORIZED_CODES = [CIP103_ERROR_CODES.Unauthorized] as const
export const NO_NETWORK_CODES = [
    CIP103_ERROR_CODES.ChainDisconnected,
    CIP103_ERROR_CODES.Disconnected,
] as const

export function requireCondition(
    condition: unknown,
    message: string
): asserts condition {
    if (!condition) throw new Error(message)
}

export async function expectRejection(
    operation: Promise<unknown>,
    codes: readonly Cip103ErrorCode[] = USER_REJECTED_CODES
): Promise<void> {
    try {
        await operation
    } catch (error) {
        if (
            typeof error !== 'object' ||
            error === null ||
            !('code' in error && isCip103ErrorCode(error.code))
        ) {
            throw error
        }
        requireCondition(
            codes.some((expected) => error.code === expected),
            `Expected wallet error code ${codes.join(' or ')}, received ${String(error.code)}`
        )
        return
    }
    throw new Error('Expected wallet rejection, but the request succeeded')
}
