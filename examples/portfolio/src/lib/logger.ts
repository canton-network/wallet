// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    configureSync,
    defaultConsoleFormatter,
    getConsoleSink,
} from '@logtape/logtape'
import { pino } from 'pino'

export const logger = pino({ name: 'example-portfolio', level: 'debug' })

// Only the shared React hooks' warnings reach the console, not other core packages.
configureSync({
    reset: true,
    sinks: {
        console: getConsoleSink({
            formatter: (record) => {
                const args = defaultConsoleFormatter(record)
                return Object.keys(record.properties).length > 0
                    ? [...args, record.properties]
                    : args
            },
        }),
    },
    loggers: [
        {
            category: ['core', 'wallet-ui-components/react'],
            sinks: ['console'],
            lowestLevel: 'warning',
        },
        {
            category: ['logtape', 'meta'],
            sinks: ['console'],
            lowestLevel: 'warning',
        },
    ],
})
