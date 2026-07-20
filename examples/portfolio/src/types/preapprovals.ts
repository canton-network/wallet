// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Instrument } from './instruments'

export type PreapprovalKind = 'amulet' | 'utility'

export type PreapprovalRow = {
    key: string
    kind: PreapprovalKind
    registryPartyId: string
    registryUrl: string
    instrument: Instrument
}
