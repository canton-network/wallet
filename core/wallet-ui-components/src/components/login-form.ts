// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css, html, PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import './back-link.js'
import { BaseElement } from '../internal/base-element.js'
import { chevronLeftIcon } from '../icons/index.js'
import { PublicNetwork, Idp } from '@canton-network/core-wallet-user-rpc-client'
import cantonLogo from '../../images/logos/canton-logo.png'

/** Emitted when the user clicks the Connect button */
export class LoginConnectEvent extends Event {
    constructor(
        public selectedNetwork: PublicNetwork,
        public selectedIdp: Idp,
        public clientId: string
    ) {
        super('login-connect', { bubbles: true, composed: true })
    }
}

/** Emitted when the user clicks the Back link */
export class LoginBackEvent extends Event {
    constructor() {
        super('login-back', {
            bubbles: true,
            composed: true,
            cancelable: true,
        })
    }
}

@customElement('wg-login-form')
export class WgLoginForm extends BaseElement {
    /** Available networks to show in the dropdown */
    @property({ type: Array }) networks: PublicNetwork[] = []

    /** Available identity providers */
    @property({ type: Array }) idps: Idp[] = []

    /** IDs of networks to show in the "Recommended" section */
    @property({ type: Array }) recommendedNetworkIds: string[] = []

    @property({ type: Boolean }) connecting = false
    @property({ type: String }) backHref = '/'

    @state() accessor selectedNetwork: PublicNetwork | null = null
    @state() accessor selectedIdp: Idp | null = null
    @state() accessor message: string | null = null
    @state() accessor messageType: 'error' | 'info' | null = null

    static styles = [
        BaseElement.styles,
        css`
            :host {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100dvh;
                padding: 1rem;
                box-sizing: border-box;
            }

            .modal-card {
                width: 100%;
                max-width: 420px;
                background-color: var(--wg-surface);
                background-image:
                    linear-gradient(
                        90deg,
                        rgba(0, 0, 0, 0.04) 1px,
                        transparent 1px
                    ),
                    linear-gradient(
                        0deg,
                        rgba(0, 0, 0, 0.04) 1px,
                        transparent 1px
                    );
                background-size:
                    25px 25px,
                    25px 25px;
                border-radius: 16px;
                box-shadow: var(--wg-shadow-lg);
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            .top-bar {
                display: flex;
                align-items: center;
                gap: 0.625rem;
                padding: 1rem 1.25rem 0;
            }

            .top-left {
                display: flex;
                align-items: center;
                gap: 0.625rem;
                flex: 1;
                min-width: 0;
            }

            .back-btn {
                border: none;
                background: transparent;
                color: var(--wg-text-secondary);
                cursor: pointer;
                padding: 0.25rem;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                border-radius: var(--wg-radius-md);
                transition: background 0.15s ease;
            }

            .back-btn:hover {
                background: rgba(var(--wg-accent-rgb), 0.08);
            }

            .top-logo {
                width: 28px;
                height: 28px;
                object-fit: contain;
                display: block;
                flex-shrink: 0;
            }

            .top-title {
                font-size: var(--wg-font-size-lg);
                font-weight: var(--wg-font-weight-bold);
                color: var(--wg-text);
                margin: 0;
                flex: 1;
                min-width: 0;
            }

            .content {
                padding: 1rem 1.25rem 16px;
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

            .section-title {
                font-size: var(--wg-font-size-xs);
                font-weight: 500;
                color: #928ca0;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin: 0.5rem 0 0.375rem;
            }

            .network-item {
                width: 100%;
                display: flex;
                flex-direction: column;
                border-radius: 8px;
                background: rgb(255 255 255 / 80%);
                border: 1px solid transparent;
                box-shadow:
                    0 2px 6px rgba(0, 0, 0, 0.06),
                    0 4px 12px rgba(0, 0, 0, 0.04);
                cursor: pointer;
                transition: all 0.15s ease;
                text-align: left;
                margin-bottom: 8px;
                opacity: 0.9;
                position: relative;
                font: inherit;
                color: var(--wg-text);
                box-sizing: border-box;
            }

            .network-item-top {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 14px 12px;
            }

            .network-item::before {
                content: '';
                position: absolute;
                inset: 0;
                border-radius: 8px;
                background:
                    radial-gradient(
                        ellipse 120% 100% at calc(var(--mx, 10) * 1%)
                            calc(var(--my, 40) * 1%),
                        rgba(124, 58, 237, 0.12) 0%,
                        transparent 50%
                    ),
                    radial-gradient(
                        ellipse 100% 120% at calc(100% - var(--mx, 85) * 1%)
                            calc(var(--my, 60) * 1%),
                        rgba(124, 58, 237, 0.12) 0%,
                        transparent 50%
                    ),
                    radial-gradient(
                        ellipse 80% 80% at 50% 80%,
                        rgba(0, 0, 0, 0.06) 0%,
                        transparent 50%
                    );
                opacity: 0;
                transition: opacity 0.2s ease;
                pointer-events: none;
                z-index: -1;
            }

            .network-item:hover::before {
                opacity: 1;
            }

            .network-item:hover {
                border-color: rgba(0, 0, 0, 0.08);
                box-shadow:
                    -8px -8px 20px rgba(255, 255, 255, 0.95),
                    10px 10px 28px rgba(0, 0, 0, 0.16);
            }

            .network-item:focus-visible {
                outline: 2px solid var(--wg-theme-accent-color);
                outline-offset: 2px;
            }

            .network-item.selected {
                border-color: var(--wg-accent);
                box-shadow: 0 0 0 3px rgba(var(--wg-accent-rgb), 0.15);
            }

            .network-item.selected::before {
                opacity: 1;
                background:
                    radial-gradient(
                        ellipse 120% 100% at 10% 40%,
                        rgba(124, 58, 237, 0.12) 0%,
                        transparent 50%
                    ),
                    radial-gradient(
                        ellipse 100% 120% at 90% 60%,
                        rgba(124, 58, 237, 0.12) 0%,
                        transparent 50%
                    ),
                    radial-gradient(
                        ellipse 80% 80% at 50% 80%,
                        rgba(0, 0, 0, 0.06) 0%,
                        transparent 50%
                    );
            }

            .network-item.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .network-item-body {
                flex: 1;
                min-width: 0;
            }

            .network-item-name {
                font-size: var(--wg-font-size-sm);
                font-weight: var(--wg-font-weight-semibold);
                display: block;
                line-height: 1.3;
            }

            .network-item-desc {
                font-size: var(--wg-font-size-xs);
                color: var(--wg-text-secondary);
                display: block;
                line-height: 1.3;
                margin-top: 0.125rem;
            }

            .network-item-client-id {
                padding: 0 12px 14px;
            }

            .client-id-input-wrap {
                display: flex;
                align-items: center;
                border: 1px solid var(--wg-border);
                border-radius: 8px;
                background: var(--wg-input-bg);
                transition:
                    border-color 0.15s,
                    box-shadow 0.15s;
            }

            .client-id-input-wrap:focus-within {
                border-color: var(--wg-accent);
                box-shadow: 0 0 0 2px rgba(var(--wg-accent-rgb), 0.15);
            }

            .client-id-input {
                flex: 1;
                padding: 10px 12px;
                border: none;
                outline: none;
                font-size: 14px;
                background: transparent;
                color: var(--wg-text);
                min-width: 0;
                font: inherit;
            }

            .client-id-input::placeholder {
                color: var(--wg-text-secondary);
            }

            .btn-connect {
                background: transparent;
                color: var(--wg-text-secondary);
                border: 1px solid var(--wg-border);
                border-radius: 6px;
                padding: 5px 10px;
                margin-right: 5px;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.15s;
                flex-shrink: 0;
            }

            .btn-connect:hover {
                background: var(--wg-surface-hover);
                color: var(--wg-text);
                border-color: var(--wg-accent);
            }

            .btn-connect:disabled {
                opacity: 0.5;
                cursor: default;
            }
        `,
    ]

