// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { AcsOptions } from '@canton-network/core-acs-reader'
import type {
    LedgerCommonSchemas,
    WrappedCommand,
} from '@canton-network/core-ledger-client-types'
import type { PartyId } from '@canton-network/core-types'

export type PrepareOptions = {
    partyId: PartyId
    // oxlint-disable-next-line typescript/no-redundant-type-constituents
    commands: WrappedCommand | WrappedCommand[] | unknown
    commandId?: string
    synchronizerId?: string
    disclosedContracts?: LedgerCommonSchemas['DisclosedContract'][]
}

export type ExecuteOptions = {
    submissionId?: string
    partyId: PartyId
}

export type AcsRequestOptions = Omit<AcsOptions, 'offset'> & {
    offset?: number
}
