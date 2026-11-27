// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { BaseElement } from '../internal/base-element.ts'
import { assessScopes } from '../logic/scopes.ts'
import './scope-list.ts'

/** Explains what access a dApp gets with the scopes it requested, compared with the scopes recognized by Canton */
export
@customElement('wg-scope-consent')
class WgScopeConsent extends BaseElement {
    /** Requested scopes. Undefined or an empty array means full access */
    @property({ type: Array }) accessor scopes: string[] | undefined = undefined
    @property({ type: String }) accessor origin = ''

    static styles = [BaseElement.styles]

    protected render() {
        const origin = html`<strong class="text-break"
            >${this.origin || 'This dApp'}</strong
        >`
        const assessment = assessScopes(this.scopes)

        switch (assessment.verdict) {
            case 'none':
                return html`<div class="alert alert-warning mb-0">
                    <p class="mb-0">
                        ${origin} requested no specific permissions and will
                        have full ledger access.
                    </p>
                </div>`
            case 'scoped':
                return html`<div class="alert alert-success mb-0">
                    <p class="mb-2">
                        ${origin} requests limited access to the ledger. The
                        access token will be restricted to these permissions:
                    </p>
                    <wg-scope-list
                        .scopes=${assessment.recognized}
                    ></wg-scope-list>
                </div>`
            case 'partial':
                return html`<p class="mb-2">
                        ${origin} requests limited access, but Wallet Gateway
                        doesn't recognize some of the permissions.
                    </p>
                    <div class="alert alert-success mb-2">
                        <p class="mb-2">
                            Recognized. The access token will be restricted to
                            these permissions:
                        </p>
                        <wg-scope-list
                            .scopes=${assessment.recognized}
                        ></wg-scope-list>
                    </div>
                    <div class="alert alert-warning mb-2">
                        <p class="mb-2">
                            Not recognized. These may have no effect, or an
                            effect Wallet Gateway can't describe. Check them
                            carefully.
                        </p>
                        <wg-scope-list
                            .scopes=${assessment.unrecognized}
                        ></wg-scope-list>
                    </div>
                    <p class="mb-0">
                        Continue only if you understand and accept effects of
                        granting the dApp these permissions.
                    </p>`
            case 'unrecognized':
                return html`<div class="alert alert-danger mb-0">
                    <p class="mb-2">
                        ${origin} requests permissions Wallet Gateway doesn't
                        recognize:
                    </p>
                    <wg-scope-list
                        .scopes=${assessment.unrecognized}
                    ></wg-scope-list>
                    <p class="mt-2 mb-0">
                        If the ledger doesn't recognize them either, the dApp
                        gets full access. Continue only if you understand what
                        these permissions do.
                    </p>
                </div>`
        }
    }
}
