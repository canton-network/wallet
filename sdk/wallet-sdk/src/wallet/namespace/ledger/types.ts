// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { PartyId } from '@canton-network/core-types'
import type {
    LedgerCommonSchemas,
    WrappedCommand,
} from '@canton-network/core-ledger-client-types'
import { AcsOptions } from '@canton-network/core-acs-reader'

export type PrepareOptions = {
    partyId: PartyId
    commands: WrappedCommand | WrappedCommand[] | unknown
    commandId?: string
    synchronizerId?: string
    disclosedContracts?: LedgerCommonSchemas['DisclosedContract'][]
}

export type ExecuteOptions = {
    submissionId?: string
    partyId: PartyId
}

export type ConnectedSynchronizersOptions = {
    party?: string
    participantId?: string
    identityProviderId?: string
}

export type AcsRequestOptions = Omit<AcsOptions, 'offset'> & {
    offset?: number
}
