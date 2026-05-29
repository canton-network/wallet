// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { type metadataRegistryTypes } from '@canton-network/core-token-standard'
import { type PartyId } from '@canton-network/core-types'

export type Instrument = metadataRegistryTypes['schemas']['Instrument']
export type Instruments = ReadonlyMap<PartyId, Instrument[]>
