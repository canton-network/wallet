// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
    JsonRpcResponse,
    JsonRpcRequest,
} from '@canton-network/core-types'

// promise-ify an asynchronous callback with a timeout
async function waitUntilTimeout<T>(
    name: string,
    cb: (
        resolve: (value: T) => void,
        reject: (reason?: string) => void
    ) => void,
    timeout: number = 5000
): Promise<T> {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(
                new Error(
                    `Timed out waiting for callback "${name}" (${timeout} ms)`
                )
            )
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
    logger.debug('Waiting for connection from content script...')
    return waitUntilTimeout<Browser.runtime.Port>(
        'waitForConnection',
        (resolve) => {
            logger.debug('Waiting for connection from content script...')
            browser.runtime.onConnect.addListener((port) => {
                logger.debug('Connected to content script: ', { port })
                resolve(port)
            })
        }
    )
}

/**
 * This class provides a type-safe communication channel between a content script and a background script in a browser extension.
 * It allows sending and receiving JSON-RPC messages over the established connection.
 */
class ExtensionMessenger {
    private _port: Browser.runtime.Port | undefined

    constructor(role: 'content' | 'background', name: string) {
        if (role === 'content') {
            this._port = browser.runtime.connect({ name })
        }
    }

    async port(): Promise<Browser.runtime.Port> {
        if (this._port) {
            return this._port
        }

        // wait for connection from content script
        this._port = await waitForConnection()
        return this._port
    }

    async sendJsonRpc(message: JsonRpcRequest): Promise<JsonRpcResponse> {
        const port = await this.port()
        return waitUntilTimeout<JsonRpcResponse>('sendJsonRpc', (resolve) => {
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
        logger.info(
            'Setting up JSON-RPC request listener in background script...'
        )
        const port = await this.port()
        logger.info({ port })

        port.onMessage.addListener((message: JsonRpcRequest) => {
            callback(message).then((response) => {
                port.postMessage(response)
            })
        })
    }
}
