// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as DAR from './dar.ts'
import commands from './commands.ts'
import * as utils from './utils.ts'
import type { SpliceCodegen } from '../types.ts'

export const module: SpliceCodegen<typeof DAR, typeof commands> = {
    DAR,
    commands,
    utils,
}
