// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { configure } from '@logtape/logtape'
import { jsonRpcHandler } from './json-rpc-handler'
import { initializeWalletStore } from './store'

export default defineBackground(() => {
    run().catch((err) => {
        logger.error('Error initializing background script: ', { err })
    })
})

// defineBackground's main function cannot be async, so wrap here
async function run() {
    await configure(configuration)

    logger.info(
        'Initializing Canton Wallet browser extension: ' + browser.runtime.id
    )

    const store = initializeWalletStore()
    const jsonApiProxy = new BackgroundMessenger('json-rpc-proxy')

    jsonRpcHandler(jsonApiProxy, store)
}
