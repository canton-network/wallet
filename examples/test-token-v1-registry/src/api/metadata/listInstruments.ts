// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { instruments, MetadataAPIHandler } from './common'

/**
 * @returns API payload containing the full in-memory list of instrument metadata.
 */
export const listInstruments: MetadataAPIHandler<
    'listInstruments'
> = async () => {
    return {
        payload: {
            instruments,
        },
    }
}
