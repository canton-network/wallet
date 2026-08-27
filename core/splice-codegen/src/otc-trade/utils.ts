// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { packageId } from './dar'
import { vetDarFactory } from 'src/common'

export const vetDar = vetDarFactory(
    '../../../.localnet/dars/splice-otc-trade-v1-1.0.0.dar',
    packageId
)
