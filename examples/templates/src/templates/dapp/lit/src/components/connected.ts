// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { StatusEvent, Wallet, dappAPI } from '@canton-network/dapp-sdk'
import { css, html, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { CantonComponent } from './common/base'

@customElement('canton-connected')
export class CantonConnected extends CantonComponent {
    @property({ type: Object }) accessor status: StatusEvent | null = null
    @property({ type: Array }) accessor accounts: Wallet[] = []
    @property({ type: Array }) accessor transactions: dappAPI.TxChangedEvent[] =
        []
    @property({ type: Boolean }) accessor busy = false

    render() {
        return html`<div class="container">
            <canton-card .title="Welcome ${this.status?.session?.userId ?? ''}">
                <dl>
                    <dt>Wallet</dt>
                    <dd>${this.status?.provider.id ?? 'unknown'}</dd>
                    <dt>Network</dt>
                    <dd>${this.status?.network?.networkId ?? 'unknown'}</dd>
                </dl>

                <div class="actions">
                    <button
                        ?disabled=${this.busy}
                        @click=${() => this.dispatchEvent(new CustomEvent('wallet'))}
                    >
                        Open wallet
                    </button>
                    <button
                        ?disabled=${this.busy}
                        @click=${() => this.dispatchEvent(new CustomEvent('disconnect'))}
                    >
                        Disconnect
                    </button>
                    <button
                        ?disabled=${this.busy}
                        @click=${() => this.dispatchEvent(new CustomEvent('ping'))}
                    >
                        Ping
                    </button>
                </div>
            </canton-card>

            <div class="row">
                <canton-card title="Accounts">
                    ${
                        this.accounts.length === 0
                            ? html`<p class="muted">No accounts available.</p>`
                            : html`
                                  <ul>
                                      ${this.accounts.map(
                                          (account) => html`
                                              <li>
                                                  <code
                                                      >${account.partyId}</code
                                                  >
                                                  ${
                                                      account.primary
                                                          ? html`<span
                                                                class="badge"
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
                </canton-card>

                <canton-card title="Transactions">
                    <div class="transactions">
                        ${
                            this.transactions.length
                                ? this.transactions.map(
                                      (transaction) => html`
                                          <details>
                                              <summary>
                                                  ${transaction.commandId} -
                                                  ${transaction.status}
                                              </summary>
                                              <code>
                                                  <pre>
${JSON.stringify(transaction, undefined, 4)}</pre>
                                              </code>
                                          </details>
                                      `
                                  )
                                : html`<p>No Transactions found.</p>`
                        }
                    </div>
                </canton-card>
            </div>
        </div>`
    }

    static override styles = css`
        ${super.styles}

        .container {
            display: flex;
            flex-direction: column;
            gap: 1em;
            margin: 0 auto;
            max-width: 70em;
        }

        .row {
            display: flex;
            gap: 1em;
            overflow-wrap: anywhere;
        }

        @media (max-width: 764px) {
            .row {
                flex-direction: column;
            }
        }

        .row > * {
            flex: 1 1 0;
            min-width: 0;
        }

        .transactions pre {
            overflow-x: auto;
        }
    `
}
