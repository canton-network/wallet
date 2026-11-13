// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css, html, nothing } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import {
    BaseElement,
    type IdpFormSaveEvent,
    type IdpFormDeleteEvent,
    handleErrorToast,
    toRelHref,
    toRelPath,
} from '@canton-network/core-wallet-ui-components'
import type { Idp } from '@canton-network/core-wallet-user-rpc-client'
import { createUserClient } from '../../rpc-client'
import { setLocationHref } from '../../navigation.js'
import { stateManager } from '../../state-manager'
import '../../index'
import { detectCurrentOrigin } from '../../listeners.js'
import {
    IDENTITY_PROVIDERS_INFO,
    IDENTITY_PROVIDERS_DOCS_URL,
} from '../../constants'
import { showToastAfterNavigation } from '../../utils'

@customElement('user-ui-review-idp')
export class UserUiReviewIdp extends BaseElement {
    @state() accessor idp: Idp | null = null
    @state() accessor loading = true
    @state() private accessor usedByNetworks: string[] = []

    static styles = [
        BaseElement.styles,
        css`
            :host {
                display: block;
                max-width: 900px;
                margin: 0 auto;
            }

            .form-wrap {
                width: 100%;
            }
        `,
    ]

    async connectedCallback(): Promise<void> {
        super.connectedCallback()
        await this.loadIdp()
    }

    private async loadIdp() {
        const params = new URLSearchParams(window.location.search)
        const idpId = params.get('id')

        if (!idpId) {
            this.navigateBack()
            return
        }

        try {
            const currentOrigin = await detectCurrentOrigin()
            const userClient = await createUserClient(
                await stateManager.accessToken.get(currentOrigin)
            )
            const [result, networksResult] = await Promise.all([
                userClient.request({ method: 'listIdps' }),
                userClient.request({ method: 'listNetworks' }),
            ])

            const found = result.idps.find((i: Idp) => i.id === idpId)
            if (!found) {
                handleErrorToast(
                    new Error(`Identity provider "${idpId}" not found`)
                )
                this.navigateBack()
                return
            }

            this.idp = found
            this.usedByNetworks = networksResult.networks
                .filter((network) => network.identityProviderId === idpId)
                .map((network) => network.name)
        } catch (error) {
            handleErrorToast(error)
            this.navigateBack()
        } finally {
            this.loading = false
        }
    }

    private navigateBack() {
        setLocationHref(toRelHref('/identity-providers'))
    }

    private async onSave(e: IdpFormSaveEvent) {
        try {
            const currentOrigin = await detectCurrentOrigin()
            const userClient = await createUserClient(
                await stateManager.accessToken.get(currentOrigin)
            )
            await userClient.request({
                method: 'addIdp',
                params: { idp: e.idp },
            })

            showToastAfterNavigation(
                'Identity provider updated',
                `Saved the identity provider "${e.idp.id}".`,
                'success'
            )
            setLocationHref(toRelPath('/identity-providers/'))
        } catch (error) {
            handleErrorToast(error)
        }
    }

    private async onDelete(e: IdpFormDeleteEvent) {
        if (!confirm(`Delete identity provider "${e.idp.id}"?`)) return

        try {
            const currentOrigin = await detectCurrentOrigin()
            const userClient = await createUserClient(
                await stateManager.accessToken.get(currentOrigin)
            )
            await userClient.request({
                method: 'removeIdp',
                params: { identityProviderId: e.idp.id },
            })

            showToastAfterNavigation(
                'Identity provider deleted',
                `Deleted the identity provider "${e.idp.id}".`,
                'success'
            )
            setLocationHref(toRelPath('/identity-providers/'))
        } catch (error) {
            handleErrorToast(error)
        }
    }

    private onCancel() {
        this.navigateBack()
    }

    protected render() {
        if (this.loading) {
            return html`<p class="mb-0 text-body-secondary">
                Loading identity provider...
            </p>`
        }

        if (!this.idp) {
            return nothing
        }

        return html`
            <wg-page-header
                heading="Edit identity provider"
                .info=${IDENTITY_PROVIDERS_INFO}
                .docsUrl=${IDENTITY_PROVIDERS_DOCS_URL}
            >
                <wg-back-link @click=${this.navigateBack}></wg-back-link>
            </wg-page-header>

            <div class="form-wrap">
                <idp-form
                    mode="review"
                    .idp=${this.idp}
                    .usedByNetworks=${this.usedByNetworks}
                    @idp-form-save=${this.onSave}
                    @idp-form-cancel=${this.onCancel}
                    @idp-form-delete=${this.onDelete}
                ></idp-form>
            </div>
        `
    }
}
