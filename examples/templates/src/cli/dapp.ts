// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineCommand } from '@optique/discover'
import { argument, message, object } from '@optique/core'
import { prompt } from '@optique/clack'
import { path } from '@optique/run/valueparser'
import { copyTemplate } from './copy-template'

const defaultDirectory = 'my-canton-app'

function dappCommand(framework: 'Lit' | 'React') {
    const slug = framework.toLowerCase()
    return defineCommand({
        path: [`dapp-${slug}`],
        parser: object({
            directory: prompt(
                argument(path({ metavar: 'DIRECTORY' }), {
                    description: message`A new or empty directory for the ${framework} dApp.`,
                }),
                {
                    type: 'text',
                    message: `Where should the ${framework} dApp be created?`,
                    initialValue: defaultDirectory,
                    when: () => process.stdin.isTTY && process.stdout.isTTY,
                    otherwise: defaultDirectory,
                }
            ),
        }),
        async handler({ directory }) {
            await copyTemplate(`dapp/${slug}`, directory)
            console.log(`Created the ${framework} dApp in ${directory}.`)
        },
    })
}

const dappVue = defineCommand({
    path: ['dapp-vue'],
    parser: object({}),
    handler(value) {
        console.log('vue', value)
    },
})

export default [dappCommand('Lit'), dappVue, dappCommand('React')] as const
