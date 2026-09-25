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
import { stateManager } from '../state-manager.js'
import { detectCurrentOrigin } from '../listeners.js'
import { addUserSession, redirectToIntendedOrDefault } from '../index.js'

import '@canton-network/core-wallet-ui-components'

@customElement('user-ui-self-issued-onboarding')
export class UserUiSelfIssuedOnboarding extends BaseElement {
    @state() private accessor submitting = false
    @state() private accessor wallet: Wallet | undefined
    @state() private accessor completed = false
    @state() private accessor onboardingReady = false
    @state() private accessor onboardingError: string | undefined
    @state() private accessor sessionLoaded = false

    private origin: string | undefined
    private sessionId: string | undefined
    private networkId: string | undefined

    private readonly signingProviders = [SigningProvider.WALLET_KERNEL]

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

    async connectedCallback(): Promise<void> {
        super.connectedCallback()
        this.origin = await detectCurrentOrigin()
        this.sessionId = stateManager.onboardingSessionId.get(this.origin)
        this.networkId = stateManager.networkId.get(this.origin)
        this.sessionLoaded = true
        if (!this.sessionId || !this.networkId) {
            return
        }

        try {
            const client = await createUserClient()
            const state = await client.request({
                method: 'getSelfIssuedOnboarding',
                params: { sessionId: this.sessionId },
            })
            if (state.userExists) {
                throw new Error(
                    'Selecting an existing self-issued user is not implemented yet.'
                )
            }
            this.onboardingReady = true
        } catch (error) {
            this.onboardingError =
                error instanceof Error
                    ? error.message
                    : 'Unable to load self-issued onboarding.'
            handleErrorToast(error)
        }
    }

    private async connectSession(wallet: Wallet): Promise<void> {
        if (!this.sessionId) {
            return
        }

        this.submitting = true
        try {
            const client = await createUserClient()
            const result = await client.request({
                method: 'connectSelfIssuedSession',
                params: {
                    sessionId: this.sessionId,
                    partyId: wallet.partyId,
                },
            })

            await this.completeLogin(result.accessToken)
        } catch (error) {
            handleErrorToast(error)
        } finally {
            this.submitting = false
        }
    }

    private async completeLogin(accessToken: string): Promise<void> {
        if (!this.networkId || !this.origin) {
            return
        }
        const currentOrigin = this.origin
        stateManager.onboardingSessionId.clear(currentOrigin)
        const payloadSegment = accessToken.split('.')[1] ?? ''
        const payload = JSON.parse(
            atob(payloadSegment.replace(/-/g, '+').replace(/_/g, '/'))
        ) as { exp?: number }
        if (payload.exp) {
            stateManager.expirationDate.set(
                new Date(payload.exp * 1000).toISOString(),
                currentOrigin
            )
        }
        await stateManager.accessToken.set(accessToken, currentOrigin)
        await addUserSession(accessToken, this.networkId)
        await redirectToIntendedOrDefault()
    }

    private async allocateParty(wallet: Wallet): Promise<void> {
        if (!this.sessionId) {
            return
        }

        this.submitting = true
        try {
            const client = await createUserClient()
            const result = await client.request({
                method: 'allocateSelfIssuedWallet',
                params: {
                    sessionId: this.sessionId,
                    partyId: wallet.partyId,
                },
            })
            this.wallet = result.wallet
            if (result.wallet.status === 'allocated') {
                await this.connectSession(result.wallet)
                return
            }
            if (result.wallet.status === 'removed') {
                throw new Error('Party allocation was rejected')
            }
            showToast(
                'Party creation pending',
                'Approve the signing request, then try again.',
                'info'
            )
        } catch (error) {
            handleErrorToast(error)
        } finally {
            this.submitting = false
        }
    }

    private async createWallet(event: WalletCreateEvent): Promise<void> {
        if (!this.sessionId) {
            return
        }

        this.submitting = true
        try {
            const client = await createUserClient()
            const result = await client.request({
                method: 'createSelfIssuedWallet',
                params: {
                    sessionId: this.sessionId,
                    partyHint: event.partyHint,
                    signingProviderId: event.signingProviderId,
                },
            })
            if (result.wallet.status === 'allocated') {
                await this.connectSession(result.wallet)
            } else if (result.wallet.status === 'removed') {
                throw new Error('Party allocation was rejected')
            } else {
                this.wallet = result.wallet
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
        const missingConfiguration = !this.sessionId || !this.networkId

        return html`
            <section class="onboarding-card">
                <h1 class="h4 fw-semibold mb-2">Create authentication party</h1>
                <p class="description mb-4">
                    Create the party that will authenticate your wallet gateway
                    account.
                </p>

                ${
                    this.sessionLoaded && missingConfiguration
                        ? html`
                              <div class="alert alert-danger mb-0" role="alert">
                                  No onboarding session found. Start onboarding
                                  from the login page.
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
                    !missingConfiguration && this.onboardingError
                        ? html`
                              <div class="alert alert-danger mb-0" role="alert">
                                  ${this.onboardingError}
                              </div>
                          `
                        : nothing
                }
                ${
                    !missingConfiguration &&
                    this.onboardingReady &&
                    this.wallet &&
                    !this.completed
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
                                      @click=${() =>
                                          this.wallet &&
                                          this.allocateParty(this.wallet)}
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
                    !missingConfiguration &&
                    this.onboardingReady &&
                    !this.wallet
                        ? html`
                              <wg-wallet-create-form
                                  .signingProviders=${this.signingProviders}
                                  .showPrimary=${false}
                                  .submitLabel=${'Create party'}
                                  ?submitting=${this.submitting}
                                  @wallet-create=${this.createWallet}
                              ></wg-wallet-create-form>
                          `
                        : nothing
                }
            </section>
        `
    }
}
