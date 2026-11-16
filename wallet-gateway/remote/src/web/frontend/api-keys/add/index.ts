// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import {
    type ApiKeyGenerateEvent,
    BaseElement,
    handleErrorToast,
    toRelHref,
    toRelPath,
} from '@canton-network/core-wallet-ui-components'
import { createUserClient } from '../../rpc-client'
import { setLocationHref } from '../../navigation.js'
import { stateManager } from '../../state-manager'
import '../../index'
import type { GeneratedApiKey } from '@canton-network/core-wallet-user-rpc-client'
import { detectCurrentOrigin } from '../../listeners.js'
import { API_KEYS_DOCS_URL, API_KEYS_INFO } from '../../constants'

@customElement('user-ui-add-api-key')
export class UserUiAddApiKey extends BaseElement {
    @state() accessor loading = false
    @state() accessor result: {
        generated: GeneratedApiKey
        name: string
    } | null = null

    static styles = [
        BaseElement.styles,
        css`
            :host {
                display: block;
                max-width: 900px;
                margin: 0 auto;
            }

            .form-wrap {
                width: 100%;
            }

            .api-key-id {
                width: 50px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-family: var(--wg-font-family-monospace);
                font-size: var(--wg-font-size-sm);
            }

            .api-key-copy {
                display: flex;
                flex-direction: row;
            }

            .api-key-generated {
                width: 50%;
                font-family: var(--wg-font-family-monospace);
                font-size: var(--wg-font-size-sm);
            }
        `,
    ]

    private navigateBack() {
        setLocationHref(toRelHref('/api-keys'))
    }

    private async onSave(e: ApiKeyGenerateEvent) {
        this.loading = true

        try {
            const currentOrigin = await detectCurrentOrigin()
            const userClient = await createUserClient(
                await stateManager.accessToken.get(currentOrigin)
            )
            const generated = await userClient.request({
                method: 'generateApiKey',
                params: e.apiKeyParams,
            })
            this.result = { generated, name: e.apiKeyParams.name }
        } catch (error) {
            this.loading = false
            handleErrorToast(error)
        }
    }

    private async onConfirm() {
        setLocationHref(toRelPath('/api-keys/'))
    }

    protected render() {
        if (this.result) {
            return this.renderConfirmation(this.result)
        }

        return html`
            <wg-page-header
                heading="Generate API key"
                .info=${API_KEYS_INFO}
                .docsUrl=${API_KEYS_DOCS_URL}
            >
                <wg-back-link @click=${this.navigateBack}></wg-back-link>
            </wg-page-header>

            <div class="form-wrap">
                <api-key-form @api-key-generate=${this.onSave}></api-key-form>
            </div>
        `
    }

    protected renderConfirmation(result: {
        generated: GeneratedApiKey
        name: string
    }) {
        return html`
            <wg-page-header heading="API key generated"></wg-page-header>

            <div class="form-wrap">
                <div class="mb-4">
                    <p class="text-body-secondary">
                        Your new API key
                        <span class="fw-semibold">${result.name}</span>
                        (<span class="api-key-id">${result.generated.id}</span>)
                        has been generated successfully. Copy it and save it in
                        a secure place. This key will not be shown again.
                    </p>
                </div>

                <div class="mt-2 mb-4 api-key-copy">
                    <input
                        class="api-key-generated"
                        .disabled=${true}
                        .value=${result.generated.apiKey}
                    />
                    <wg-copy-button
                        .value=${result.generated.apiKey}
                    ></wg-copy-button>
                </div>

                <div class="form-actions">
                    <button
                        class="btn btn-primary btn-sm rounded-pill"
                        type="button"
                        @click=${this.onConfirm}
                    >
                        Continue
                    </button>
                </div>
            </div>
        `
    }
}
