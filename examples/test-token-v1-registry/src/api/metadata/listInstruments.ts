// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { OffLedger } from '@canton-network/core-token-standard'
import { APIHandler } from '../../types'
import { instruments } from './common'

/**
 * @returns API payload containing the full in-memory list of instrument metadata.
 */
export const listInstruments: APIHandler<
    OffLedger.MetadataV1.paths['/registry/metadata/v1/instruments']['get']
> = async () => {
    return {
        payload: {
            instruments,
        },
    }
}
