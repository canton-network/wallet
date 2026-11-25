// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { InternalSigningDriver } from '@canton-network/core-signing-internal'
import { NotificationService } from '@canton-network/core-wallet-services'
import { browser } from 'wxt/browser'

import { logger } from '@/shared/logger.ts'
import {
    SITE_APPROVAL_RPC_KEY,
    TOKEN_RPC_KEY,
    TX_APPROVAL_RPC_KEY,
    USER_RPC_KEY,
} from '@/shared/service-keys.ts'

import { createAuthContextStore } from './auth-context.ts'
import { registerAuthService } from './auth-service.ts'
import { createDappDispatcher } from './controllers/dapp/dispatch.ts'
import { userController } from './controllers/user/index.ts'
import { transactionSubmitter } from './controllers/user/transactions.ts'
import { registerDappService } from './dapp-service.ts'
import { createKeepAlive } from './keep-alive.ts'
import {
    createSitePorts,
    currentSessionSubscriber,
    registerNotificationPorts,
} from './notifications.ts'
import { registerFirstRunOnboarding, registerOpenUiHandler } from './open-ui.ts'
import { createPagePresence } from './page-presence.ts'
import { currentSessionCheck } from './session-check.ts'
import { createSiteApprovals } from './site-approval.ts'
import { createApprovedSiteStore } from './store/approved-sites.ts'
import {
    createSigningStore,
    createWalletStore,
    loadAuthedStore,
} from './store/index.ts'
import { createRegistryStore } from './store/registries.ts'
import { createTabIcons } from './tab-icon.ts'
import { createTokenSdk } from './token/sdk.ts'
import { createTokenService } from './token/service.ts'
import { registerTrustedService } from './trusted-service.ts'
import { createTxApprovals } from './tx-approval.ts'
import { createUnlockRequests } from './unlock-request.ts'
import { registerVaultService } from './vault-service.ts'
import { createVault, requireUnlocked, type Vault } from './vault/index.ts'

/**
 * Runs in the service worker. Every listener is added in the first turn,
 * before any `await`, so a message or port connect that wakes the worker is
 * handled. The vault starts restoring right away; the gates await
 * `vault.ready`. `getStore()` rejects with `VaultLockedError` while the
 * vault is locked.
 *
 * Tests pass a `vault` with fewer PBKDF2 iterations.
 */
export function startBackground({
    vault = createVault(),
}: { vault?: Vault } = {}): void {
    // One notification service is shared by the dApp & user controllers and
    // the content-script notification ports.
    const notificationService = new NotificationService()
    const authContext = createAuthContextStore(vault)
    const walletStore = createWalletStore(vault)
    const getStore = async () =>
        loadAuthedStore(await walletStore.get(), authContext)
    // TODO(#2498/#2406): use the HD-wallet driver.
    const signingDriver = new InternalSigningDriver(createSigningStore(vault))
    const deps = { getStore, authContext, signingDriver, notificationService }
    const sites = createApprovedSiteStore(vault)
    const isCurrent = currentSessionCheck(getStore, authContext)
    const presence = createPagePresence()
    const tabIcons = createTabIcons(createKeepAlive())
    const siteApprovals = createSiteApprovals({
        vault,
        authContext,
        presence,
        tabIcons,
        isCurrent,
        sites,
    })
    const unlockRequests = createUnlockRequests({ vault, presence, tabIcons })
    const txApprovals = createTxApprovals({
        vault,
        authContext,
        presence,
        tabIcons,
        isCurrent,
        sites,
        notificationService,
        getStore: () => walletStore.get(),
        submitter: transactionSubmitter(deps),
    })
    const sitePorts = createSitePorts(vault, authContext)

    registerVaultService(vault)
    registerAuthService({ ...deps, vault })
    // The dApp controller scopes the store to each request's user itself.
    registerDappService(
        createDappDispatcher(
            {
                getStore: () => walletStore.get(),
                sites,
                siteApprovals,
                unlockRequests,
                txApprovals,
                sitePorts,
                isCurrent,
            },
            vault,
            authContext
        ),
        presence
    )
    registerTrustedService(
        USER_RPC_KEY,
        requireUnlocked(vault, userController(deps, txApprovals))
    )
    registerTrustedService(
        TOKEN_RPC_KEY,
        requireUnlocked(
            vault,
            createTokenService({
                getStore: () => walletStore.get(),
                authContext,
                registries: createRegistryStore(vault),
                createSdk: createTokenSdk,
                submitter: transactionSubmitter(deps),
            })
        )
    )
    registerTrustedService(
        SITE_APPROVAL_RPC_KEY,
        requireUnlocked(vault, siteApprovals.service)
    )
    registerTrustedService(
        TX_APPROVAL_RPC_KEY,
        requireUnlocked(vault, txApprovals.service)
    )
    registerNotificationPorts(
        notificationService,
        currentSessionSubscriber(getStore, authContext, sites),
        sitePorts
    )
    registerOpenUiHandler()
    registerFirstRunOnboarding()

    logger.info('Initializing Canton Wallet browser extension: {id}', {
        id: browser.runtime.id,
    })
}
