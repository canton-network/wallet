#!/usr/bin/env node
// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineProgram } from '@optique/core/program'
import commandsParser from './commands'
import { run } from '@optique/run'
import { merge } from '@optique/core'
import { loggingParser } from './logger'
import { createLoggingConfig } from '@optique/logtape'
import { configure } from '@logtape/logtape'

const parser = merge(commandsParser, loggingParser)

const program = defineProgram({
    parser,
    metadata: { name: 'wallet' },
})

const result = run(program)

const loggerConfig = await createLoggingConfig(result.logging.options)
await configure(loggerConfig)
