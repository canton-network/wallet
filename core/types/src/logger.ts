// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getLogger, Logger, LogLevel } from '@logtape/logtape'

interface ConditionalLogger extends Logger {
    conditional: (
        message: string,
        info: Record<string, unknown>,
        debug: Record<string, unknown>
    ) => void
    with: (properties: Record<string, unknown>) => ConditionalLogger
}

export const getLoggerConditional = (
    category?: string | readonly string[] | undefined
): ConditionalLogger => {
    const logger = getLogger(category)

    return {
        ...logger,
        conditional: (
            message: string,
            base: Record<string, unknown>,
            extra?: Record<string, unknown>,
            level: LogLevel = 'debug'
        ) => {
            if (logger.isEnabledFor(level)) {
                logger.info(message, { ...base, ...extra })
            } else {
                logger.info(message, base)
            }
        },
    } as ConditionalLogger
}
