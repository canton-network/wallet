// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    localNetStaticConfig,
    SDK,
    WalletSDKTestTokenPlugin,
} from '@canton-network/wallet-sdk'

const sdk = (
    await SDK.create({
        auth: {
            method: 'self_signed',
            issuer: 'unsafe-auth',
            credentials: {
                clientId: localNetStaticConfig.LOCALNET_USER_ID,
                clientSecret: 'unsafe',
                audience: 'https://canton.network.global',
                scope: '',
            },
        },
        ledgerClientUrl: localNetStaticConfig.LOCALNET_APP_USER_LEDGER_URL,
    })
).registerPlugins({
    testToken: WalletSDKTestTokenPlugin,
})

export default sdk
