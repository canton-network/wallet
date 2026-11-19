// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as sdk from '@canton-network/dapp-sdk'
import type { StatusEvent, Wallet } from '@canton-network/dapp-sdk'
import { LitElement, css, html, nothing } from 'lit'
import { customElement, state } from 'lit/decorators.js'

// SDK errors may be plain JSON-RPC error objects rather than Error instances.
function errorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String(error.message)
    }
    return String(error)
}

@customElement('canton-app')
export class CantonApp extends LitElement {
    @state() private status: StatusEvent | undefined
    @state() private accounts: Wallet[] = []
    @state() private busy = false
    @state() private error: string | undefined

    private subscribed = false

    private readonly onStatusChanged = (status: StatusEvent) => {
        this.status = status
        if (!status.connection.isConnected) {
            this.accounts = []
        }
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
        return this.run(async () => {
            await sdk.connect()
            await this.refresh()
        })
    }

    private disconnect() {
        return this.run(async () => {
            await this.unsubscribe()
            await sdk.disconnect()
            this.status = undefined
            this.accounts = []
        })
    }

    private openWallet() {
        return this.run(() => sdk.open())
    }

    override render() {
        return html`
            <main>
                <h1>Canton dApp</h1>

                ${this.connected ? this.renderConnected() : this.renderIntro()}
                ${
                    this.error
                        ? html`<p class="error" role="alert">${this.error}</p>`
                        : nothing
                }
            </main>
        `
    }

    private renderIntro() {
        return html`
            <p>Connect a Canton wallet to get started.</p>
            <div class="actions">
                <button
                    class="primary"
                    ?disabled=${this.busy}
                    @click=${this.connect}
                >
                    Connect wallet
                </button>
            </div>
        `
    }

    private renderConnected() {
        return html`
            <dl>
                <dt>Wallet</dt>
                <dd>${this.status?.provider.id ?? 'unknown'}</dd>
                <dt>Network</dt>
                <dd>${this.status?.network?.networkId ?? 'unknown'}</dd>
            </dl>

            <h2>Accounts</h2>
            ${
                this.accounts.length === 0
                    ? html`<p class="muted">No accounts available.</p>`
                    : html`
                          <ul>
                              ${this.accounts.map(
                                  (account) => html`
                                      <li>
                                          <code>${account.partyId}</code>
                                          ${
                                              account.primary
                                                  ? html`<span class="badge"
                                                        >primary</span
                                                    >`
                                                  : nothing
                                          }
                                      </li>
                                  `
                              )}
                          </ul>
                      `
            }

            <div class="actions">
                <button ?disabled=${this.busy} @click=${this.openWallet}>
                    Open wallet
                </button>
                <button ?disabled=${this.busy} @click=${this.disconnect}>
                    Disconnect
                </button>
            </div>
        `
    }

    static override styles = css`
        :host {
            display: block;
            width: min(100%, 36rem);
        }

        main {
            padding: 2rem;
            border: 1px solid color-mix(in srgb, currentColor 15%, transparent);
            border-radius: 1rem;
        }

        h1 {
            margin-top: 0;
        }

        h2 {
            font-size: 1rem;
        }

        dl {
            display: grid;
            grid-template-columns: max-content 1fr;
            gap: 0.25rem 1rem;
        }

        dt {
            font-weight: 600;
        }

        dd {
            margin: 0;
        }

        ul {
            padding: 0;
            list-style: none;
        }

        li {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0;
        }

        code {
            overflow-wrap: anywhere;
        }

        .actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 1.5rem;
        }

        button {
            padding: 0.5rem 1rem;
            border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
            border-radius: 0.5rem;
            background: transparent;
            color: inherit;
            font: inherit;
            cursor: pointer;
        }

        button.primary {
            border-color: var(--info-color);
            background: var(--info-color);
            color: var(--light-color);
        }

        button:disabled {
            opacity: 0.6;
            cursor: progress;
        }

        .badge {
            padding: 0 0.5rem;
            border-radius: 999px;
            background: color-mix(in srgb, var(--info-color) 20%, transparent);
            font-size: 0.75rem;
        }

        .muted {
            opacity: 0.7;
        }

        .error {
            color: var(--error-color);
        }
    `
}
