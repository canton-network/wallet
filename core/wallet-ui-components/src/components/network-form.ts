// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
    Network as ApiNetwork,
    Idp,
} from '@canton-network/core-wallet-user-rpc-client'
import {
    type Network as StoreNetwork,
    networkSchema,
} from '@canton-network/core-wallet-store'
import { css, html, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { BaseElement } from '../internal/base-element'
import { AuthEditor, type AuthEditorChangeEvent } from './auth-editor.js'
import './auth-editor.js'
import './info-tip.js'

const AUTH_DOCS_URL =
    'https://docs.canton.network/integrations/wallet-gateway/operate/networks-and-identity#authentication-methods'

/**
 * Emitted when the user clicks the Cancel button on the form
 */
export class NetworkEditCancelEvent extends Event {
    constructor() {
        super('network-edit-cancel', { bubbles: true, composed: true })
    }
}

/**
 * Emitted when the user clicks the Save/Add/Update button on the form
 */
export class NetworkEditSaveEvent extends Event {
    network: ApiNetwork

    constructor(network: ApiNetwork) {
        super('network-edit-save', { bubbles: true, composed: true })
        this.network = network
    }
}

/**
 * Emitted when the user clicks the Delete button
 */
export class NetworkDeleteEvent extends Event {
    network: ApiNetwork

    constructor(network: ApiNetwork) {
        super('network-delete', { bubbles: true, composed: true })
        this.network = network
    }
}

export
@customElement('network-form')
class NetworkForm extends BaseElement {
    @property({ type: String })
    accessor mode: 'add' | 'review' = 'add'

    @property({ type: Object })
    accessor network: ApiNetwork = {
        id: '',
        name: '',
        description: '',
        identityProviderId: '',
        ledgerApi: '',
        auth: {
            method: 'authorization_code',
            audience: '',
            scope: '',
            clientId: '',
        },
    }

    /** The identity providers the network can reference */
    @property({ type: Array })
    accessor idps: Idp[] = []

    @state() private accessor _error = ''
    @state() private accessor deleteConfirmation = ''

    static styles = [
        BaseElement.styles,
        css`
            :host {
                display: block;
            }

            .form-fields {
                gap: var(--wg-space-4);
            }

            .field-group {
                gap: var(--wg-space-2);
            }

            .field-label {
                font-size: var(--wg-font-size-sm);
                font-weight: var(--wg-font-weight-medium);
                color: var(--wg-text-secondary);
                line-height: var(--wg-line-height-tight);
            }

            .required {
                color: var(--wg-label-required-color);
            }

            .field-help {
                font-size: var(--wg-font-size-xs);
                color: var(--wg-text-secondary);
                margin-top: calc(-1 * var(--wg-space-1));
            }

            .field-control {
                width: 100%;
                border: 1px solid var(--wg-input-border);
                border-radius: 4px;
                background: var(--wg-input-bg);
                color: var(--wg-input-text);
                padding: 12px 14px;
            }

            .field-control::placeholder {
                color: var(--wg-input-placeholder);
            }

            .field-control:focus {
                border-color: var(--wg-input-border-focus);
                box-shadow: 0 0 0 3px rgba(var(--wg-accent-rgb), 0.12);
            }

            .select-wrap {
                position: relative;
            }

            .select-wrap .field-control {
                padding-right: 40px;
                appearance: none;
                -webkit-appearance: none;
            }

            .select-chevron {
                position: absolute;
                top: 50%;
                right: 12px;
                transform: translateY(-50%);
                color: var(--wg-text-secondary);
                pointer-events: none;
                display: inline-flex;
            }

            .field-help {
                margin: 0;
                font-size: var(--wg-font-size-xs);
                color: var(--wg-text-secondary);
            }

            .section-title {
                display: flex;
                align-items: center;
                gap: 0.15rem;
                margin: var(--wg-space-4) 0 var(--wg-space-2);
                font-size: var(--wg-font-size-base);
                font-weight: var(--wg-font-weight-bold);
                color: var(--wg-text);
            }

            .delete-section {
                margin-top: var(--wg-space-8);
                padding-top: var(--wg-space-6);
                border-top: 1px solid var(--wg-border);
            }

            .delete-title {
                margin: 0 0 var(--wg-space-2);
                font-size: var(--wg-font-size-base);
                font-weight: var(--wg-font-weight-bold);
                color: var(--wg-text);
            }

            .delete-desc {
                margin: 0 0 var(--wg-space-4);
                font-size: var(--wg-font-size-sm);
                color: var(--wg-text-secondary);
            }

            .btn-delete {
                display: inline-flex;
                align-items: center;
                gap: var(--wg-space-1);
                border: 1px solid var(--wg-error);
                border-radius: var(--wg-radius-full);
                background: transparent;
                color: var(--wg-error);
                font-size: var(--wg-font-size-sm);
                font-weight: var(--wg-font-weight-semibold);
                padding: 0.4rem 1rem;
                cursor: pointer;
                transition:
                    background 0.2s ease,
                    color 0.2s ease;
            }

            .btn-delete:hover:not(:disabled) {
                background: rgba(var(--wg-error-rgb), 0.08);
            }

            .btn-delete:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .delete-confirm {
                max-width: 24rem;
                margin-bottom: var(--wg-space-3);
            }

            .form-error {
                color: var(--wg-error);
                font-size: var(--wg-font-size-sm);
                margin: var(--wg-space-2) 0;
            }

            .form-actions {
                display: flex;
                gap: var(--wg-space-3);
                margin-top: var(--wg-space-6);
            }

            .form-actions > button {
                flex: 1 1 0;
                min-width: 0;
                min-height: 2.875rem;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 0.7rem 1.5rem;
                font-size: var(--wg-font-size-base);
                font-weight: var(--wg-font-weight-semibold);
                line-height: 1.2;
            }

            .btn-cancel {
                border: 1px solid var(--wg-border);
                border-radius: var(--wg-radius-full);
                background: var(--wg-input-bg);
                color: var(--wg-text);
                cursor: pointer;
                transition:
                    background 0.2s ease,
                    opacity 0.2s ease;
            }

            .btn-cancel:hover {
                background: var(--wg-border);
            }

            .btn-submit {
                border-width: 1px;
            }
        `,
        AuthEditor.styles,
    ]

    handleSubmit(e: Event) {
        e.preventDefault()

        const parsedData = networkSchema.safeParse(
            this.toStoreNetworkForValidation(this.network)
        )

        if (!parsedData.success) {
            this._error =
                'Invalid network data, please ensure all fields are set correctly'
            console.error('Error parsing network data: ', parsedData.error)
            return
        } else {
            this.dispatchEvent(new NetworkEditSaveEvent(this.network))
        }
    }

    private toStoreNetworkForValidation(network: ApiNetwork): StoreNetwork {
        return {
            ...network,
            ledgerApi: { baseUrl: network.ledgerApi },
        } as StoreNetwork
    }

    /** The IdP IDs to choose from, keeping the current one even if it is gone */
    private idpOptions(): string[] {
        const ids = this.idps.map((idp) => idp.id)
        const current = this.network.identityProviderId
        return current && !ids.includes(current) ? [current, ...ids] : ids
    }

    render() {
        const isReview = this.mode === 'review'

        return html`
            <form class="d-flex flex-column h-100" @submit=${this.handleSubmit}>
                <div class="form-fields d-flex flex-column">
                    <div class="field-group d-flex flex-column">
                        <label class="form-label field-label mb-0">
                            Network Id <span class="required">*</span>
                        </label>
                        <input
                            class="form-control field-control"
                            type="text"
                            required
                            .value=${this.network.id ?? ''}
                            @change=${(e: Event) => {
                                this.network.id = (
                                    e.target as HTMLInputElement
                                ).value
                            }}
                        />
                        <p class="field-help mb-0">
                            A unique identifier for the network
                        </p>
                    </div>

                    <div class="field-group d-flex flex-column">
                        <label class="form-label field-label mb-0">
                            Name <span class="required">*</span>
                        </label>
                        <input
                            class="form-control field-control"
                            type="text"
                            required
                            .value=${this.network.name ?? ''}
                            @change=${(e: Event) => {
                                this.network.name = (
                                    e.target as HTMLInputElement
                                ).value
                            }}
                        />
                    </div>

                    <div class="field-group d-flex flex-column">
                        <label class="form-label field-label mb-0">
                            Description <span class="required">*</span>
                        </label>
                        <input
                            class="form-control field-control"
                            type="text"
                            required
                            .value=${this.network.description ?? ''}
                            @change=${(e: Event) => {
                                this.network.description = (
                                    e.target as HTMLInputElement
                                ).value
                            }}
                        />
                    </div>

                    <div class="field-group d-flex flex-column">
                        <label class="form-label field-label mb-0">
                            Synchronizer Id
                        </label>
                        <input
                            class="form-control field-control"
                            type="text"
                            .value=${this.network.synchronizerId ?? ''}
                            @change=${(e: Event) => {
                                const val = (e.target as HTMLInputElement).value

                                // oxlint-disable-next-line no-unused-vars
                                const { synchronizerId, ...network } =
                                    this.network
                                this.network = {
                                    ...network,
                                    ...(val && { synchronizerId: val }),
                                }
                            }}
                        />
                    </div>

                    <div class="field-group d-flex flex-column">
                        <label
                            class="form-label field-label mb-0"
                            for="identity-provider"
                        >
                            Identity provider
                            <span class="required">*</span>
                        </label>
                        <select
                            id="identity-provider"
                            class="form-select field-control"
                            required
                            @change=${(e: Event) => {
                                this.network.identityProviderId = (
                                    e.target as HTMLSelectElement
                                ).value
                            }}
                        >
                            <option
                                value=""
                                disabled
                                ?selected=${!this.network.identityProviderId}
                            >
                                Select an identity provider
                            </option>
                            ${this.idpOptions().map(
                                (id) =>
                                    html`<option
                                        value=${id}
                                        ?selected=${
                                            id ===
                                            this.network.identityProviderId
                                        }
                                    >
                                        ${id}
                                    </option>`
                            )}
                        </select>
                        <p class="field-help">
                            Issues the tokens that users log in to this network
                            with.
                        </p>
                    </div>

                    <div class="field-group d-flex flex-column">
                        <label class="form-label field-label mb-0">
                            Ledger API Base Url
                            <span class="required">*</span>
                        </label>
                        <input
                            class="form-control field-control"
                            type="text"
                            required
                            .value=${this.network.ledgerApi ?? ''}
                            @change=${(e: Event) => {
                                this.network.ledgerApi = (
                                    e.target as HTMLInputElement
                                ).value
                            }}
                        />
                    </div>

                    <h3 class="section-title">
                        Configure user auth
                        <wg-info-tip
                            text="How users log in to this network's Ledger API. Use authorization_code for a browser login with OAuth, or self_signed for development."
                            docsUrl=${AUTH_DOCS_URL}
                        ></wg-info-tip>
                    </h3>
                    <auth-editor
                        .auth=${this.network.auth}
                        @auth-change=${(e: AuthEditorChangeEvent) => {
                            if (e.auth) {
                                this.network = {
                                    ...this.network,
                                    auth: e.auth,
                                }
                            }
                        }}
                    ></auth-editor>

                    <h3 class="section-title">
                        Configure admin auth
                        <wg-info-tip
                            text="How the Wallet Gateway itself gets tokens for admin operations, such as syncing parties when a user logs in or allocating parties. Usually client_credentials."
                            docsUrl=${AUTH_DOCS_URL}
                        ></wg-info-tip>
                    </h3>
                    <auth-editor
                        .auth=${this.network.adminAuth}
                        .optional=${true}
                        .emptyText=${'No admin auth configured.'}
                        .pendingRemoveText=${'Admin auth will be removed after submitting this form.'}
                        @auth-change=${(e: AuthEditorChangeEvent) => {
                            // oxlint-disable-next-line no-unused-vars
                            const { adminAuth, ...network } = this.network
                            this.network = {
                                ...network,
                                ...(e.auth && { adminAuth: e.auth }),
                            }
                        }}
                    ></auth-editor>

                    <h3 class="section-title">
                        Configure service account auth
                        <wg-info-tip
                            text="Machine credentials (client_credentials) that API keys use to submit transactions without a person approving them. Users can only create API keys on networks that have it."
                            docsUrl=${AUTH_DOCS_URL}
                        ></wg-info-tip>
                    </h3>
                    <auth-editor
                        .auth=${this.network.serviceAccountAuth}
                        .allowedMethods=${['client_credentials']}
                        .optional=${true}
                        .emptyText=${'No service account auth configured.'}
                        .pendingRemoveText=${'Service account auth will be removed after submitting this form.'}
                        @auth-change=${(e: AuthEditorChangeEvent) => {
                            // oxlint-disable-next-line no-unused-vars
                            const { serviceAccountAuth, ...network } =
                                this.network
                            this.network = {
                                ...network,
                                ...(e.auth && { serviceAccountAuth: e.auth }),
                            }
                        }}
                    ></auth-editor>
                </div>

                ${
                    this._error
                        ? html`<div class="form-error">${this._error}</div>`
                        : nothing
                }
                ${
                    isReview
                        ? html`
                              <div class="delete-section">
                                  <h4 class="delete-title">Delete network</h4>
                                  <p class="delete-desc">
                                      Deleting this network also deletes the
                                      parties, sessions and activity history
                                      that the Wallet Gateway stores for it, for
                                      every user. You can't undo this.
                                  </p>
                                  <label
                                      class="delete-desc d-block"
                                      for="delete-confirmation"
                                      >Type <code>${this.network.id}</code> to
                                      confirm.</label
                                  >
                                  <input
                                      id="delete-confirmation"
                                      class="form-control form-control-sm delete-confirm"
                                      autocomplete="off"
                                      .value=${this.deleteConfirmation}
                                      @input=${(e: InputEvent) => {
                                          this.deleteConfirmation = (
                                              e.target as HTMLInputElement
                                          ).value
                                      }}
                                  />
                                  <button
                                      type="button"
                                      class="btn-delete"
                                      ?disabled=${
                                          this.deleteConfirmation !==
                                          this.network.id
                                      }
                                      @click=${() =>
                                          this.dispatchEvent(
                                              new NetworkDeleteEvent(
                                                  this.network
                                              )
                                          )}
                                  >
                                      Delete Network
                                  </button>
                              </div>

                              <div class="form-actions">
                                  <button
                                      type="button"
                                      class="btn-cancel"
                                      @click=${() =>
                                          this.dispatchEvent(
                                              new NetworkEditCancelEvent()
                                          )}
                                  >
                                      Cancel
                                  </button>
                                  <button
                                      data-test-id="update-network-button"
                                      class="btn btn-primary rounded-pill btn-submit"
                                      type="submit"
                                  >
                                      Update
                                  </button>
                              </div>
                          `
                        : html`
                              <div class="mt-auto pt-3">
                                  <button
                                      data-test-id="add-network-button"
                                      class="btn btn-primary rounded-pill w-100"
                                      type="submit"
                                  >
                                      Add
                                  </button>
                              </div>
                          `
                }
            </form>
        `
    }
}
