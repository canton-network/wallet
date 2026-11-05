// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { InstrumentId } from '@canton-network/core-token-standard'
import type { TokenStandardVersion } from '../types/instruments'
import type { Account } from '@canton-network/core-token-standard-v2'

export interface SelectableInstrument {
    instrumentId: InstrumentId
    symbol: string
    name: string
    availableAmount: string
    decimals: number | undefined
}

export interface TransferFormData {
    instrumentId: InstrumentId | null
    tokenStandardVersion: TokenStandardVersion
    amount: string
    recipient: string
    recipientProvider: string
    recipientAccountId: string
    senderAccount: Account | null
    memo: string
    expiry: Date | null
}

export interface SubmittedTransfer {
    sender: string
    instrumentId: InstrumentId
    instrumentSymbol?: string
    instrumentName?: string
    amount: string
    recipient: string
    memo: string
    expiry: Date
    submittedAt: Date
    tokenStandardVersion: TokenStandardVersion
}
