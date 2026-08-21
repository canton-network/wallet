// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getConsoleSink, getLogger, type Config } from '@logtape/logtape'

// root logger for the whole wallet extension
export const logger = getLogger('wallet-ext')

export const configuration: Config<string, string> = {
    sinks: {
        console: getConsoleSink(),
    },
    loggers: [
        { category: 'wallet-ext', lowestLevel: 'debug', sinks: ['console'] },
    ],
}
