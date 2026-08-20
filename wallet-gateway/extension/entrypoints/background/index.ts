// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { AnyController } from './json-rpc-handler'
import { configure } from '@logtape/logtape'
import { jsonRpcHandler } from './json-rpc-handler'
import { initializeWalletStore } from './store'
import { dappController } from './dapp/controller'
import { userController } from './user/controller'

export default defineBackground(() => {
    run().catch(() => {
        logger.error('Error initializing background script')
    })
})

// defineBackground's main function cannot be async, so wrap here
async function run() {
    await configure(configuration)

    logger.info(
        'Initializing Canton Wallet browser extension: ' + browser.runtime.id
    )

    const store = initializeWalletStore()

    const dappApiProxy = new BackgroundMessenger('dapp-rpc-proxy')
    jsonRpcHandler(dappApiProxy, dappController(store) as AnyController)

    const userApiProxy = new BackgroundMessenger('user-rpc-proxy')
    jsonRpcHandler(userApiProxy, userController(store) as AnyController)
}
