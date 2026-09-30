// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { DappSDK, RemoteAdapter } from '@canton-network/dapp-sdk'
import {
    pickWallet,
    type WalletPickerResult,
} from '@canton-network/core-wallet-ui-components'
import type { Config } from './config.ts'
import {
    type TestProvider,
    UserInteractionWrapper,
    WindowEventWrapper,
    WebhookWrapper,
    type InteractionHandler,
    abortable,
} from '@canton-network/core-provider-conformance'

export async function createSession(
    config: Config,
    manual: InteractionHandler,
    signal: AbortSignal = new AbortController().signal
): Promise<TestProvider> {
    signal.throwIfAborted()
    const sdk = new DappSDK({
        walletPicker: async (entries) => {
            let entry: WalletPickerResult | undefined
            if (config.provider.type === 'extension') {
                const providerId = `browser:ext:${config.provider.target}`
                entry = entries.find((entry) => entry.providerId === providerId)
            } else if (config.provider.type === 'remote') {
                const providerId = `remote:${config.provider.url}`
                entry = entries.find((entry) => entry.providerId === providerId)
            } else {
                entry = await pickWallet(entries)
            }

            if (!entry) throw new Error('No wallet entry was selected')

            return entry
        },
    })

    if (config.provider.type === 'remote') {
        await sdk.init({
            defaultAdapters: [
                new RemoteAdapter({
                    name: config.provider.url,
                    rpcUrl: config.provider.url,
                }),
            ],
        })
    } else {
        await sdk.init()
    }

    signal.throwIfAborted()
    const connection = await abortable(sdk.connect(), signal)
    const connectedProvider = sdk.getConnectedProvider()
    if (!connection.isConnected || !connectedProvider) {
        throw new Error('Wallet setup did not establish a connection')
    }

    switch (config.wrapper.type) {
        case 'manual':
            return new UserInteractionWrapper(connectedProvider, manual, signal)
        case 'window':
            return new WindowEventWrapper(connectedProvider, window, signal)
        case 'webhook':
            return new WebhookWrapper(
                connectedProvider,
                config.wrapper.url,
                signal
            )
    }
}
