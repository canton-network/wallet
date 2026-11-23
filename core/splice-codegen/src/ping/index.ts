// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SpliceCodegen } from '../types'
import commands from './commands'
import * as DAR from './dar'

export const module: Omit<
    SpliceCodegen<typeof DAR, typeof commands>,
    'utils'
> = {
    commands,
    DAR,
}
