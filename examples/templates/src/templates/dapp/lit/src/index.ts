// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as sdk from '@canton-network/dapp-sdk'
import type { StatusEvent, Wallet } from '@canton-network/dapp-sdk'
import { css, html, nothing } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { CantonComponent } from './components/common/base'
import './components'

// SDK errors may be plain JSON-RPC error objects rather than Error instances.
function errorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String(error.message)
    }
    return String(error)
}

@customElement('canton-app')
export class CantonApp extends CantonComponent {
    @state() private status: StatusEvent | null = null
    @state() private accounts: Wallet[] = []
    @state() private transactions: sdk.dappAPI.TxChangedEvent[] = []
    @state() private busy = false
    @state() private error: string | undefined

    private subscribed = false

    private get primaryParty() {
        if (!this.accounts.length) return
        return this.accounts.find((account) => account.primary)
    }

    private readonly onStatusChanged = (status: StatusEvent) => {
        this.status = status
        if (!status.connection.isConnected) {
            this.accounts = []
        }
    }

    private readonly onTransactionChanged = (
        event: sdk.dappAPI.TxChangedEvent
    ) => {
        this.transactions = [event, ...this.transactions]
    }

    private readonly onAccountsChanged = (accounts: Wallet[]) => {
        this.accounts = accounts
    }

    override connectedCallback() {
        super.connectedCallback()
        // Restore a previous session, if any; no session is not an error.
        this.refresh().catch(() => undefined)
    }

    override disconnectedCallback() {
        super.disconnectedCallback()
        this.unsubscribe().catch(() => undefined)
    }

    private get connected() {
        return this.status?.connection.isConnected ?? false
    }

    private async refresh() {
        this.status = await sdk.status()
        if (!this.connected) {
            this.accounts = []
            return
        }

        this.accounts = await sdk.listAccounts()

        if (!this.subscribed) {
            await sdk.onStatusChanged(this.onStatusChanged)
            await sdk.onAccountsChanged(this.onAccountsChanged)
            await sdk.onTxChanged(this.onTransactionChanged)
            this.subscribed = true
        }
    }

    private async unsubscribe() {
        if (!this.subscribed) return
        this.subscribed = false
        await sdk.removeOnStatusChanged(this.onStatusChanged)
        await sdk.removeOnAccountsChanged(this.onAccountsChanged)
    }

    private async run(action: () => Promise<unknown>) {
        this.busy = true
        this.error = undefined
        try {
            await action()
        } catch (error) {
            this.error = errorMessage(error)
        } finally {
            this.busy = false
        }
    }

    private connect() {
        this.run(async () => {
            await sdk.connect()
            await this.refresh()
        })
    }

    private disconnect() {
        return this.run(async () => {
            await this.unsubscribe()
            await sdk.disconnect()
            this.status = null
            this.accounts = []
        })
    }

    private ping() {
        if (!this.primaryParty || !this.primaryParty.partyId) return
        this.run(async () => {
            await sdk.prepareExecute({
                commands: [
                    {
                        CreateCommand: {
                            templateId:
                                '#canton-builtin-admin-workflow-ping:Canton.Internal.Ping:Ping',
                            createArguments: {
                                id: `my-test-${new Date().getTime()}`,
                                initiator: this.primaryParty?.partyId,
                                responder: this.primaryParty?.partyId,
                            },
                        },
                    },
                ],
            })
        })
    }

    private openWallet() {
        return this.run(() => sdk.open())
    }

    override render() {
        return html`
            <main>
                ${
                    this.connected
                        ? html`<canton-connected
                              .status=${this.status}
                              .accounts=${this.accounts}
                              .transactions=${this.transactions}
                              ?busy=${this.busy}
                              @disconnect=${this.disconnect}
                              @ping=${this.ping}
                              @wallet=${this.openWallet}
                          ></canton-connected>`
                        : html`<canton-disconnected
                              ?busy=${this.busy}
                              @connect=${this.connect}
                          ></canton-disconnected>`
                }
                ${
                    this.error
                        ? html`<p class="error" role="alert">${this.error}</p>`
                        : nothing
                }
            </main>
        `
    }

    static override styles = css`
    ${super.styles}
    :host {
      display: block;
      width: 100%;
  `
}
