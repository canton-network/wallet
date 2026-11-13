// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { SigningProvider } from '@canton-network/core-signing-lib'
import {
    type WalletCreateEvent,
    handleErrorToast,
    toRelPath,
} from '@canton-network/core-wallet-ui-components'
import {
    buildCreateWalletParams,
    PARTY_STATUS_PARAM,
    walletStatusToCode,
} from '@canton-network/core-wallet-ui-components/logic'
import { html } from 'lit'
import { customElement } from 'lit/decorators.js'

import { CREATE_PARTY_DOCS_URL } from '../../constants.ts'
import { detectCurrentOrigin } from '../../listeners.ts'
import { setLocationHref } from '../../navigation.ts'
import '../../index.ts'
import { createUserClient } from '../../rpc-client.ts'
import { stateManager } from '../../state-manager.ts'
import { UserUiAddOrEditParty } from '../common.ts'

@customElement('user-ui-add-party')
export class UserUiAddParty extends UserUiAddOrEditParty {
    protected pageTitle = 'Create a new party'
    protected pageInfo =
        'Creates a party on the current network. Its signing provider holds the key and signs for it.'
    protected docsUrl = CREATE_PARTY_DOCS_URL
    protected get showToast() {
        return this.selectedSigningProvider === SigningProvider.FIREBLOCKS
    }

    private async onCreateParty(event: WalletCreateEvent) {
        this.submitting = true

        try {
            const currentOrigin = await detectCurrentOrigin()
            const userClient = await createUserClient(
                await stateManager.accessToken.get(currentOrigin)
            )
            const result = await userClient.request({
                method: 'createWallet',
                params: buildCreateWalletParams(event),
            })

            setLocationHref(
                `${toRelPath('/parties/')}?${PARTY_STATUS_PARAM}=${walletStatusToCode(result.wallet.status)}`
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
                ?signingProvidersLoading=${this.signingProvidersLoading}
                .keySigningProviders=${[SigningProvider.FIREBLOCKS]}
                .selectedSigningProvider=${this.selectedSigningProvider}
                .publicKeys=${this.publicKeys}
                .submitLabel=${'Create party'}
                ?submitting=${this.submitting}
                ?publicKeysLoading=${this.publicKeysLoading}
                @wallet-create=${this.onCreateParty}
                @signing-provider-change=${this.onSigningProviderChange}
            ></wg-wallet-create-form>
        `
    }
}
