// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { chevronDownIcon } from '../icons/index.js'
import { SigningProviderChangeEvent, WgWalletForm } from './wallet-form.js'
export { SigningProviderChangeEvent } from './wallet-form.js'

export class WalletCreateEvent extends Event {
    constructor(
        public partyHint: string,
        public signingProviderId: string,
        public primary: boolean,
        public vaultName?: string | undefined
    ) {
        super('wallet-create', { bubbles: true, composed: true })
    }
}

@customElement('wg-wallet-create-form')
export class WgWalletCreateForm extends WgWalletForm {
    protected readonly submitLabel = 'Add'
    protected readonly submittingLabel = 'Adding...'
    protected readonly submittingMessage = 'Creating party, please wait...'

    @property({ type: Array }) signingProviders: string[] = []
    @property({ type: Array }) keySigningProviders: string[] = []
    @property({ type: Array }) publicKeys: string[] = []
    @property({ type: Boolean }) submitting = false
    @property({ type: Boolean }) publicKeysLoading = false

    @state() accessor partyHintValue = ''
    @state() accessor signingProviderValue = ''
    @state() accessor isPrimaryValue = false
    @state() accessor publicKeyValue = ''

    protected onSubmit = (event: SubmitEvent) => {
        event.preventDefault()

        if (this.isLoading) {
            return
        }

        this.dispatchEvent(
            new WalletCreateEvent(
                this.partyHintValue,
                this.signingProviderValue,
                this.isPrimaryValue,
                this.publicKeyValue
            )
        )
    }

    private get showPublicKeySelect(): boolean {
        return (
            !this.signingProviderValue &&
            this.keySigningProviders.includes(this.signingProviderValue)
        )
    }

    private onSigningProviderChange(event: Event) {
        const signingProviderId = (event.target as HTMLSelectElement).value
        this.signingProviderValue = signingProviderId
        this.publicKeyValue = ''
        this.dispatchEvent(new SigningProviderChangeEvent(signingProviderId))
    }

    protected get isLoading(): boolean {
        return (
            this.submitting ||
            (this.showPublicKeySelect && this.publicKeysLoading)
        )
    }

    private onPartyHintInput = (event: InputEvent) => {
        this.partyHintValue = (event.target as HTMLInputElement).value
    }

    private onPublicKeyChange = (event: Event) => {
        this.publicKeyValue = (event.target as HTMLSelectElement).value
    }

    private onPrimaryChange = (event: Event) => {
        this.isPrimaryValue = (event.target as HTMLInputElement).checked
    }

    protected get formFields() {
        return html`
            <div class="field-group d-flex flex-column">
                <label for="party-id-hint" class="form-label field-label mb-0">
                    Party ID Hint <span class="required">*</span>
                </label>
                <input
                    .value=${this.partyHintValue}
                    @input=${this.onPartyHintInput}
                    ?disabled=${this.submitting}
                    class="form-control field-control"
                    id="party-id-hint"
                    type="text"
                    placeholder="Enter the name of your wallet?"
                    required
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
                        .value=${this.signingProviderValue}
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

            ${
                this.showPublicKeySelect
                    ? html`
                          <div class="field-group d-flex flex-column">
                              <label
                                  for="vault-name"
                                  class="form-label field-label mb-0"
                              >
                                  Vault name
                                  <span class="required">*</span>
                              </label>
                              <div class="select-wrap">
                                  <select
                                      .value=${this.publicKeyValue}
                                      @change=${this.onPublicKeyChange}
                                      ?disabled=${this.isLoading}
                                      class="form-select field-control"
                                      id="vault-name"
                                      required
                                  >
                                      <option disabled selected value="">
                                          ${
                                              this.isLoading
                                                  ? 'Loading vaults...'
                                                  : 'Select vault name'
                                          }
                                      </option>
                                      ${this.publicKeys.map(
                                          (vaultName) =>
                                              html`<option value=${vaultName}>
                                                  ${vaultName}
                                              </option>`
                                      )}
                                  </select>
                                  <span class="select-chevron"
                                      >${chevronDownIcon}</span
                                  >
                              </div>
                          </div>
                      `
                    : nothing
            }

            <div class="primary-row mb-0">
                <input
                    id="primary"
                    type="checkbox"
                    .checked=${this.isPrimaryValue}
                    @change=${this.onPrimaryChange}
                    class="form-check-input"
                    ?disabled=${this.submitting}
                />
                <label for="primary" class="form-check-label primary-label"
                    >Set as primary wallet</label
                >
            </div>
        `
    }
}
