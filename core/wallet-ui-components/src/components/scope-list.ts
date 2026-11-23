// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { BaseElement } from '../internal/base-element.ts'

/** Read-only list of Ledger API access token scopes requested by a dApp */
export
@customElement('wg-scope-list')
class WgScopeList extends BaseElement {
    @property({ type: Array }) accessor scopes: string[] = []

    static styles = [BaseElement.styles]

    protected render() {
        if (!this.scopes.length) {
            return nothing
        }
        return html`
            <ul class="mb-0 font-monospace small text-break">
                ${this.scopes.map((scope) => html`<li>${scope}</li>`)}
            </ul>
        `
    }
}
