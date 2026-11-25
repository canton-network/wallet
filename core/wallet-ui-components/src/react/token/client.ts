// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { HoldingView } from '@canton-network/core-token-standard'
import type { HoldingView as HoldingViewV2 } from '@canton-network/core-token-standard-v2'
import type { PrettyContract } from '@canton-network/core-tx-parser'
import type { PartyId } from '@canton-network/core-types'

export type TokenStandardVersion = 'v1' | 'v2'

export interface CreateTransferParams {
    sender: PartyId
    receiver: PartyId
    instrumentId: { admin: PartyId; id: string }
    amount: string
    /** An ISO 8601 date. */
    expiry: string
    memo?: string | undefined
    /** v2 is only used when the instrument's registry supports it. */
    tokenStandardVersion: TokenStandardVersion
}

/** Accepts, rejects or withdraws a pending transfer instruction. */
export interface TransferChoiceParams {
    partyId: PartyId
    contractId: string
    instrumentId: { admin: PartyId; id: string }
    version: TokenStandardVersion
    /** v2 only. Defaults to `partyId`. */
    actors?: PartyId[] | undefined
}

export interface ListHoldingsParams {
    partyId: PartyId
    includeLocked?: boolean
    limit?: number
    offset?: number
}

// No `URL` or `Date` in the signatures, so a proxy over runtime messaging fits.
export interface TokenClient {
    token: {
        v1: {
            utxos: {
                list(
                    params: ListHoldingsParams
                ): Promise<PrettyContract<HoldingView>[]>
            }
        }
        v2: {
            utxos: {
                list(
                    params: ListHoldingsParams
                ): Promise<PrettyContract<HoldingViewV2>[]>
            }
        }
    }
}
