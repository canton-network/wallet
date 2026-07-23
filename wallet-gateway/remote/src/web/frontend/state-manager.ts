// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { AllowedRoute } from '@canton-network/core-wallet-ui-components'
import {
    encryptString,
    destroyTokenKey,
    decryptString,
} from './access-token-utils.js'

class StateManager {
    static localStorageKey(item: string): string {
        return `com.splice.wallet.${item}`
    }

    private state: Map<string, string> = new Map()

    private getWithStorage(key: string): string | undefined {
        if (this.state.has(key)) {
            return this.state.get(key)
        }

        const value = localStorage.getItem(StateManager.localStorageKey(key))

        if (value) {
            this.state.set(key, value)
            return value
        }

        return undefined
    }

    private setWithStorage(key: string, value: string) {
        localStorage.setItem(StateManager.localStorageKey(key), value)
        this.state.set(key, value)
    }

    private clearWithStorage(key: string) {
        localStorage.removeItem(StateManager.localStorageKey(key))
        this.state.delete(key)
    }

    private accessTokenCache: string | undefined
    private accessTokenLoaded = false

    accessToken2 = {
        get: async (): Promise<string | undefined> => {
            if (this.accessToken) return this.accessTokenCache
            const stored = localStorage.getItem(
                StateManager.localStorageKey('accessToken')
            )
            if (!stored) {
                this.accessTokenLoaded = true
                return undefined
            }
            try {
                this.accessTokenCache = await decryptString(stored)
            } catch (error) {
                localStorage.removeItem(
                    StateManager.localStorageKey('accessToken')
                )
                console.warn(error)
                this.accessTokenCache = undefined
            }
            this.accessTokenLoaded = true
            return this.accessTokenCache
        },
        set: async (token: string) => {
            const encryptedToken = await encryptString(token)
            this.accessTokenCache = encryptedToken
            this.accessTokenLoaded = true
        },
        clear: async () => {
            localStorage.removeItem(StateManager.localStorageKey('accessToken'))
            this.accessTokenCache = undefined
            this.accessTokenLoaded = false
        },
    }

    accessToken = {
        get: () => this.getWithStorage('accessToken'),
        set: (token: string) => this.setWithStorage('accessToken', token),
        clear: () => this.clearWithStorage('accessToken'),
    }

    networkId = {
        get: () => this.getWithStorage('networkId'),
        set: (networkId: string) => this.setWithStorage('networkId', networkId),
        clear: () => this.clearWithStorage('networkId'),
    }

    expirationDate = {
        get: () => this.getWithStorage('expirationDate'),
        set: (expirationDate: string) =>
            this.setWithStorage('expirationDate', expirationDate),
        clear: () => this.clearWithStorage('expirationDate'),
    }

    intendedPage = {
        get: () =>
            this.getWithStorage('intendedPage') as AllowedRoute | undefined,
        set: (page: AllowedRoute) => this.setWithStorage('intendedPage', page),
        clear: () => this.clearWithStorage('intendedPage'),
    }

    clearAuthState(): void {
        this.accessToken.clear()
        this.networkId.clear()
        this.expirationDate.clear()
        this.intendedPage.clear()
    }

    async revokeAccessToken(): Promise<void> {
        await this.accessToken2.clear()
        await destroyTokenKey()
    }
}

export const stateManager = new StateManager()
