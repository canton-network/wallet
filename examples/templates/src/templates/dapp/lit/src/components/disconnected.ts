// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { CantonComponent } from './common/base'

@customElement('canton-disconnected')
export class CantonDisconnected extends CantonComponent {
    @property({ type: Boolean }) accessor busy = false

    render() {
        return html`
            <canton-card title="Canton dApp" class="card">
                <p>Connect a Canton wallet to get started.</p>
                <div class="actions">
                    <button
                        class="primary"
                        ?disabled=${this.busy}
                        @click=${() => this.dispatchEvent(new CustomEvent('connect'))}
                    >
                        Connect wallet
                    </button>
                </div>
            </canton-card>
        `
    }

    static override styles = css`
        ${super.styles}

        .card {
            width: 50%;
            margin: 0 auto;
            display: block;
        }
    `
}
