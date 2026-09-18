// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import {
    BaseElement,
    handleErrorToast,
} from '@canton-network/core-wallet-ui-components'
import {
    GetCurrentUserResult,
    Wallet,
} from '@canton-network/core-wallet-user-rpc-client'

import { createUserClient } from '../rpc-client'
import '../index'
import { stateManager } from '../state-manager'
import { detectCurrentOrigin } from '../listeners.js'

@customElement('user-ui-self-issued-token')
export class UserUiSelfIssuedToken extends BaseElement {
    @state() accessor loading = true
    @state() accessor saving = false
    @state() accessor probing = false
    @state() accessor currentUser: GetCurrentUserResult | null = null
    @state() accessor wallets: Wallet[] = []
    @state() accessor selectedPartyId = ''
    @state() accessor probeToken = ''
    @state() accessor probeResult: unknown = null

    static styles = [
        BaseElement.styles,
        css`
            :host {
                display: block;
                max-width: 900px;
                margin: 0 auto;
            }

            .row {
                display: flex;
                flex-wrap: wrap;
                gap: var(--wg-space-3);
                align-items: center;
                margin: var(--wg-space-4) 0;
            }

            select {
                min-width: 24rem;
                max-width: 100%;
            }
        `,
    ]

    connectedCallback(): void {
        super.connectedCallback()
        void this.load()
    }

    private async userClient() {
        const currentOrigin = await detectCurrentOrigin()
        return createUserClient(
            await stateManager.accessToken.get(currentOrigin)
        )
    }

    private async load() {
        this.loading = true
        try {
            const client = await this.userClient()
            const [currentUser, wallets] = await Promise.all([
                client.request({ method: 'getCurrentUser' }),
                client.request({ method: 'listWallets', params: {} }),
            ])
            this.currentUser = currentUser
            this.wallets = wallets
            this.selectedPartyId =
                currentUser.user?.primaryParty &&
                wallets.some((w) => w.partyId === currentUser.user.primaryParty)
                    ? currentUser.user.primaryParty
                    : (wallets[0]?.partyId ?? '')
            console.log(currentUser)
        } catch (error) {
            handleErrorToast(error)
        } finally {
            this.loading = false
        }
    }

    private async setLedgerPrimary() {
        if (!this.selectedPartyId) return
        this.saving = true
        try {
            const client = await this.userClient()
            await client.request({
                method: 'setLedgerPrimaryParty',
                params: { partyId: this.selectedPartyId },
            })
            const currentUser = await client.request({
                method: 'getCurrentUser',
            })
            this.currentUser = currentUser
            console.log(currentUser)
        } catch (error) {
            handleErrorToast(error)
        } finally {
            this.saving = false
        }
    }

    private async probeSelfIssuedToken() {
        if (!this.selectedPartyId) return
        this.probing = true
        try {
            const client = await this.userClient()
            const result = await client.request({
                method: 'probeSelfIssuedToken',
                params: { partyId: this.selectedPartyId },
            })
            this.probeToken = result.token
            this.probeResult = result.probe
            console.log(result)
        } catch (error) {
            handleErrorToast(error)
        } finally {
            this.probing = false
        }
    }

    protected render() {
        const busy = this.saving || this.probing
        return html`
            <div>
                <h1 class="h4 fw-semibold mb-0 text-body">Self-issued token</h1>
                ${
                    this.loading
                        ? html`<p class="mt-3 mb-0 text-body-secondary">
                              Loading current user...
                          </p>`
                        : html`
                              <div class="row">
                                  <select
                                      .value=${this.selectedPartyId}
                                      ?disabled=${busy || !this.wallets.length}
                                      @change=${(e: Event) => {
                                          this.selectedPartyId = (
                                              e.target as HTMLSelectElement
                                          ).value
                                      }}
                                  >
                                      ${this.wallets.map(
                                          (wallet) => html`
                                              <option
                                                  value=${wallet.partyId}
                                                  ?selected=${
                                                      wallet.partyId ===
                                                      this.selectedPartyId
                                                  }
                                              >
                                                  ${
                                                      wallet.hint ||
                                                      wallet.partyId
                                                  }
                                                  (${wallet.partyId})
                                              </option>
                                          `
                                      )}
                                  </select>
                                  <button
                                      type="button"
                                      class="btn btn-primary"
                                      ?disabled=${busy || !this.selectedPartyId}
                                      @click=${this.setLedgerPrimary}
                                  >
                                      ${
                                          this.saving
                                              ? 'Setting...'
                                              : 'Set primary'
                                      }
                                  </button>
                                  <button
                                      type="button"
                                      class="btn btn-secondary"
                                      ?disabled=${busy || !this.selectedPartyId}
                                      @click=${this.probeSelfIssuedToken}
                                  >
                                      ${
                                          this.probing
                                              ? 'Probing...'
                                              : 'Probe with party JWT'
                                      }
                                  </button>
                              </div>
                              ${
                                  this.currentUser
                                      ? html`<pre class="mt-3 mb-0">
${JSON.stringify(this.currentUser, null, 2)}</pre>`
                                      : html`<p
                                            class="mt-3 mb-0 text-body-secondary"
                                        >
                                            Could not load the current user.
                                        </p>`
                              }
                              ${
                                  this.probeToken
                                      ? html`
                                            <h2 class="h5 fw-semibold mt-4">
                                                Party JWT probe
                                            </h2>
                                            <pre class="mt-2 mb-0">
${JSON.stringify(
    {
        token: this.probeToken,
        probe: this.probeResult,
    },
    null,
    2
)}</pre>
                                        `
                                      : ''
                              }
                          `
                }
            </div>
        `
    }
}
