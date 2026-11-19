// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineCommand } from '@optique/discover'
import { object } from '@optique/core'

const dappLit = defineCommand({
    path: ['dapp-lit'],
    parser: object({}),
    handler(value) {
        console.log('lit', value)
    },
})

const dappVue = defineCommand({
    path: ['dapp-vue'],
    parser: object({}),
    handler(value) {
        console.log('vue', value)
    },
})

const dappReact = defineCommand({
    path: ['dapp-react'],
    parser: object({}),
    handler(value) {
        console.log('react', value)
    },
})

export default [dappLit, dappVue, dappReact] as const
