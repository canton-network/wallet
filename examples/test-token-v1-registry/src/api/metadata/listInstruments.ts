// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { OperationHandler } from '../../openapi-ts/token-metadata-v1'
import { instruments } from './common'

export const listInstruments: OperationHandler<
    'listInstruments'
> = async () => {
    return {
        instruments,
    }
}
