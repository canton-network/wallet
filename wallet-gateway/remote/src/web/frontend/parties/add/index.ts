// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit'
import { customElement } from 'lit/decorators.js'
import {
    WalletCreateEvent,
    handleErrorToast,
    toRelPath,
} from '@canton-network/core-wallet-ui-components'
import { createUserClient } from '../../rpc-client'
import { setLocationHref } from '../../navigation.js'
import { stateManager } from '../../state-manager'
import '../../index'
import { WALLET_CREATION_STATUS_CODE } from '../index'
import { WalletStatus } from '@canton-network/core-wallet-user-rpc-client'
import { detectCurrentOrigin } from '../../listeners.js'
import { UserUiAddOrEditParty } from '../common.js'

@customElement('user-ui-add-party')
export class UserUiAddParty extends UserUiAddOrEditParty {
    protected pageTitle = 'Create a new party'

    private async onCreateParty(event: WalletCreateEvent) {
        this.submitting = true

        try {
            const currentOrigin = await detectCurrentOrigin()
            const userClient = await createUserClient(
                await stateManager.accessToken.get(currentOrigin)
            )
            const result = await userClient.request({
                method: 'createWallet',
                params: {
                    primary: event.primary,
                    partyHint: event.partyHint,
                    signingProviderId: event.signingProviderId,
                    ...(event.vaultName && { vaultName: event.vaultName }),
                },
            })

            const statusMap: Record<WalletStatus, WALLET_CREATION_STATUS_CODE> =
                {
                    allocated: WALLET_CREATION_STATUS_CODE.WALLET_ALLOCATED,
                    initialized: WALLET_CREATION_STATUS_CODE.WALLET_INITIALIZED,
                    removed: WALLET_CREATION_STATUS_CODE.WALLET_REMOVED,
                }

            const createPartyStatus = statusMap[result.wallet.status]

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
            <wg-wallet-create-form
                .signingProviders=${this.signingProviders}
                .keySigningProviders=${UserUiAddOrEditParty.vaultSigningProviders}
                .publicKeys=${this.publicKeys}
                ?publicKeysLoading=${this.publicKeysLoading}
                ?submitting=${this.submitting}
                @signing-provider-change=${this.onSigningProviderChange}
                @wallet-create=${this.onCreateParty}
            ></wg-wallet-create-form>
        `
    }
}
