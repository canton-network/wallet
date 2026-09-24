// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css, html, nothing } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import {
    BaseElement,
    handleErrorToast,
    type WalletCreateEvent,
} from '@canton-network/core-wallet-ui-components'
import type { Wallet } from '@canton-network/core-wallet-user-rpc-client'
import { SigningProvider } from '@canton-network/core-signing-lib'
import { createUserClient } from '../rpc-client.js'
import { showToast } from '../utils.js'

import '@canton-network/core-wallet-ui-components'

@customElement('user-ui-self-issued-onboarding')
export class UserUiSelfIssuedOnboarding extends BaseElement {
    @state() private accessor submitting = false
    @state() private accessor wallet: Wallet | undefined
    @state() private accessor completed = false

    private readonly username = new URLSearchParams(window.location.search).get(
        'username'
    )

    private readonly networkId = new URLSearchParams(
        window.location.search
    ).get('networkId')

    private readonly signingProviders = Object.values(SigningProvider).filter(
        (provider) =>
            provider !== SigningProvider.PARTICIPANT &&
            provider !== SigningProvider.FIREBLOCKS &&
            provider !== SigningProvider.BLOCKDAEMON
    )

    static styles = [
        BaseElement.styles,
        css`
            :host {
                display: block;
                max-width: 560px;
                margin: 0 auto;
                padding: var(--wg-space-5) var(--wg-space-3);
            }

            .onboarding-card {
                background: var(--wg-surface, #fff);
                border-radius: 12px;
                padding: var(--wg-space-5);
                box-shadow: 0 8px 24px rgb(0 0 0 / 8%);
            }

            .description,
            .status-message {
                color: var(--wg-text-secondary);
            }

            .status-actions {
                display: flex;
                flex-direction: column;
                gap: var(--wg-space-3);
            }
        `,
    ]

    private async finalizeOnboarding(): Promise<void> {
        if (!this.username || !this.networkId || !this.wallet) {
            return
        }

        this.submitting = true
        try {
            const client = await createUserClient()
            const result = await client.request({
                method: 'finalizeSelfIssuedOnboarding',
                params: {
                    username: this.username,
                    networkId: this.networkId,
                    partyId: this.wallet.partyId,
                },
            })
            this.wallet = result.wallet

            if (result.wallet.status === 'allocated') {
                this.completed = true
                showToast(
                    'Onboarding complete',
                    'Your authentication party is ready.',
                    'success'
                )
            } else if (result.wallet.status === 'removed') {
                throw new Error('Party allocation was rejected')
            } else {
                showToast(
                    'Party creation pending',
                    'Approve the signing request, then try again.',
                    'info'
                )
            }
        } catch (error) {
            handleErrorToast(error)
        } finally {
            this.submitting = false
        }
    }

    private async initializeOnboarding(
        event: WalletCreateEvent
    ): Promise<void> {
        if (!this.username || !this.networkId) {
            return
        }

        this.submitting = true
        try {
            const client = await createUserClient()
            const result = await client.request({
                method: 'initializeSelfIssuedOnboarding',
                params: {
                    username: this.username,
                    networkId: this.networkId,
                    partyHint: event.partyHint,
                    signingProviderId: event.signingProviderId,
                },
            })
            this.wallet = result.wallet

            if (result.wallet.status === 'allocated') {
                await this.finalizeOnboarding()
            } else if (result.wallet.status === 'removed') {
                throw new Error('Party allocation was rejected')
            } else {
                showToast(
                    'Party creation pending',
                    'Approve the signing request, then complete onboarding.',
                    'info'
                )
            }
        } catch (error) {
            handleErrorToast(error)
        } finally {
            this.submitting = false
        }
    }

    protected render() {
        const missingConfiguration = !this.username || !this.networkId

        return html`
            <section class="onboarding-card">
                <h1 class="h4 fw-semibold mb-2">Create authentication party</h1>
                <p class="description mb-4">
                    Create the party that will authenticate your wallet gateway
                    account.
                </p>

                ${
                    missingConfiguration
                        ? html`
                              <div class="alert alert-danger mb-0" role="alert">
                                  Onboarding requires username and networkId URL
                                  parameters.
                              </div>
                          `
                        : nothing
                }
                ${
                    !missingConfiguration && this.completed
                        ? html`
                              <div
                                  class="alert alert-success mb-0"
                                  role="status"
                              >
                                  Onboarding is complete. Your authentication
                                  party is ready.
                              </div>
                          `
                        : nothing
                }
                ${
                    !missingConfiguration && this.wallet && !this.completed
                        ? html`
                              <div class="status-actions">
                                  <p class="status-message mb-0">
                                      The party is waiting for signing-provider
                                      approval.
                                  </p>
                                  <button
                                      class="btn btn-primary rounded-pill w-100"
                                      type="button"
                                      ?disabled=${this.submitting}
                                      @click=${this.finalizeOnboarding}
                                  >
                                      ${
                                          this.submitting
                                              ? 'Checking approval...'
                                              : 'Complete onboarding'
                                      }
                                  </button>
                              </div>
                          `
                        : nothing
                }
                ${
                    !missingConfiguration && !this.wallet
                        ? html`
                              <wg-wallet-create-form
                                  .signingProviders=${this.signingProviders}
                                  .showPrimary=${false}
                                  .submitLabel=${'Create party'}
                                  ?submitting=${this.submitting}
                                  @wallet-create=${this.initializeOnboarding}
                              ></wg-wallet-create-form>
                          `
                        : nothing
                }
            </section>
        `
    }
}
