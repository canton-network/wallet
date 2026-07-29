// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { APIHandler } from '../../types'
import { instruments } from './common'
import { OffLedger } from '@canton-network/core-token-standard'

/**
 * Returns metadata for a single instrument identified by its instrument ID.
 *
 * @throws {404} When the instrument was not found.
 * @returns Instrument metadata.
 */
export const getInstrument: APIHandler<
    OffLedger.MetadataV1.paths['/registry/metadata/v1/instruments/{instrumentId}']['get']
> = async (ctx) => {
    const instrumentId = ctx.request.params.instrumentId
    const instrument = instruments.find(
        (instrument) => instrument.id === instrumentId
    )
    if (!instrument) {
        return {
            status: 404,
            payload: {
                error: 'Instrument Not Found',
            },
        }
    }

    return {
        payload: instrument,
    }
}
