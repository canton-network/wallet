// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { choice, merge, message, object, option } from '@optique/core'
import { prompt } from '@optique/clack'
import { defineCommand } from '@optique/discover'
import { logger, loggingParser } from '../../../logger'
import { path } from '@optique/run'

const availableTemplates = ['vue', 'react', 'lit'] as const

export default defineCommand({
    path: ['dapp', 'create'],
    parser: merge(
        object({
            output: prompt(option('--out', path()), {
                type: 'text',
                message: `Output path (${process.cwd()}):`,
            }),
            template: prompt(option('--template', choice(availableTemplates)), {
                type: 'select',
                message: 'Choose template (currently unused):',
                options: availableTemplates,
            }),
        }),
        loggingParser
    ),
    metadata: {
        brief: message`Create dApp UI template.`,
    },
    async handler(value) {
        logger.debug('Creating dApp template')

        try {
            // TODO: perform the main magic here
            logger.info(`Created dApp in ${value.output}`)
        } catch (error) {
            logger.error(
                `Failed to create dApp: ${error instanceof Error ? error.message : String(error)}`
            )
            process.exitCode = 1
        }
    },
})