    private get recommendedNetworks(): PublicNetwork[] {
        return this.networks.filter((n) =>
            this.recommendedNetworkIds.includes(n.id)
        )
    }

    private get otherNetworks(): PublicNetwork[] {
        return this.networks.filter(
            (n) => !this.recommendedNetworkIds.includes(n.id)
        )
    }

    protected updated(changedProperties: PropertyValues<this>) {
        super.updated(changedProperties)

        if (changedProperties.has('networks') && !this.selectedNetwork) {
            const recommended = this.recommendedNetworks
            const preferred =
                recommended.length > 0 ? recommended : this.networks

            const index = preferred.findIndex(
                (network) => network.authMethod !== 'client_credentials'
            )

            if (index >= 0) {
                this.selectNetwork(preferred[index])
            } else if (preferred.length > 0) {
                this.selectNetwork(preferred[0])
            }
        }
    }

    private selectNetwork(network: PublicNetwork) {
        this.selectedNetwork = network
        this.selectedIdp =
            this.idps.find((idp) => idp.id === network.identityProviderId) ??
            null
        this.message = null
    }

    private handleConnect() {
        this.message = null

        if (!this.selectedNetwork) {
            this.messageType = 'error'
            this.message = 'Please select a network before connecting.'
            return
        }

        const idp = this.idps.find(
            (candidate) =>
                candidate.id === this.selectedNetwork?.identityProviderId
        )

        if (!idp) {
            this.messageType = 'error'
            this.message = 'Identity provider misconfigured for this network.'
            return
        }

        const clientId =
            (
                this.renderRoot.querySelector(
                    `#client-id-${this.selectedNetwork.id}`
                ) as HTMLInputElement | null
            )?.value || this.selectedNetwork.clientId

        this.dispatchEvent(
            new LoginConnectEvent(this.selectedNetwork, idp, clientId || '')
        )
    }

