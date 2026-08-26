// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { InternalSigningDriver } from '@canton-network/core-signing-internal'
import { registerService } from '@webext-core/proxy-service'
import {
    initializeSigningStore,
    initializeWalletStore,
    loadAuthedStore,
} from './store'
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
    const signingStore = initializeSigningStore()
    const signingDriver = new InternalSigningDriver(signingStore)

    const dappControllerInstance = dappController(
        () => loadAuthedStore(walletStore),
        signingDriver
    )
    registerService(DAPP_RPC_KEY, dappControllerInstance)

    const userControllerInstance = userController(
        () => loadAuthedStore(walletStore),
        signingDriver
    )
    registerService(USER_RPC_KEY, userControllerInstance)
}
