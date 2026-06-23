// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import {
    ApiKeyGenerateEvent,
    BaseElement,
    chevronLeftIcon,
    handleErrorToast,
    toRelHref,
    toRelPath,
} from '@canton-network/core-wallet-ui-components'
import { createUserClient } from '../../rpc-client'
import { setLocationHref } from '../../navigation.js'
import { stateManager } from '../../state-manager'
import '../../index'
import { GeneratedApiKey } from '@canton-network/core-wallet-user-rpc-client'

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

            .page-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: var(--wg-space-4);
                gap: var(--wg-space-3);
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
            const userClient = await createUserClient(
                stateManager.accessToken.get()
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
            <div class="page-header">
                <h1 class="h4 fw-semibold mb-0">Generate new API Key</h1>
                <button
                    class="btn btn-link btn-sm text-body text-decoration-none p-0 d-inline-flex align-items-center gap-1"
                    type="button"
                    @click=${this.navigateBack}
                >
                    ${chevronLeftIcon}
                    <span>Back</span>
                </button>
            </div>

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
            <div class="page-header">
                <h1 class="h4 fw-semibold mb-0">API Key generated</h1>
            </div>

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
