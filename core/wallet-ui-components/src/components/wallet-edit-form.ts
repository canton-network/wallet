// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { chevronDownIcon } from '../icons/index.js'
import { SigningProviderChangeEvent, WgWalletForm } from './wallet-form.js'

export class WalletEditEvent extends Event {
    constructor(
        public partyId: string,
        public signingProviderId: string,
        public publicKey: string
    ) {
        super('wallet-edit', { bubbles: true, composed: true })
    }
}

@customElement('wg-wallet-edit-form')
export class WgWalletEditForm extends WgWalletForm {
    protected readonly submitLabel = 'Edit'
    protected readonly submittingLabel = 'Editing...'
    protected readonly submittingMessage = 'Editing party, please wait...'

    @property({ type: Array }) signingProviders: string[] = []
    @property({ type: Boolean }) submitting = false
    @property({ type: Boolean }) publicKeysLoading = false
    @property({ type: Array }) publicKeys: string[] = []
    @property() readonly partyId = ''
    @property() accessor selectedSigningProvider = ''
    @property() accessor selectedPublicKey = ''

    protected onSubmit = (event: SubmitEvent) => {
        event.preventDefault()

        if (
            this.isLoading ||
            !this.selectedPublicKey ||
            !this.selectedSigningProvider
        ) {
            return
        }

        this.dispatchEvent(
            new WalletEditEvent(
                this.partyId,
                this.selectedSigningProvider,
                this.selectedPublicKey
            )
        )
    }

    private onSigningProviderChange(event: Event) {
        const signingProviderId = (event.target as HTMLSelectElement).value
        this.selectedSigningProvider = signingProviderId
        this.selectedPublicKey = ''
        this.dispatchEvent(new SigningProviderChangeEvent(signingProviderId))
    }

    private onPublicKeyChange(event: Event) {
        const publicKey = (event.target as HTMLSelectElement).value
        this.selectedPublicKey = publicKey
    }

    protected get isLoading(): boolean {
        return this.submitting
    }

    protected get formFields() {
        return html`
            <div class="field-group d-flex flex-column">
                <label for="party-id" class="form-label field-label mb-0">
                    Party ID <span class="required">*</span>
                </label>
                <input
                    ?disabled=${true}
                    .value=${this.partyId}
                    class="form-control field-control"
                    id="party-id"
                    type="text"
                    required
                    readonly
                />
            </div>

            <div class="field-group d-flex flex-column">
                <label
                    for="signing-provider-id"
                    class="form-label field-label mb-0"
                >
                    Signing Provider <span class="required">*</span>
                </label>
                <div class="select-wrap">
                    <select
                        .value=${this.selectedSigningProvider}
                        ?disabled=${this.submitting}
                        class="form-select field-control"
                        id="signing-provider-id"
                        required
                        @change=${this.onSigningProviderChange}
                    >
                        <option disabled selected value="">
                            Select signing provider
                        </option>
                        ${this.signingProviders.map(
                            (providerId) =>
                                html`<option value=${providerId}>
                                    ${providerId}
                                </option>`
                        )}
                    </select>
                    <span class="select-chevron">${chevronDownIcon}</span>
                </div>
            </div>

            <div class="field-group d-flex flex-column">
                <label
                    for="signing-provider-id"
                    class="form-label field-label mb-0"
                >
                    Public Key <span class="required">*</span>
                </label>
                <div class="select-wrap">
                    <select
                        .value=${this.selectedPublicKey}
                        @change=${this.onPublicKeyChange}
                        ?disabled=${this.submitting}
                        class="form-select field-control"
                        id="signing-provider-id"
                        required
                    >
                        <option disabled selected value="">
                            Select public key
                        </option>
                        ${this.publicKeys.map(
                            (key) => html`<option value=${key}>${key}</option>`
                        )}
                    </select>
                    <span class="select-chevron">${chevronDownIcon}</span>
                </div>
            </div>
        `
    }
}
