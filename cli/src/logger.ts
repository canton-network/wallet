// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getLogger } from '@logtape/logtape'
import { object, option, withDefault } from '@optique/core'
import { loggingOptions, logOutput, textFormatter } from '@optique/logtape'

export const loggingParser = object({
    logging: object({
        options: loggingOptions({ level: 'debug' }),
        output: withDefault(logOutput(), '-'),
        formatter: withDefault(
            option('--log-format', textFormatter()),
            'color'
        ),
    }),
})

export const logger = getLogger('wallet-cli')
