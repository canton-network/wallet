// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { prompt } from '@optique/clack'
import { argument, choice, message, option, text } from '@optique/core'
import { path } from '@optique/run/valueparser'
import { copyTemplate } from '../copy-template'

export const dappTemplates = ['lit', 'vue', 'react'] as const

export type DappTemplate = (typeof dappTemplates)[number]

export const dappTemplateNames: Record<DappTemplate, string> = {
    lit: 'Lit',
    vue: 'Vue',
    react: 'React',
}

const defaultDirectory = 'my-canton-app'

export const dappTemplate = prompt(
    option('--template', choice(dappTemplates, { metavar: 'TEMPLATE' }), {
        description: message`The dApp starter template.`,
    }),
    {
        type: 'select',
        message: 'Which dApp template should be used?',
        options: dappTemplates.map((template) => ({
            value: template,
            label: dappTemplateNames[template],
        })),
    }
)

/**
 * Positional `DIRECTORY` argument that prompts in a terminal and falls back to
 * `my-canton-app` in non-interactive use.
 *
 * @param label What is being created, used in the help text and prompt.
 */
export function dappDirectory(label = 'dApp') {
    return prompt(
        argument(path({ metavar: 'DIRECTORY' }), {
            description: message`A new or empty directory for the ${text(label)}.`,
        }),
        {
            type: 'text',
            message: `Where should the ${label} be created?`,
            initialValue: defaultDirectory,
            when: () => process.stdin.isTTY && process.stdout.isTTY,
            otherwise: defaultDirectory,
        }
    )
}

export function createDapp(template: DappTemplate, directory: string) {
    return copyTemplate(`dapp/${template}`, directory)
}
