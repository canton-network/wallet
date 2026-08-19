// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, nothing } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { chevronDownIcon } from '../icons/index.js'
import { WgWalletForm } from './wallet-form.js'

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

export class SigningProviderChangeEvent extends Event {
    constructor(public signingProviderId: string) {
        super('signing-provider-change', { bubbles: true, composed: true })
    }
}

@customElement('wg-wallet-create-form')
export class WgWalletCreateForm extends WgWalletForm {
    @property({ type: Array }) signingProviders: string[] = []
    @property({ type: Array }) networkIds: string[] = []
    // Render vaults select for those signing providers
    @property({ type: Array }) vaultSigningProviders: string[] = []
    @property({ type: Array }) vaults: string[] = []
    @property({ type: Boolean }) submitting = false
    @property({ type: Boolean }) vaultsLoading = false
    @property({ type: String }) submitLabel = 'Add'
    @property({ type: String }) submittingLabel = 'Adding...'
    @property({ type: String }) submittingMessage =
        'Creating party, please wait...'
    @property({ type: String }) vaultsLoadingLabel = 'Loading vaults...'

    @query('#party-id-hint') accessor partyHintInput: HTMLInputElement | null =
        null
    @query('#signing-provider-id')
    accessor signingProviderSelect: HTMLSelectElement | null = null
    @query('#primary') accessor primaryCheckbox: HTMLInputElement | null = null
    @query('#vault-name')
    accessor vaultSelect: HTMLSelectElement | null = null

    @state() accessor selectedSigningProvider: string | null = null

    protected onSubmit = (event: SubmitEvent) => {
        event.preventDefault()

        if (this.isLoading) {
            return
        }

        const partyHint = this.partyHintInput?.value || ''
        const signingProviderId = this.signingProviderSelect?.value || ''
        const primary = this.primaryCheckbox?.checked || false
        const vaultName = this.vaultSelect?.value || undefined

        this.dispatchEvent(
            new WalletCreateEvent(
                partyHint,
                signingProviderId,
                primary,
                vaultName
            )
        )
    }

    private onSigningProviderChange(event: Event) {
        const signingProviderId = (event.target as HTMLSelectElement).value
        this.selectedSigningProvider = signingProviderId
        if (this.vaultSelect) {
            this.vaultSelect.value = ''
        }
        this.dispatchEvent(new SigningProviderChangeEvent(signingProviderId))
    }

    private get showVaultSelect(): boolean {
        return (
            this.selectedSigningProvider !== null &&
            this.vaultSigningProviders.includes(this.selectedSigningProvider)
        )
    }

    protected get isLoading(): boolean {
        return this.submitting || (this.showVaultSelect && this.vaultsLoading)
    }

    reset() {
        if (this.partyHintInput) {
            this.partyHintInput.value = ''
        }
        if (this.primaryCheckbox) {
            this.primaryCheckbox.checked = false
        }
        if (this.vaultSelect) {
            this.vaultSelect.value = ''
        }
        this.selectedSigningProvider = null
    }

    protected get formFields() {
        return html`
            <div class="field-group d-flex flex-column">
                <label for="party-id-hint" class="form-label field-label mb-0">
                    Party ID Hint <span class="required">*</span>
                </label>
                <input
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
                this.showVaultSelect
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
                                      ?disabled=${this.isLoading}
                                      class="form-select field-control"
                                      id="vault-name"
                                      required
                                  >
                                      <option disabled selected value="">
                                          ${
                                              this.isLoading
                                                  ? this.vaultsLoadingLabel
                                                  : 'Select vault name'
                                          }
                                      </option>
                                      ${this.vaults.map(
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
