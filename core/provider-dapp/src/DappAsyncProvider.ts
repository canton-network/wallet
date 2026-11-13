// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import SpliceWalletJSONRPCRemoteDAppAPI, {
    type RpcTypes as DappAsyncRpcTypes,
    type Session,
} from '@canton-network/core-wallet-dapp-remote-rpc-client'
import { AbstractProvider } from '@canton-network/core-splice-provider'
import { HttpTransport } from '@canton-network/core-rpc-transport'
import {
    isSpliceMessageEvent,
    type RequestArgs,
    WalletEvent,
} from '@canton-network/core-types'

// Maintain a global SSE connection in-memory to avoid multiple connections
// per DappAsyncProvider instance.
type GatewaySSE = {
    // Gateway event endpoint, without the ticket query.
    url: string
    token: string
    eventSource: EventSource
    listeners: Set<(event: string, args: unknown[]) => void>
} | null

let connection: GatewaySSE = null

function parseSSEData(data: string): unknown[] {
    try {
        const parsed = JSON.parse(data)
        return Array.isArray(parsed) ? parsed : [parsed]
    } catch {
        return [data]
    }
}

export class DappAsyncProvider extends AbstractProvider<DappAsyncRpcTypes> {
    private sessionToken?: string
    private url: URL
    private client: SpliceWalletJSONRPCRemoteDAppAPI
    private status?: Session | undefined
    private readonly sseForwarder = (event: string, args: unknown[]) => {
        this.emit(event, ...args)
    }

    private createClient(
        sessionToken?: string
    ): SpliceWalletJSONRPCRemoteDAppAPI {
        const transport = new HttpTransport(this.url, sessionToken)
        return new SpliceWalletJSONRPCRemoteDAppAPI(transport)
    }

    private openSSE(url: URL, token: string): void {
        void this.connectSSE(url, token)
    }

    private async connectSSE(url: URL, token: string): Promise<void> {
        const base = url.toString().replace(/\/?$/, '/')
        const endpoint = new URL('events', base).toString()

        if (
            connection &&
            connection.token === token &&
            connection.url === endpoint
        ) {
            connection.listeners.add(this.sseForwarder)
            return
        }

        const ticketUrl = new URL('events/ticket', base)
        let ticket = ''
        try {
            const response = await fetch(ticketUrl, {
                method: 'POST',
                headers: {
                    authorization: `Bearer ${token}`,
                    'content-type': 'application/json',
                },
                body: '{}',
            })
            if (!response.ok) return
            const body = (await response.json()) as { ticket?: unknown }
            if (typeof body.ticket === 'string') ticket = body.ticket
        } catch {
            return
        }

        // Auth can move on while this request is in flight.
        if (this.sessionToken !== token || !ticket) return

        if (
            connection &&
            connection.token === token &&
            connection.url === endpoint
        ) {
            connection.listeners.add(this.sseForwarder)
            return
        }

        if (connection) {
            connection.eventSource.close()
            connection = null
        }

        const sseUrl = new URL(endpoint)
        sseUrl.searchParams.set('ticket', ticket)
        const eventSource = new EventSource(sseUrl.toString())
        const dispatchToProviders =
            (eventName: string) => (event: MessageEvent) => {
                const args = parseSSEData(event.data)
                connection?.listeners.forEach((listener) => {
                    listener(eventName, args)
                })
            }

        eventSource.onmessage = dispatchToProviders('message')

        eventSource.addEventListener(
            'accountsChanged',
            dispatchToProviders('accountsChanged')
        )
        eventSource.addEventListener(
            'statusChanged',
            dispatchToProviders('statusChanged')
        )
        eventSource.addEventListener(
            'connected',
            dispatchToProviders('connected')
        )
        eventSource.addEventListener(
            'txChanged',
            dispatchToProviders('txChanged')
        )
        eventSource.addEventListener(
            'messageSignature',
            dispatchToProviders('messageSignature')
        )

        eventSource.onerror = () => {
            if (connection?.eventSource === eventSource) {
                connection.eventSource.close()
                connection = null
            }
        }

        connection = {
            eventSource,
            url: endpoint,
            token,
            listeners: new Set(),
        }

        connection.listeners.add(this.sseForwarder)
    }

    constructor(url: URL | string, sessionToken?: string) {
        super()
        this.url = typeof url === 'string' ? new URL(url) : url

        if (sessionToken) {
            this.sessionToken = sessionToken
            this.openSSE(this.url, sessionToken)
        }

        this.client = this.createClient(sessionToken)

        // Listen for the auth success event sent from the WK UI popup to the SDK running in the parent window.
        window.addEventListener('message', async (event) => {
            if (!isSpliceMessageEvent(event)) return

            if (
                event.data.type === WalletEvent.SPLICE_WALLET_IDP_AUTH_SUCCESS
            ) {
                this.sessionToken = event.data.token
                this.client = this.createClient(this.sessionToken)
                this.openSSE(this.url, event.data.token)

                // We requery the status explicitly here, as it's not guaranteed that the socket will be open & authenticated
                // before the `statusChanged` event is fired from the `addSession` RPC call. The dappApi.StatusResult and
                // dappApi.StatusEvent are mapped manually to avoid dependency.
                this.request({ method: 'status' })
                    .then((status) => {
                        //for some reason comparing the objects directly dosent work as intended
                        if (
                            // TODO this is not ideal as it's possible for same object to have different keys order after stringify
                            JSON.stringify(status.session) !==
                            JSON.stringify(this.status)
                        ) {
                            this.emit('statusChanged', status)
                            this.status = status.session
                        }
                    })
                    .catch((err) => {
                        console.error(
                            'Error requesting status after auth:',
                            err
                        )
                    })
            }
        })
    }

    public async request<M extends keyof DappAsyncRpcTypes>(
        args: RequestArgs<DappAsyncRpcTypes, M>
    ): Promise<DappAsyncRpcTypes[M]['result']> {
        return await this.client.request<M>(args)
    }
}