    /** Set a status message on the form (e.g. "Redirecting...") */
    setMessage(message: string, type: 'error' | 'info') {
        this.message = message
        this.messageType = type
    }

    /** Clear the status message */
    clearMessage() {
        this.message = null
        this.messageType = null
    }

    connectedCallback(): void {
        super.connectedCallback()
        this.addEventListener('mousemove', this.onMouseMove)
    }

    disconnectedCallback(): void {
        super.disconnectedCallback()
        this.removeEventListener('mousemove', this.onMouseMove)
    }

    private readonly onMouseMove = (event: MouseEvent): void => {
        const rect = this.getBoundingClientRect()
        const x = ((event.clientX - rect.left) / rect.width) * 100
        const y = ((event.clientY - rect.top) / rect.height) * 100
        this.style.setProperty('--mx', String(x))
        this.style.setProperty('--my', String(y))
    }

    private renderNetworkItem(network: PublicNetwork) {
        const isSelfSigned = this.selectedIdp?.type === 'self_signed'
        const isSelected = this.selectedNetwork?.id === network.id
        const disabled =
            this.connecting || network.authMethod === 'client_credentials'
        const showClientId = isSelected && isSelfSigned

        const handleClick = () => {
            if (disabled) return
            if (isSelfSigned) {
                this.selectNetwork(network)
            } else {
                this.selectNetwork(network)
                this.handleConnect()
            }
        }

        const handleKeydown = (e: KeyboardEvent) => {
            if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                handleClick()
            }
        }

        const handleConnectClick = (e: Event) => {
            e.stopPropagation()
            this.handleConnect()
        }

        const handleInputKeydown = (e: KeyboardEvent) => {
            e.stopPropagation()
            if (e.key === 'Enter') {
                this.handleConnect()
            }
        }

        return html`
            <div
                class="network-item ${isSelected ? 'selected' : ''} ${disabled
                    ? 'disabled'
                    : ''}"
                role="button"
                tabindex=${disabled ? '-1' : '0'}
                @click=${handleClick}
                @keydown=${handleKeydown}
            >
                <div class="network-item-top">
                    <div class="network-item-body">
                        <span class="network-item-name">${network.name}</span>
                        ${network.description
                            ? html`<span class="network-item-desc"
                                  >${network.description}</span
                              >`
                            : ''}
                    </div>
                </div>
                ${showClientId
                    ? html`
                          <div class="network-item-client-id">
                              <div class="client-id-input-wrap">
                                  <input
                                      id="client-id-${network.id}"
                                      class="client-id-input"
                                      type="text"
                                      placeholder="Client ID"
                                      .value=${this.selectedNetwork?.clientId ||
                                      ''}
                                      ?disabled=${this.connecting}
                                      @click=${(e: Event) =>
                                          e.stopPropagation()}
                                      @keydown=${handleInputKeydown}
                                  />
                                  <button
                                      type="button"
                                      class="btn-connect"
                                      ?disabled=${this.connecting}
                                      @click=${handleConnectClick}
                                  >
                                      ${this.connecting
                                          ? 'Connecting…'
                                          : 'Connect'}
                                  </button>
                              </div>
                          </div>
                      `
                    : ''}
            </div>
        `
    }

    private handleBack() {
        this.dispatchEvent(new LoginBackEvent())
    }

    protected render() {
        const recommended = this.recommendedNetworks
        const other = this.otherNetworks
        const hasRecommended = recommended.length > 0

        return html`
            <div class="modal-card">
                <div class="top-bar">
                    <div class="top-left">
                        <button
                            type="button"
                            class="back-btn"
                            @click=${this.handleBack}
                            aria-label="Back"
                        >
                            ${chevronLeftIcon}
                        </button>
                        <img
                            class="top-logo"
                            src=${cantonLogo}
                            alt="Canton logo"
                        />
                        <h1 class="top-title">Wallet Gateway</h1>
                    </div>
                </div>

                <div class="content">
                    ${hasRecommended
                        ? html`
                              <p class="section-title">Recommended</p>
                              ${recommended.map((n) =>
                                  this.renderNetworkItem(n)
                              )}
                          `
                        : ''}
                    ${other.length > 0
                        ? html`
                              <p class="section-title">Other</p>
                              ${other.map((n) => this.renderNetworkItem(n))}
                          `
                        : ''}
                </div>

                ${this.message
                    ? html`<div
                          class="alert ${this.messageType === 'error'
                              ? 'alert-danger'
                              : 'alert-info'} py-2 px-3 small mt-1 mb-0"
                          role="alert"
                      >
                          ${this.message}
                      </div>`
                    : ''}
            </div>
        `
    }
}
