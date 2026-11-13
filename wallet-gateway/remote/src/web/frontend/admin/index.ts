// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'

import {
    BaseElement,
    handleErrorToast,
} from '@canton-network/core-wallet-ui-components'

import type { GetServerStatusResult } from '@canton-network/core-wallet-user-rpc-client'

import { createUserClient } from '../rpc-client'
import '../index'
import { stateManager } from '../state-manager'
import { detectCurrentOrigin } from '../listeners.js'
import { ADMIN_DOCS_URL } from '../constants'

@customElement('user-ui-admin')
export class UserUiAdmin extends BaseElement {
    @state() private accessor status: GetServerStatusResult | undefined =
        undefined

    static styles = [
        BaseElement.styles,
        css`
            :host {
                display: block;
                max-width: 900px;
                margin: 0 auto;
            }

            section {
                margin-bottom: var(--wg-space-8);
            }

            .notice-list {
                display: flex;
                flex-direction: column;
                gap: var(--wg-space-3);
            }

            .notice-meta {
                font-size: 0.85rem;
            }
        `,
    ]

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
            this.status = await userClient.request({
                method: 'getServerStatus',
            })
        } catch (error) {
            handleErrorToast(error)
        }
    }

    private renderNotices(status: GetServerStatusResult) {
        if (status.notices.length === 0) {
            return html`<p class="mb-0 text-body-secondary">
                No notices, the configuration looks good.
            </p>`
        }

        return html`
            <div class="notice-list">
                ${status.notices.map(
                    (notice) => html`
                        <div
                            class="alert ${
                                notice.severity === 'warning'
                                    ? 'alert-warning'
                                    : 'alert-info'
                            } mb-0"
                            role="status"
                        >
                            <div>${notice.message}</div>
                            <div class="notice-meta text-body-secondary mt-1">
                                Last seen
                                <wg-timestamp
                                    .value=${notice.lastSeenAt}
                                ></wg-timestamp>
                            </div>
                        </div>
                    `
                )}
            </div>
        `
    }

    protected render() {
        if (!this.status) {
            return html``
        }

        return html`
            <wg-page-header
                heading="Administration"
                info="Check that the Wallet Gateway is configured correctly. Notices point out anything that needs attention, such as deprecated config options or signing providers that are unavailable."
                .docsUrl=${ADMIN_DOCS_URL}
            ></wg-page-header>
            <p class="text-body-secondary mb-4">
                Wallet Gateway ${this.status.version}
            </p>

            <section>
                <h2 class="h5 fw-semibold">
                    Notices (${this.status.notices.length})
                </h2>
                ${this.renderNotices(this.status)}
            </section>
        `
    }
}
