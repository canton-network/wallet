// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineCommand } from '@optique/discover'
import { object } from '@optique/core'
import {
    createDapp,
    dappDirectory,
    dappTemplateNames,
    dappTemplates,
    type DappTemplate,
} from './parser'

function dappCommand(template: DappTemplate) {
    const name = `${dappTemplateNames[template]} dApp`
    return defineCommand({
        path: [`dapp-${template}`],
        parser: object({ directory: dappDirectory(name) }),
        async handler({ directory }) {
            await createDapp(template, directory)
            console.log(`Created the ${name} in ${directory}.`)
        },
    })
}

export default dappTemplates.map(dappCommand)
