// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'

import {
    ApiKeyCardRevokeEvent,
    BaseElement,
    handleErrorToast,
    PageChangeEvent,
    toRelPath,
} from '@canton-network/core-wallet-ui-components'

import { ApiKey } from '@canton-network/core-wallet-user-rpc-client'

import { createUserClient } from '../rpc-client'
import { setLocationHref } from '../navigation.js'
import '../index'
import { stateManager } from '../state-manager'
import { showToast } from '../utils.js'

@customElement('user-ui-api-keys')
export class UserUiApiKeys extends BaseElement {
    @state() accessor apiKeys: ApiKey[] = []
    @state() accessor currentPage = 1

    private readonly pageSize = 4

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
                justify-content: space-between;
                align-items: center;
                gap: var(--wg-space-3);
                margin-bottom: var(--wg-space-4);
            }

            .pagination-wrap {
                margin-top: var(--wg-space-8);
                display: flex;
                justify-content: center;
            }

            .btn-add {
                padding: 0.45rem 1.1rem;
            }

            .api-key-list {
                display: flex;
                flex-direction: column;
                gap: var(--wg-space-4);
            }
        `,
    ]

    private get pagedApiKeys() {
        const start = (this.currentPage - 1) * this.pageSize
        return this.apiKeys.slice(start, start + this.pageSize)
    }

    async connectedCallback(): Promise<void> {
        super.connectedCallback()
        await this.loadData()
    }

    private async loadData() {
        try {
            const userClient = await createUserClient(
                stateManager.accessToken.get()
            )
            const apiKeys = await userClient.request({ method: 'listApiKeys' })
            this.apiKeys = apiKeys.apiKeys

            const maxPage = Math.max(
                1,
                Math.ceil(this.apiKeys.length / this.pageSize)
            )
            if (this.currentPage > maxPage) {
                this.currentPage = maxPage
            }
        } catch (error) {
            handleErrorToast(error)
        }
    }

    private _onPageChange(e: PageChangeEvent) {
        this.currentPage = e.page
    }

    // TODO: https://github.com/canton-network/wallet/issues/2043
    private async _revokeApiKey(apiKeyEvent: ApiKeyCardRevokeEvent) {
        try {
            const userClient = await createUserClient(
                stateManager.accessToken.get()
            )

            await userClient.request({
                method: 'removeApiKey',
                params: { id: apiKeyEvent.apiKey.id },
            })

            showToast('', 'API key removed', 'success')

            this.apiKeys = this.apiKeys.filter(
                (key) => key.id !== apiKeyEvent.apiKey.id
            )
        } catch (error) {
            handleErrorToast(error)
        }
    }

    protected render() {
        return html`
            <div class="page-header">
                <h1 class="h4 fw-semibold mb-0">API Keys</h1>

                <button
                    class="btn btn-primary btn-sm rounded-pill btn-add"
                    type="button"
                    @click=${() => setLocationHref(toRelPath('/api-keys/add/'))}
                >
                    <span aria-hidden="true">+</span>
                    Generate
                </button>
            </div>

            ${this.apiKeys.length === 0
                ? html`<p class="mb-0 text-body-secondary">
                      No API keys configured.
                  </p>`
                : html`
                      <div class="api-key-list">
                          ${this.pagedApiKeys.map((apiKey) => {
                              return html`
                                  <api-key-card
                                      .apiKey=${apiKey}
                                      @revoke=${this._revokeApiKey}
                                  ></api-key-card>
                              `
                          })}
                      </div>

                      ${this.apiKeys.length > this.pageSize
                          ? html`
                                <div class="pagination-wrap">
                                    <wg-pagination
                                        .total=${this.apiKeys.length}
                                        .pageSize=${this.pageSize}
                                        .page=${this.currentPage}
                                        @page-change=${this._onPageChange}
                                    ></wg-pagination>
                                </div>
                            `
                          : ''}
                  `}
        `
    }
}
