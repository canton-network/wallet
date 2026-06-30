// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    Network as StoreNetwork,
    networkSchema,
} from '@canton-network/core-wallet-store'
import { css, html, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { BaseElement } from '../internal/base-element'
import { chevronDownIcon } from '../icons/index.js'
import {
    AuthorizationCodeAuth,
    Auth,
    ClientCredentialsAuth,
    SelfSignedAuth,
} from '@canton-network/core-wallet-auth'

export type NetworkFormData = Omit<StoreNetwork, 'ledgerApi'> & {
    ledgerApi: string
}

type ServiceAccountAuthMode = 'none' | 'view' | 'edit' | 'pending-remove'
type AuthMethod = 'authorization_code' | 'client_credentials' | 'self_signed'

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
    network: NetworkFormData

    constructor(network: NetworkFormData) {
        super('network-edit-save', { bubbles: true, composed: true })
        this.network = network
    }
}

/**
 * Emitted when the user clicks the Delete button
 */
export class NetworkDeleteEvent extends Event {
    network: NetworkFormData

    constructor(network: NetworkFormData) {
        super('network-delete', { bubbles: true, composed: true })
        this.network = network
    }
}

/**
 * Emitted when the user clicks the Back link
 */
export class NetworkFormBackEvent extends Event {
    constructor() {
        super('network-form-back', { bubbles: true, composed: true })
    }
}

@customElement('network-form')
export class NetworkForm extends BaseElement {
    @property({ type: String })
    accessor mode: 'add' | 'review' = 'add'

    @property({ type: Object })
    accessor network: NetworkFormData = {
        ledgerApi: '',
        auth: {},
        serviceAccountAuth: undefined,
    } as NetworkFormData

    @state() private _error = ''
    @state() private _serviceAccountMode: ServiceAccountAuthMode = 'none'
    @state() private _serviceAccountBackup?: Auth

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

            .section-title {
                margin: var(--wg-space-4) 0 var(--wg-space-2);
                font-size: var(--wg-font-size-base);
                font-weight: var(--wg-font-weight-bold);
                color: var(--wg-text);
            }

            .config-panel {
                border: 1px solid var(--wg-border);
                border-radius: 8px;
                padding: var(--wg-space-3);
                background: var(--wg-input-bg);
                display: flex;
                flex-direction: column;
                gap: var(--wg-space-3);
            }

            .kv-list {
                display: grid;
                gap: var(--wg-space-3);
            }

            .kv-item {
                display: flex;
                flex-direction: column;
                gap: var(--wg-space-1);
            }

            .kv-label {
                font-size: var(--wg-font-size-xs);
                color: var(--wg-text-secondary);
                font-weight: var(--wg-font-weight-semibold);
            }

