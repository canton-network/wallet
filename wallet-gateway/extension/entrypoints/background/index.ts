// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { registerService } from '@webext-core/proxy-service'
import { initializeWalletStore, loadAuthedStore } from './store'
import { dappController } from './dapp/controller'
import { userController } from './user/controller'
import { AuthService } from './auth-service'

export default defineBackground(() => {
    registerService(AUTH_SERVICE_KEY, AuthService)

    run().catch((e: unknown) => {
        logger.error('Error initializing background script {*}', { error: e })
    })
})

// defineBackground's main function cannot be async, so wrap here
async function run() {
    logger.info(
        'Initializing Canton Wallet browser extension: ' + browser.runtime.id
    )

    const walletStore = await initializeWalletStore()

    const dappControllerInstance = dappController(() =>
        loadAuthedStore(walletStore)
    )
    registerService(DAPP_RPC_KEY, dappControllerInstance)

    const userControllerInstance = userController(() =>
        loadAuthedStore(walletStore)
    )
    registerService(USER_RPC_KEY, userControllerInstance)
}
