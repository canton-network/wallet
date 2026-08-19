// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import {
    WalletEditEvent,
    handleErrorToast,
    toRelPath,
} from '@canton-network/core-wallet-ui-components'
import { createUserClient } from '../../rpc-client'
import { setLocationHref } from '../../navigation.js'
import { stateManager } from '../../state-manager'
import '../../index'
import { WALLET_CREATION_STATUS_CODE } from '../index'
import {
    Wallet,
    WalletStatus,
} from '@canton-network/core-wallet-user-rpc-client'
import { detectCurrentOrigin } from '../../listeners.js'
import { UserUiAddOrEditParty } from '../common.js'

@customElement('user-ui-edit-party')
export class UserUiEditParty extends UserUiAddOrEditParty {
    @state() accessor userClient!: Awaited<ReturnType<typeof createUserClient>>
    @state() accessor wallet!: Wallet

    @state() accessor selectedSigningProvider = ''
    @state() accessor selectedPublicKey = ''

    protected pageTitle = 'Edit party'

    private get walletConstraint() {
        const searchParams = new URLSearchParams(window.location.search)
        const partyId = searchParams.get('partyId')
        const networkId = searchParams.get('networkId')
        const userId = searchParams.get('userId')
        if (!partyId || !networkId || !userId)
            throw new Error('wallet constraint params must be provided')
        return { partyId, networkId, userId }
    }

    private get loaded() {
        return Boolean(this.userClient)
    }

    override async connectedCallback() {
        super.connectedCallback()
        const currentOrigin = await detectCurrentOrigin()
        this.userClient = await createUserClient(
            await stateManager.accessToken.get(currentOrigin)
        )
        const result = await this.userClient.request({
            method: 'getWallet',
            params: this.walletConstraint,
        })
        if (!result) throw new Error('incorrect wallet constraint key passed')
        this.wallet = result
        this.selectedSigningProvider = this.wallet.signingProviderId
        this.selectedPublicKey = this.wallet.publicKey
    }

    private async onEditParty(event: WalletEditEvent) {
        if (!this.loaded) return
        this.submitting = true

        try {
            await this.userClient.request({
                method: 'changeSigningProvider',
                params: event,
            })

            const statusMap: Record<WalletStatus, WALLET_CREATION_STATUS_CODE> =
                {
                    allocated: WALLET_CREATION_STATUS_CODE.WALLET_ALLOCATED,
                    initialized: WALLET_CREATION_STATUS_CODE.WALLET_INITIALIZED,
                    removed: WALLET_CREATION_STATUS_CODE.WALLET_REMOVED,
                }

            const createPartyStatus = statusMap[this.wallet.status]

            setLocationHref(
                `${toRelPath('/parties/')}?createPartyStatus=${createPartyStatus}`
            )
        } catch (error) {
            this.submitting = false
            handleErrorToast(error)
        }
    }

    protected get form() {
        return html`
            <wg-wallet-edit-form
                .signingProviders=${this.signingProviders}
                .keySigningProviders=${UserUiAddOrEditParty.vaultSigningProviders}
                .publicKeys=${this.publicKeys}
                .selectedSigningProvider=${this.selectedSigningProvider}
                .partyId=${this.walletConstraint.partyId}
                ?publicKeysLoading=${this.publicKeysLoading}
                ?submitting=${this.submitting}
                @signing-provider-change=${this.onSigningProviderChange}
                @wallet-edit=${this.onEditParty}
            ></wg-wallet-edit-form>
        `
    }
}