            .kv-value {
                font-size: var(--wg-font-size-sm);
                color: var(--wg-text);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .inline-actions {
                display: flex;
                gap: var(--wg-space-2);
            }

            .btn-inline {
                border: 1px solid var(--wg-border);
                border-radius: var(--wg-radius-full);
                background: var(--wg-input-bg);
                color: var(--wg-text);
                font-size: var(--wg-font-size-sm);
                font-weight: var(--wg-font-weight-semibold);
                padding: 0.35rem 0.9rem;
                cursor: pointer;
            }

            .btn-inline.danger {
                border-color: var(--wg-error);
                color: var(--wg-error);
            }

            .warning-banner {
                border: 1px solid var(--wg-error);
                border-radius: 8px;
                background: rgba(var(--wg-error-rgb), 0.08);
                color: var(--wg-error);
                padding: var(--wg-space-3);
                font-size: var(--wg-font-size-sm);
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

            .btn-delete:hover {
                background: rgba(var(--wg-error-rgb), 0.08);
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
    ]

    override willUpdate(changedProperties: Map<PropertyKey, unknown>) {
        if (changedProperties.has('network')) {
            this._serviceAccountBackup = this.network.serviceAccountAuth
                ? structuredClone(this.network.serviceAccountAuth)
                : undefined
            this._serviceAccountMode = this.network.serviceAccountAuth
                ? 'view'
                : 'none'
        }
    }

    private _maskSecret(secret?: string): string {
        return secret ? '********' : '(not set)'
    }

    private _serviceAccountSummary(
        auth: Auth
    ): Array<{ key: string; value: string }> {
        const values: Array<{ key: string; value: string }> = [
            { key: 'Method', value: auth.method },
            { key: 'Client Id', value: auth.clientId ?? '' },
            { key: 'Audience', value: auth.audience ?? '' },
            { key: 'Scope', value: auth.scope ?? '' },
        ]

        if ('issuer' in auth) {
            values.push({
                key: 'Issuer',
                value: (auth as SelfSignedAuth).issuer ?? '',
            })
        }

        if ('clientSecret' in auth) {
            values.push({
                key: 'Client Secret',
                value: this._maskSecret(
                    (auth as ClientCredentialsAuth | SelfSignedAuth)
                        .clientSecret
                ),
            })
        }

        return values
    }

    private _startEditingServiceAccountAuth() {
        this._serviceAccountBackup = this.network.serviceAccountAuth
            ? structuredClone(this.network.serviceAccountAuth)
            : undefined

        if (!this.network.serviceAccountAuth) {
            this.network.serviceAccountAuth = {
                method: 'client_credentials',
                audience: '',
                scope: '',
                clientId: '',
                clientSecret: '',
            }
        }

        this._serviceAccountMode = 'edit'
        this.requestUpdate()
    }

    private _markServiceAccountForRemoval() {
        if (!this.network.serviceAccountAuth) {
            return
        }

        this._serviceAccountBackup = structuredClone(
            this.network.serviceAccountAuth
        )
        this.network.serviceAccountAuth = undefined
        this._serviceAccountMode = 'pending-remove'
        this.requestUpdate()
    }

    private _cancelServiceAccountRemoval() {
        if (this._serviceAccountBackup) {
            this.network.serviceAccountAuth = structuredClone(
                this._serviceAccountBackup
            )
            this._serviceAccountMode = 'view'
        } else {
            this._serviceAccountMode = 'none'
        }
        this.requestUpdate()
    }

    private _cancelServiceAccountEditing() {
        if (this._serviceAccountBackup) {
            this.network.serviceAccountAuth = structuredClone(
                this._serviceAccountBackup
            )
            this._serviceAccountMode = 'view'
        } else {
            this.network.serviceAccountAuth = undefined
            this._serviceAccountMode = 'none'
        }
        this.requestUpdate()
    }

    private renderServiceAccountAuthSection() {
        if (this._serviceAccountMode === 'none') {
            return html`
                <h3 class="section-title">Configure service account auth</h3>
                <div class="config-panel">
                    <p class="field-help mb-0">
                        No service account auth configured.
                    </p>
                    <div class="inline-actions">
                        <button
                            type="button"
                            class="btn-inline"
                            @click=${this._startEditingServiceAccountAuth}
                        >
                            Add
                        </button>
                    </div>
                </div>
            `
        }

        if (this._serviceAccountMode === 'pending-remove') {
            return html`
                <h3 class="section-title">Configure service account auth</h3>
                <div class="config-panel">
                    <div class="warning-banner">
                        Service account auth will be removed after submitting
                        this form.
                    </div>
                    <div class="inline-actions">
                        <button
                            type="button"
                            class="btn-inline"
                            @click=${this._cancelServiceAccountRemoval}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            `
        }

        if (
            this._serviceAccountMode === 'view' &&
            this.network.serviceAccountAuth
        ) {
            const summary = this._serviceAccountSummary(
                this.network.serviceAccountAuth
            )
            return html`
                <h3 class="section-title">Configure service account auth</h3>
                <div class="config-panel">
                    <div class="kv-list">
                        ${summary.map(
                            (item) => html`
                                <div class="kv-item">
                                    <span class="kv-label">${item.key}</span>
                                    <span class="kv-value" title=${item.value}
                                        >${item.value}</span
                                    >
                                </div>
                            `
                        )}
                    </div>
                    <div class="inline-actions">
                        <button
                            type="button"
                            class="btn-inline"
                            @click=${this._startEditingServiceAccountAuth}
                        >
                            Edit
                        </button>
                        <button
                            type="button"
                            class="btn-inline danger"
                            @click=${this._markServiceAccountForRemoval}
                        >
                            Remove
                        </button>
                    </div>
                </div>
            `
        }

        return html`
            <h3 class="section-title">Configure service account auth</h3>
            ${this.network.serviceAccountAuth
                ? this.renderAuthForm(this.network.serviceAccountAuth, {
                      allowedMethods: ['client_credentials'],
                  })
                : nothing}
            <div class="inline-actions">
                <button
                    type="button"
                    class="btn-inline"
                    @click=${this._cancelServiceAccountEditing}
                >
                    Cancel
                </button>
            </div>
        `
    }

    handleSubmit(e: Event) {
        e.preventDefault()

        const parsedData = networkSchema.safeParse(
            // TODO #1902 use validation that doesn't rely on store shapes that differ from API
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

    private toStoreNetworkForValidation(
        network: NetworkFormData
    ): StoreNetwork {
        return {
            ...network,
            ledgerApi: { baseUrl: network.ledgerApi },
        } as StoreNetwork
    }

    renderAuthForm(
        authObj: NetworkFormData['auth'],
        options?: { allowedMethods?: AuthMethod[]; defaultMethod?: AuthMethod }
    ) {
        const allowedMethods = options?.allowedMethods ?? [
            'authorization_code',
            'client_credentials',
            'self_signed',
        ]

        if (typeof authObj.method === 'undefined') {
            Object.assign(authObj, {
                method: options?.defaultMethod ?? 'authorization_code',
                clientId: '',
                audience: '',
                scope: '',
            })
        }

        const commonFields = html`
            <div class="field-group d-flex flex-column">
                <label class="form-label field-label mb-0">
                    Method <span class="required">*</span>
                </label>
                <div class="select-wrap">
                    <select
                        class="form-select field-control"
                        @change=${(e: Event) => {
                            const select = e.target as HTMLSelectElement
                            if (authObj.method === select.value) return

                            if (select.value === 'authorization_code') {
                                Object.assign(authObj, {
                                    method: 'authorization_code',
                                    clientId: authObj.clientId ?? '',
                                    audience: authObj.audience ?? '',
                                    scope: authObj.scope ?? '',
                                } satisfies AuthorizationCodeAuth)
                            } else if (select.value === 'self_signed') {
                                Object.assign(authObj, {
                                    method: 'self_signed',
                                    clientId: authObj.clientId ?? '',
                                    audience: authObj.audience ?? '',
                                    scope: authObj.scope ?? '',
                                    issuer:
                                        (authObj as SelfSignedAuth).issuer ??
                                        '',
                                    clientSecret:
                                        (authObj as SelfSignedAuth)
                                            .clientSecret ?? '',
                                } satisfies SelfSignedAuth)
                            } else if (select.value === 'client_credentials') {
                                Object.assign(authObj, {
                                    method: 'client_credentials',
                                    clientId: authObj.clientId ?? '',
                                    audience: authObj.audience ?? '',
                                    scope: authObj.scope ?? '',
                                    clientSecret:
                                        (authObj as ClientCredentialsAuth)
                                            .clientSecret ?? '',
                                } satisfies ClientCredentialsAuth)
                            } else {
                                throw new Error(
                                    `Unsupported auth method: ${select.value}`
                                )
                            }
                            this.requestUpdate()
                        }}
                        .value=${authObj.method}
                    >
                        ${allowedMethods.includes('authorization_code')
                            ? html`<option value="authorization_code">
                                  authorization_code
                              </option>`
                            : nothing}
                        ${allowedMethods.includes('client_credentials')
                            ? html`<option value="client_credentials">
                                  client_credentials
                              </option>`
                            : nothing}
                        ${allowedMethods.includes('self_signed')
                            ? html`<option value="self_signed">
                                  self_signed
                              </option>`
                            : nothing}
                    </select>
                    <span class="select-chevron">${chevronDownIcon}</span>
                </div>
            </div>

            <div class="field-group d-flex flex-column">
                <label class="form-label field-label mb-0">
                    Client Id <span class="required">*</span>
                </label>
                <input
                    class="form-control field-control"
                    type="text"
                    required
                    .value=${authObj.clientId}
                    @change=${(e: Event) => {
                        authObj.clientId = (e.target as HTMLInputElement).value
                    }}
                />
            </div>

            <div class="field-group d-flex flex-column">
                <label class="form-label field-label mb-0">
                    Audience <span class="required">*</span>
                </label>
                <input
                    class="form-control field-control"
                    type="text"
                    required
                    .value=${authObj.audience}
                    @change=${(e: Event) => {
                        authObj.audience = (e.target as HTMLInputElement).value
                    }}
                />
            </div>

            <div class="field-group d-flex flex-column">
                <label class="form-label field-label mb-0">
                    Scope <span class="required">*</span>
                </label>
                <input
                    class="form-control field-control"
                    type="text"
                    required
                    .value=${authObj.scope}
                    @change=${(e: Event) => {
                        authObj.scope = (e.target as HTMLInputElement).value
                    }}
                />
            </div>
        `

        if (authObj.method === 'authorization_code') {
            return html`${commonFields}`
        } else if (authObj.method === 'client_credentials') {
            return html`${commonFields}
                <div class="field-group d-flex flex-column">
                    <label class="form-label field-label mb-0">
                        Client Secret <span class="required">*</span>
                    </label>
                    <input
                        class="form-control field-control"
                        type="text"
                        required
                        .value=${(authObj as ClientCredentialsAuth)
                            .clientSecret}
                        @change=${(e: Event) => {
                            ;(authObj as ClientCredentialsAuth).clientSecret = (
                                e.target as HTMLInputElement
                            ).value
                        }}
                    />
                </div>`
        } else if (authObj.method === 'self_signed') {
            return html`${commonFields}
                <div class="field-group d-flex flex-column">
                    <label class="form-label field-label mb-0">
                        Issuer <span class="required">*</span>
                    </label>
                    <input
                        class="form-control field-control"
                        type="text"
                        required
                        .value=${(authObj as SelfSignedAuth).issuer}
                        @change=${(e: Event) => {
                            ;(authObj as SelfSignedAuth).issuer = (
                                e.target as HTMLInputElement
                            ).value
                        }}
                    />
                </div>
                <div class="field-group d-flex flex-column">
                    <label class="form-label field-label mb-0">
                        Client Secret <span class="required">*</span>
                    </label>
                    <input
                        class="form-control field-control"
                        type="text"
                        required
                        .value=${(authObj as SelfSignedAuth).clientSecret}
                        @change=${(e: Event) => {
                            ;(authObj as SelfSignedAuth).clientSecret = (
                                e.target as HTMLInputElement
                            ).value
                        }}
                    />
                </div>`
        } else {
            throw new Error(
                `Unsupported auth method: ${JSON.stringify(authObj)}`
            )
        }
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
                                this.network.synchronizerId =
                                    val === '' ? undefined : val
                            }}
                        />
                    </div>

                    <div class="field-group d-flex flex-column">
                        <label class="form-label field-label mb-0">
                            Identity Provider Id
                            <span class="required">*</span>
                        </label>
                        <input
                            class="form-control field-control"
                            type="text"
                            required
                            .value=${this.network.identityProviderId ?? ''}
                            @change=${(e: Event) => {
                                this.network.identityProviderId = (
                                    e.target as HTMLInputElement
                                ).value
                            }}
                        />
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

                    <h3 class="section-title">Configure user auth</h3>
                    ${this.renderAuthForm(this.network.auth)}
                    ${this.renderServiceAccountAuthSection()}
                </div>

                ${this._error
                    ? html`<div class="form-error">${this._error}</div>`
                    : nothing}
                ${isReview
                    ? html`
                          <div class="delete-section">
                              <h4 class="delete-title">Delete network</h4>
                              <p class="delete-desc">
                                  You will not be able to undo the change once
                                  you delete this network.
                              </p>
                              <button
                                  type="button"
                                  class="btn-delete"
                                  @click=${() =>
                                      this.dispatchEvent(
                                          new NetworkDeleteEvent(this.network)
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
                                  class="btn btn-primary rounded-pill w-100"
                                  type="submit"
                              >
                                  Add
                              </button>
                          </div>
                      `}
            </form>
        `
    }
}
