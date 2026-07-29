// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { AllowedRoute } from '@canton-network/core-wallet-ui-components'

const VERSION_PREFIX = 'com.splice.wallet.v1'

class StateManager {
    static localStorageKey(item: string, origin: string): string {
        return `${VERSION_PREFIX}.${origin}.${item}`
    }

    constructor() {
        // delete any old storage entries not corresponding to the current version
        for (const key in localStorage) {
            if (!key.startsWith(VERSION_PREFIX)) {
                localStorage.removeItem(key)
            }
        }
    }

    private state: Map<string, string> = new Map()

    private getWithStorage(
        key: string,
        origin: string,
        storage: Storage = localStorage
    ): string | undefined {
        if (this.state.has(key)) {
            return this.state.get(key)
        }

        const value = storage.getItem(StateManager.localStorageKey(key, origin))

        if (value) {
            this.state.set(key, value)
            return value
        }

        return undefined
    }

    private setWithStorage(
        key: string,
        value: string,
        origin: string,
        storage: Storage = localStorage
    ) {
        storage.setItem(StateManager.localStorageKey(key, origin), value)
        this.state.set(key, value)
    }

    private clearWithStorage(
        key: string,
        origin: string,
        storage: Storage = localStorage
    ) {
        storage.removeItem(StateManager.localStorageKey(key, origin))
        this.state.delete(key)
    }

    accessToken = {
        get: (origin: string) => this.getWithStorage('accessToken', origin),
        set: (token: string, origin: string) =>
            this.setWithStorage('accessToken', token, origin),
        clear: (origin: string) => this.clearWithStorage('accessToken', origin),
    }

    networkId = {
        get: (origin: string) => this.getWithStorage('networkId', origin),
        set: (networkId: string, origin: string) =>
            this.setWithStorage('networkId', networkId, origin),
        clear: (origin: string) => this.clearWithStorage('networkId', origin),
    }

    expirationDate = {
        get: (origin: string) => this.getWithStorage('expirationDate', origin),
        set: (expirationDate: string, origin: string) =>
            this.setWithStorage('expirationDate', expirationDate, origin),
        clear: (origin: string) =>
            this.clearWithStorage('expirationDate', origin),
    }

    intendedPage = {
        get: (origin: string) =>
            this.getWithStorage('intendedPage', origin) as
                AllowedRoute | undefined,
        set: (page: AllowedRoute, origin: string) =>
            this.setWithStorage('intendedPage', page, origin),
        clear: (origin: string) =>
            this.clearWithStorage('intendedPage', origin),
    }

    currentOrigin = {
        get: () => this.getWithStorage('origin', 'current', sessionStorage),
        set: (origin: string) =>
            this.setWithStorage('origin', origin, 'current', sessionStorage),
        clear: () => this.clearWithStorage('origin', 'current', sessionStorage),
    }

    sessionId = {
        get: (origin: string) => this.getWithStorage('sessionId', origin),
        set: (sessionId: string, origin: string) =>
            this.setWithStorage('sessionId', sessionId, origin),
        clear: (origin: string) => this.clearWithStorage('sessionId', origin),
    }

    clearAuthState(origin: string): void {
        this.accessToken.clear(origin)
        this.networkId.clear(origin)
        this.expirationDate.clear(origin)
        this.intendedPage.clear(origin)
        this.sessionId.clear(origin)
    }
}

export const stateManager = new StateManager()
