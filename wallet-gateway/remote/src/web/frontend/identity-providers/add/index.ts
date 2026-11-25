// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    BaseElement,
    type IdpFormSaveEvent,
    handleErrorToast,
    toRelHref,
    toRelPath,
} from '@canton-network/core-wallet-ui-components'
import { css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'

import {
    CHANGE_STATUS_PARAM,
    IDENTITY_PROVIDERS_DOCS_URL,
    IDENTITY_PROVIDERS_INFO,
} from '../../constants.ts'
import { detectCurrentOrigin } from '../../listeners.ts'
import { setLocationHref } from '../../navigation.ts'
import { createUserClient } from '../../rpc-client.ts'
import '../../index.ts'
import { stateManager } from '../../state-manager.ts'

@customElement('user-ui-add-idp')
export class UserUiAddIdp extends BaseElement {
    @state() accessor loading = false

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

    private navigateBack() {
        setLocationHref(toRelHref('/identity-providers'))
    }

    private async onSave(e: IdpFormSaveEvent) {
        this.loading = true

        try {
            const currentOrigin = await detectCurrentOrigin()
            const userClient = await createUserClient(
                await stateManager.accessToken.get(currentOrigin)
            )
            await userClient.request({
                method: 'addIdp',
                params: { idp: e.idp },
            })

            setLocationHref(
                `${toRelPath('/identity-providers/')}?${CHANGE_STATUS_PARAM}=added`
            )
        } catch (error) {
            this.loading = false
            handleErrorToast(error)
        }
    }

    protected render() {
        return html`
            <wg-page-header
                heading="Add identity provider"
                .info=${IDENTITY_PROVIDERS_INFO}
                .docsUrl=${IDENTITY_PROVIDERS_DOCS_URL}
            >
                <wg-back-link @click=${this.navigateBack}></wg-back-link>
            </wg-page-header>

            <div class="form-wrap">
                <idp-form mode="add" @idp-form-save=${this.onSave}></idp-form>
            </div>
        `
    }
}
