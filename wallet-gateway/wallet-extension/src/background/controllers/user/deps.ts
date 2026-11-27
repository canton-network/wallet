// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    SigningProvider,
    type SigningDriverInterface,
} from '@canton-network/core-signing-lib'
import type {
    INotificationService,
    SigningDrivers,
} from '@canton-network/core-wallet-services'
import type { Store } from '@canton-network/core-wallet-store'

import type { AuthContextStore } from '../../auth-context.ts'
import type { SitePorts } from '../../notifications.ts'

/** What every area module of the user controller gets. */
export interface UserControllerDeps {
    /** The wallet store, scoped to the signed-in user. */
    getStore: () => Promise<Store>
    /** The signed-in user's token and user ID. */
    authContext: AuthContextStore
    /** The wallet-kernel (internal) signing driver. */
    signingDriver: SigningDriverInterface
    notificationService: INotificationService
    /** Where a transaction's events go: the site that asked for it. */
    sitePorts: Pick<SitePorts, 'send'>
}

// TODO(#2498/#2406): use the HD-wallet driver.
/** The signing drivers by provider. Only the wallet kernel is supported. */
export const toSigningDrivers = (
    signingDriver: SigningDriverInterface
): SigningDrivers => ({
    [SigningProvider.WALLET_KERNEL]: signingDriver,
})
