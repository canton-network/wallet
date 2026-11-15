#!/usr/bin/env node
// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { message } from '@optique/core'
import { runProgram } from '@optique/discover'
import commands from './commands'
import { configureLogging } from './logger'

await runProgram({
    commands,
    metadata: {
        name: 'wallet',
        brief: message`Wallet CLI tools.`,
    },
    aboveError: 'usage',
    hooks: {
        beforeEach: ({ value }) => configureLogging(value),
    },
})
