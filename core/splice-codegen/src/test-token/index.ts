// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as DAR from './dar'
import commands from './commands'
import * as utils from './utils'
import { SpliceCodegen } from 'src/types'

export const module: SpliceCodegen<typeof DAR, typeof commands> = {
    DAR,
    commands,
    utils,
}
