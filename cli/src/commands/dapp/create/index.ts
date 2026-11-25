// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    createDapp,
    dappDirectory,
    dappTemplate,
    dappTemplateNames,
} from '@canton-network/create'
import { merge, message, object } from '@optique/core'
import { defineCommand } from '@optique/discover'
import { logger, loggingParser } from '../../../logger'

export default defineCommand({
    path: ['dapp', 'create'],
    parser: merge(
        object({ template: dappTemplate, directory: dappDirectory() }),
        loggingParser
    ),
    metadata: {
        brief: message`Create dApp UI template.`,
    },
    async handler({ template, directory }) {
        logger.debug(`Creating ${template} dApp template`)

        try {
            await createDapp(template, directory)
            logger.info(
                `Created the ${dappTemplateNames[template]} dApp in ${directory}`
            )
        } catch (error) {
            logger.error(
                `Failed to create dApp: ${error instanceof Error ? error.message : String(error)}`
            )
            process.exitCode = 1
        }
    },
})
