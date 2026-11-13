// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css, html, nothing } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import {
    BaseElement,
    type NetworkEditSaveEvent,
    type NetworkDeleteEvent,
    handleErrorToast,
    toRelHref,
    toRelPath,
} from '@canton-network/core-wallet-ui-components'
import type { Idp, Network } from '@canton-network/core-wallet-user-rpc-client'
import { createUserClient } from '../../rpc-client'
import { setLocationHref } from '../../navigation.js'
import { stateManager } from '../../state-manager'
import '../../index'
import { detectCurrentOrigin } from '../../listeners.js'
import { NETWORKS_INFO, NETWORKS_DOCS_URL } from '../../constants'
import { showToastAfterNavigation } from '../../utils'

@customElement('user-ui-review-network')
export class UserUiReviewNetwork extends BaseElement {
    @state() accessor network: Network | null = null
    @state() accessor loading = true
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
        await this.loadNetwork()
    }

    private async loadNetwork() {
        const params = new URLSearchParams(window.location.search)
        const networkId = params.get('id')

        if (!networkId) {
            this.navigateBack()
            return
        }

        try {
            const currentOrigin = await detectCurrentOrigin()
            const userClient = await createUserClient(
                await stateManager.accessToken.get(currentOrigin)
            )
            const [result, idpsResult] = await Promise.all([
                userClient.request({
                    method: 'getNetwork',
                    params: { networkId },
                }),
                userClient.request({ method: 'listIdps' }),
            ])
            this.network = result.network
            this.idps = idpsResult.idps
        } catch (error) {
            handleErrorToast(error)
            this.navigateBack()
        } finally {
            this.loading = false
        }
    }

    private navigateBack() {
        setLocationHref(toRelHref('/networks'))
    }

    private async onSave(e: NetworkEditSaveEvent) {
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
                'Network updated',
                `Saved the network "${e.network.name}".`,
                'success'
            )
            setLocationHref(toRelPath('/networks/'))
        } catch (error) {
            handleErrorToast(error)
        }
    }

    private async onDelete(e: NetworkDeleteEvent) {
        // The form already made the user type the network ID to confirm
        try {
            const currentOrigin = await detectCurrentOrigin()
            const userClient = await createUserClient(
                await stateManager.accessToken.get(currentOrigin)
            )
            await userClient.request({
                method: 'removeNetwork',
                params: { networkName: e.network.id },
            })

            showToastAfterNavigation(
                'Network deleted',
                `Deleted the network "${e.network.name}".`,
                'success'
            )
            setLocationHref(toRelPath('/networks/'))
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
                Loading network...
            </p>`
        }

        if (!this.network) {
            return nothing
        }

        return html`
            <wg-page-header
                heading="Edit network"
                .info=${NETWORKS_INFO}
                .docsUrl=${NETWORKS_DOCS_URL}
            >
                <wg-back-link @click=${this.navigateBack}></wg-back-link>
            </wg-page-header>

            <div class="form-wrap">
                <network-form
                    mode="review"
                    .network=${this.network}
                    .idps=${this.idps}
                    @network-edit-save=${this.onSave}
                    @network-edit-cancel=${this.onCancel}
                    @network-delete=${this.onDelete}
                ></network-form>
            </div>
        `
    }
}
