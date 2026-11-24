#!/usr/bin/env node
// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { runProgram } from '@optique/discover'
import commands from './cli'
import { message } from '@optique/core'

await runProgram({
    commands,
    metadata: {
        name: 'template-create',
        brief: message`Create wallet-specific app from starter templates.`,
    },
}).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
})
