// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { CantonComponent } from './base'

@customElement('canton-card')
export class CantonCard extends CantonComponent {
    @property() accessor title = ''

    render() {
        return html`
            <div class="card">
                <h1>${this.title}</h1>
                <div class="card-content">
                    <slot></slot>
                </div>
            </div>
        `
    }

    static override styles = css`
        ${super.styles}
        .card {
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            padding: 1.5em;
            border: 1px solid;
            border-radius: 0.5em;
            height: 100%;
        }
    `
}
