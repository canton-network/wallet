// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ConfigSchema, defaultConfig } from './config.ts'
import type { Config } from './config.ts'

type FakeWallet = {
    providerId: string
    connects: boolean
    provider: {
        request: () => Promise<string>
        on: () => void
        emit: () => boolean
        removeListener: () => void
    }
}
type PickerEntry = { providerId: string }

const { discovered, pickWalletMock, fakeWallet } = vi.hoisted(() => ({
    discovered: [] as FakeWallet[],
    pickWalletMock: vi.fn(),
    fakeWallet: (providerId: string, connects = true): FakeWallet => ({
        providerId,
        connects,
        // Answers every request with its own id, so tests can tell which wallet a session talks to.
        provider: {
            request: async () => providerId,
            on: () => {},
            emit: () => false,
            removeListener: () => {},
        },
    }),
}))

vi.mock('@canton-network/core-wallet-ui-components', () => ({
    pickWallet: pickWalletMock,
}))

// Connects to whichever discovered wallet (or default adapter) the picker returns.
vi.mock('@canton-network/dapp-sdk', () => ({
    DappSDK: class {
        readonly #walletPicker: (entries: PickerEntry[]) => Promise<PickerEntry>
        readonly #wallets = [...discovered]
        #connected: FakeWallet | undefined
        constructor(options: {
            walletPicker: (entries: PickerEntry[]) => Promise<PickerEntry>
        }) {
            this.#walletPicker = options.walletPicker
        }
        async init(options?: { defaultAdapters?: FakeWallet[] }) {
            this.#wallets.push(...(options?.defaultAdapters ?? []))
        }
        async connect() {
            const { providerId } = await this.#walletPicker(
                this.#wallets.map((wallet) => ({
                    providerId: wallet.providerId,
                }))
            )
            this.#connected = this.#wallets.find(
                (wallet) => wallet.providerId === providerId
            )
            return { isConnected: this.#connected?.connects ?? false }
        }
        getConnectedProvider() {
            return this.#connected?.provider
        }
    },
    RemoteAdapter: class {
        constructor({ rpcUrl }: { rpcUrl: string }) {
            return fakeWallet(`remote:${rpcUrl}`)
        }
    },
}))

import { createSession } from './session.ts'

const manual = async () => {}
const extension = { type: 'extension', target: 'my-ext' } as const

function configWith(
    provider: Config['provider'],
    wrapper: Config['wrapper'] = { type: 'manual' }
): Config {
    return ConfigSchema.parse({ ...defaultConfig, provider, wrapper })
}

describe('createSession', () => {
    beforeEach(() => {
        discovered.splice(
            0,
            discovered.length,
            fakeWallet('browser:ext:my-ext'),
            fakeWallet('browser:ext:other')
        )
        pickWalletMock.mockReset()
    })

    it('connects to the configured extension', async () => {
        const session = await createSession(configWith(extension), manual)
        await expect(session.request({ method: 'status' })).resolves.toBe(
            'browser:ext:my-ext'
        )
    })

    it('fails when no discovered wallet matches the extension target', async () => {
        await expect(
            createSession(
                configWith({ type: 'extension', target: 'missing' }),
                manual
            )
        ).rejects.toThrow('No wallet entry was selected')
    })

    it('connects to the configured remote gateway', async () => {
        const session = await createSession(
            configWith({ type: 'remote', url: 'http://localhost:3030' }),
            manual
        )
        await expect(session.request({ method: 'status' })).resolves.toBe(
            'remote:http://localhost:3030'
        )
    })

    it('connects to the wallet chosen in the picker', async () => {
        pickWalletMock.mockImplementation(async (entries: PickerEntry[]) =>
            entries.find((entry) => entry.providerId === 'browser:ext:other')
        )
        const session = await createSession(
            configWith({ type: 'picker' }),
            manual
        )
        await expect(session.request({ method: 'status' })).resolves.toBe(
            'browser:ext:other'
        )
    })

    it('fails when the wallet does not establish a connection', async () => {
        discovered.push(fakeWallet('browser:ext:refusing', false))
        await expect(
            createSession(
                configWith({ type: 'extension', target: 'refusing' }),
                manual
            )
        ).rejects.toThrow('Wallet setup did not establish a connection')
    })

    it('asks the tester for wallet actions with the manual wrapper', async () => {
        const handler = vi.fn(async () => {})
        const session = await createSession(configWith(extension), handler)
        await session.test_approveConnect()
        expect(handler).toHaveBeenCalledWith(
            expect.objectContaining({ method: 'connect', decision: 'approve' }),
            expect.any(AbortSignal)
        )
    })
})
