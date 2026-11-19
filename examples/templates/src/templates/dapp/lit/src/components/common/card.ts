// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('canton-card')
export class CantonCard extends LitElement {
    render() {
        return html`
            <div class="card">
                <h1>Title</h1>
                <hr />
                <div class="card-content">
                    <slot></slot>
                </div>
            </div>
        `
    }

    static override styles = css`
        .card {
            display: flex;
            flex-direction: column;
            padding: 1em;
            border: 1px solid;
        }
    `
}
