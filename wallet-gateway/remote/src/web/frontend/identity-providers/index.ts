// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'

import {
    BaseElement,
    type IdpCardReviewEvent,
    type PageChangeEvent,
    handleErrorToast,
    toRelPath,
} from '@canton-network/core-wallet-ui-components'

import type { Idp } from '@canton-network/core-wallet-user-rpc-client'

import { createUserClient } from '../rpc-client'
import { setLocationHref } from '../navigation.js'
import '../index'
import { stateManager } from '../state-manager'
import { detectCurrentOrigin } from '../listeners.js'
import { IDENTITY_PROVIDERS_DOCS_URL } from '../constants'

@customElement('user-ui-identity-providers')
export class UserUiIdentityProviders extends BaseElement {
    @state() accessor idps: Idp[] = []
    @state() accessor isAdmin = false
    @state() accessor configManagedIds: string[] = []
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

            .idp-list {
                display: flex;
                flex-direction: column;
                gap: var(--wg-space-4);
            }

            .pagination-wrap {
                margin-top: var(--wg-space-8);
                display: flex;
                justify-content: center;
            }

            .btn-add {
                padding: 0.45rem 1.1rem;
            }
        `,
    ]

    private get pagedIdps() {
        const start = (this.currentPage - 1) * this.pageSize
        return this.idps.slice(start, start + this.pageSize)
    }

    async connectedCallback(): Promise<void> {
        super.connectedCallback()
        await this.loadData()
    }

    private async loadData() {
        try {
            const currentOrigin = await detectCurrentOrigin()
            const userClient = await createUserClient(
                await stateManager.accessToken.get(currentOrigin)
            )
            const [idpsResult, userResult] = await Promise.all([
                userClient.request({ method: 'listIdps' }),
                userClient
                    .request({ method: 'getUser' })
                    .catch(() => ({ userId: '', isAdmin: false })),
            ])

            this.idps = idpsResult.idps
            this.configManagedIds = idpsResult.configManagedIds ?? []
            this.isAdmin = userResult.isAdmin

            const maxPage = Math.max(
                1,
                Math.ceil(this.idps.length / this.pageSize)
            )
            if (this.currentPage > maxPage) {
                this.currentPage = maxPage
            }
        } catch (error) {
            handleErrorToast(error)
        }
    }

    private _onReview(e: IdpCardReviewEvent) {
        setLocationHref(
            `${toRelPath('/identity-providers/review/')}?id=${encodeURIComponent(e.idp.id)}`
        )
    }

    private _onPageChange(e: PageChangeEvent) {
        this.currentPage = e.page
    }

    protected render() {
        return html`
            <div class="page-header">
                <h1 class="h4 fw-semibold mb-0">Identity Providers</h1>

                ${
                    this.isAdmin
                        ? html`
                              <button
                                  class="btn btn-primary btn-sm rounded-pill btn-add"
                                  type="button"
                                  @click=${() =>
                                      setLocationHref(
                                          toRelPath('/identity-providers/add/')
                                      )}
                              >
                                  <span aria-hidden="true">+</span>
                                  New
                              </button>
                          `
                        : ''
                }
            </div>

            <p class="text-body-secondary mb-4">
                An identity provider (IdP) issues the tokens that users and the
                Wallet Gateway use to authenticate against a network's Ledger
                API. Every network references one. Use an OAuth / OpenID Connect
                provider in production; self-signed tokens are for development
                and testing only.
                <a
                    href=${IDENTITY_PROVIDERS_DOCS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    >Learn more in the docs</a
                >
            </p>

            ${
                this.idps.length === 0
                    ? html`<p class="mb-0 text-body-secondary">
                          No identity providers configured.
                      </p>`
                    : html`
                          <div class="idp-list">
                              ${this.pagedIdps.map(
                                  (idp) => html`
                                      <idp-card
                                          .idp=${idp}
                                          .readonly=${
                                              !this.isAdmin ||
                                              this.configManagedIds.includes(
                                                  idp.id
                                              )
                                          }
                                          .configManaged=${this.configManagedIds.includes(
                                              idp.id
                                          )}
                                          @idp-review=${this._onReview}
                                      ></idp-card>
                                  `
                              )}
                          </div>

                          ${
                              this.idps.length > this.pageSize
                                  ? html`
                                        <div class="pagination-wrap">
                                            <wg-pagination
                                                .total=${this.idps.length}
                                                .pageSize=${this.pageSize}
                                                .page=${this.currentPage}
                                                @page-change=${this._onPageChange}
                                            ></wg-pagination>
                                        </div>
                                    `
                                  : ''
                          }
                      `
            }
        `
    }
}
