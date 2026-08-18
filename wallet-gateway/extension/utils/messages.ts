// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
    JsonRpcResponse,
    JsonRpcRequest,
} from '@canton-network/core-types'

// promise-ify an asynchronous callback with a timeout
async function waitUntilTimeout<T>(
    cb: (
        resolve: (value: T) => void,
        reject: (reason?: string) => void
    ) => void,
    timeout: number = 5000
): Promise<T> {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error(`Timed out waiting for callback (${timeout} ms)`))
        }, timeout) // 5 seconds timeout

        cb(
            (value: T) => {
                clearTimeout(timeoutId)
                resolve(value)
            },
            (reason?: string) => {
                clearTimeout(timeoutId)
                reject(
                    reason ? new Error(reason) : new Error('Callback rejected')
                )
            }
        )
    })
}

async function waitForConnection(): Promise<Browser.runtime.Port> {
    return waitUntilTimeout<Browser.runtime.Port>((resolve) => {
        browser.runtime.onConnect.addListener((port) => {
            resolve(port)
        })
    })
}

/**
 * This class provides a type-safe communication channel between a content script and a background script in a browser extension.
 * It allows sending and receiving JSON-RPC messages over the established connection.
 */
class ExtensionMessenger {
    private _port: Browser.runtime.Port | undefined

    constructor(role: 'content' | 'background', name: string) {
        if (role === 'content') {
            // connect
            this._port = browser.runtime.connect({ name })
        } else {
            waitForConnection().then((port) => {
                this._port = port
            })
        }
    }

    async port(): Promise<Browser.runtime.Port> {
        try {
            return await waitUntilTimeout<Browser.runtime.Port>((resolve) => {
                // use setInterval to check if the port is connected
                const interval = setInterval(() => {
                    if (this._port) {
                        clearInterval(interval)
                        resolve(this._port)
                    }
                }, 100) // check every 100ms
            })
        } catch {
            throw new Error('Port is not connected')
        }
    }

    async sendJsonRpc(message: JsonRpcRequest): Promise<JsonRpcResponse> {
        const port = await this.port()
        return waitUntilTimeout<JsonRpcResponse>((resolve) => {
            const listener = (response: JsonRpcResponse) => {
                if (response.id === message.id) {
                    port.onMessage.removeListener(listener)
                    resolve(response)
                }
            }

            port.onMessage.addListener(listener)
            port.postMessage(message)
        })
    }
}

export class ContentMessenger extends ExtensionMessenger {
    constructor(name: string) {
        super('content', name)
    }
}

export class BackgroundMessenger extends ExtensionMessenger {
    constructor(name: string) {
        super('background', name)
    }

    async onJsonRpcRequest(
        callback: (message: JsonRpcRequest) => Promise<JsonRpcResponse>
    ) {
        const port = await this.port()
        port.onMessage.addListener(async (message: JsonRpcRequest) => {
            const response = await callback(message)
            port.postMessage(response)
        })
    }
}
