// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PartyId } from '@canton-network/core-types'
import type { Metadata } from '@canton-network/core-token-standard'
import type { URLInput } from '../../utils/url'
import type { Account } from '@canton-network/core-token-standard-v2'
import { toBasicAccount } from '../utils'

export type AccountRef = PartyId | Account

interface TransferParamsBase {
    amount: string
    instrumentId: string
    registryUrl: URLInput
    inputUtxos?: string[]
    expirationDate?: Date
    meta?: Metadata
    memo?: string
}

export interface TransferParamsV1 extends TransferParamsBase {
    sender: PartyId
    recipient: PartyId
}

export interface TransferParamsV2 extends TransferParamsBase {
    sender: AccountRef
    recipient: AccountRef
    actors?: PartyId[]
}

export type TransferAllocationChoiceParams = {
    transferInstructionCid: string
    registryUrl: URLInput
}

/** @deprecated use TransferParamsV1 **/
export type TransferParams = TransferParamsV1

export const toAccount = (ref: AccountRef): Account =>
    typeof ref === 'string' ? toBasicAccount(ref) : ref
