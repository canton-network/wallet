// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { PartyId } from '@canton-network/core-types'
import {
    Metadata,
    TokenApiVersionPreference,
} from '@canton-network/core-token-standard'
import { URLInput } from '../../utils/url'

export type TransferParams = {
    sender: PartyId
    recipient: PartyId
    amount: string
    instrumentId: string
    registryUrl: URLInput
    inputUtxos?: string[]
    expirationDate?: Date
    meta?: Metadata
    memo?: string
    /** Prefer V2 when advertised unless forced. Default: config or 'auto'. */
    apiVersion?: TokenApiVersionPreference
    /** Controllers for V2 choices; defaults to [sender]. */
    actors?: PartyId[]
}

export type TransferAllocationChoiceParams = {
    transferInstructionCid: string
    registryUrl: URLInput
    apiVersion?: TokenApiVersionPreference
    actors?: PartyId[]
}
