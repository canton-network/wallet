// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import {
    BaseElement,
    type NetworkEditSaveEvent,
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
import { NETWORKS_INFO, NETWORKS_DOCS_URL } from '../../constants'
import { showToastAfterNavigation } from '../../utils'

@customElement('user-ui-add-network')
export class UserUiAddNetwork extends BaseElement {
    @state() accessor loading = false
    @state() private accessor idps: Idp[] = []

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
        try {
            const currentOrigin = await detectCurrentOrigin()
            const userClient = await createUserClient(
                await stateManager.accessToken.get(currentOrigin)
            )
            this.idps = (await userClient.request({ method: 'listIdps' })).idps
        } catch (error) {
            handleErrorToast(error)
        }
    }

    private navigateBack() {
        setLocationHref(toRelHref('/networks'))
    }

    private async onSave(e: NetworkEditSaveEvent) {
        this.loading = true

        const { auth, adminAuth, serviceAccountAuth } = e.network

        try {
            const currentOrigin = await detectCurrentOrigin()
            const userClient = await createUserClient(
                await stateManager.accessToken.get(currentOrigin)
            )
            await userClient.request({
                method: 'addNetwork',
                params: {
                    network: {
                        id: e.network.id,
                        name: e.network.name,
                        description: e.network.description,
                        identityProviderId: e.network.identityProviderId,
                        ...(e.network.synchronizerId && {
                            synchronizerId: e.network.synchronizerId as string,
                        }),
                        ledgerApi: e.network.ledgerApi,
                        auth,
                        ...(adminAuth && { adminAuth }),
                        ...(serviceAccountAuth && { serviceAccountAuth }),
                    },
                },
            })

            showToastAfterNavigation(
                'Network added',
                `Added the network "${e.network.name}".`,
                'success'
            )
            setLocationHref(toRelPath('/networks/'))
        } catch (error) {
            this.loading = false
            handleErrorToast(error)
        }
    }

    protected render() {
        return html`
            <wg-page-header
                heading="Add network"
                .info=${NETWORKS_INFO}
                .docsUrl=${NETWORKS_DOCS_URL}
            >
                <wg-back-link @click=${this.navigateBack}></wg-back-link>
            </wg-page-header>

            <div class="form-wrap">
                <network-form
                    mode="add"
                    .idps=${this.idps}
                    @network-edit-save=${this.onSave}
                ></network-form>
            </div>
        `
    }
}
