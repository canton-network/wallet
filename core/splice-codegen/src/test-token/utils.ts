// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { vetDarFactory } from '../common.ts'
import { packageId } from './dar.ts'

export const vetDar = vetDarFactory(
    '../../../.localnet/dars/splice-test-token-v1-1.0.0.dar',
    packageId
)
