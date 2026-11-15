// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { configure, getLogger } from '@logtape/logtape'
import { object } from '@optique/core'
import {
    createLoggingConfig,
    loggingOptions,
    type LoggingOptionsResult,
} from '@optique/logtape'

// runProgram() has no program-level parser, so every command must merge this
// into its own parser for the logging options to be accepted.
export const loggingParser = object({
    logging: loggingOptions({ level: 'debug', formatter: '--log-format' }),
})

function hasLoggingOptions(
    value: unknown
): value is { logging: LoggingOptionsResult } {
    return typeof value === 'object' && value !== null && 'logging' in value
}

export async function configureLogging(value: unknown): Promise<void> {
    if (!hasLoggingOptions(value)) {
        throw new TypeError(
            'Command parser is missing logging options; merge loggingParser into it.'
        )
    }
    await configure(
        await createLoggingConfig(
            value.logging,
            {},
            {
                loggers: [
                    {
                        // Keep LogTape's internal diagnostics at warning level or above.
                        category: ['logtape', 'meta'],
                        lowestLevel: 'warning',
                        // Send those diagnostics to the sink configured by the CLI.
                        sinks: ['default'],
                        // Prevent inheriting additional sinks from parent loggers.
                        parentSinks: 'override',
                    },
                ],
            }
        )
    )
}

export const logger = getLogger('wallet-cli')
