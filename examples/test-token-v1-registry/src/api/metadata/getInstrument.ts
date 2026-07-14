// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ErrorResponse } from '../../openapi-ts/token-metadata-v1'
import { instruments, MetadataAPIHandler } from './common'

export const getInstrument: MetadataAPIHandler<'getInstrument'> = async (
    ctx
) => {
    const instrumentId = ctx.request.params.instrumentId
    const instrument = instruments.find(
        (instrument) => instrument.id === instrumentId
    )
    if (!instrument) {
        return {
            status: 404,
            payload: {
                error: 'Not Found',
            } satisfies ErrorResponse,
        }
    }

    return {
        payload: instrument,
    }
}
