// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { registerService } from '@webext-core/proxy-service'
import { configure } from '@logtape/logtape'
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

    const walletStore = initializeWalletStore()

    const dappControllerInstance = dappController(walletStore)
    registerService(DAPP_RPC_KEY, dappControllerInstance)

    const userControllerInstance = userController(
        Promise.resolve({ store: walletStore })
    )
    registerService(USER_RPC_KEY, userControllerInstance)
}
