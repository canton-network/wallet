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

@customElement('user-ui-admin')
export class UserUiAdmin extends BaseElement {
    @state() accessor status: GetServerStatusResult | undefined = undefined
    @state() accessor isAdmin: boolean | undefined = undefined

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

            pre {
                white-space: pre-wrap;
                word-break: break-all;
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
            const { isAdmin } = await userClient.request({ method: 'getUser' })
            this.isAdmin = isAdmin
            if (isAdmin) {
                this.status = await userClient.request({
                    method: 'getServerStatus',
                })
            }
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
                                ${new Date(notice.lastSeenAt).toLocaleString()}
                            </div>
                        </div>
                    `
                )}
            </div>
        `
    }

    protected render() {
        if (this.isAdmin === undefined) {
            return html``
        }

        if (!this.isAdmin) {
            return html`<p class="mb-0 text-body-secondary">
                Only the admin user can view this page.
            </p>`
        }

        if (!this.status) {
            return html``
        }

        return html`
            <h1 class="h4 fw-semibold mb-4">Administration</h1>

            <section>
                <h2 class="h5 fw-semibold">
                    Notices (${this.status.notices.length})
                </h2>
                ${this.renderNotices(this.status)}
            </section>

            <section>
                <h2 class="h5 fw-semibold">Configuration</h2>
                <p class="text-body-secondary">
                    Wallet Gateway ${this.status.version}. The configuration
                    file as loaded at startup, before environment variables are
                    resolved. Inline secrets are redacted.
                </p>
                <details>
                    <summary>Show configuration</summary>
                    <pre class="mt-2"><code>${JSON.stringify(
                        this.status.config,
                        null,
                        2
                    )}</code></pre>
                </details>
            </section>
        `
    }
}
