// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { TokenProviderConfig } from '@canton-network/core-wallet-auth'
import { localNetDefaultAuth, localNetStaticConfig } from '../config.js'
import { SDK } from './sdk.js'
import { AllowedLogAdapters } from './logger/types.js'
import {
    ExtendedSDKOptions,
    GetExtendedKeys,
    SDKInterface,
} from './init/types/sdk.js'

export type LocalNetParticipant = 'app-user' | 'app-provider' | 'sv'

const LOCALNET_LEDGER_URLS: Record<LocalNetParticipant, URL> = {
    'app-user': localNetStaticConfig.LOCALNET_APP_USER_LEDGER_URL,
    'app-provider': localNetStaticConfig.LOCALNET_APP_PROVIDER_LEDGER_URL,
    sv: localNetStaticConfig.LOCALNET_SV_LEDGER_URL,
}

export interface LocalNetSdkOptions {
    auth?: TokenProviderConfig
    logAdapter?: AllowedLogAdapters
}

function createLocalNetSdk<Ext extends Partial<ExtendedSDKOptions>>(
    participant: LocalNetParticipant,
    extensions: Ext,
    options?: LocalNetSdkOptions
): Promise<SDKInterface<GetExtendedKeys<Ext>>> {
    return SDK.create({
        auth: options?.auth ?? localNetDefaultAuth,
        ledgerClientUrl: LOCALNET_LEDGER_URLS[participant],
        ...(options?.logAdapter !== undefined && {
            logAdapter: options.logAdapter,
        }),
        ...extensions,
    }) as unknown as Promise<SDKInterface<GetExtendedKeys<Ext>>>
}

/**
 * Creates SDKs for all three LocalNet participants (app-user, app-provider, sv)
 * in parallel, filling in each participant's ledger URL and the LocalNet default
 * auth so callers only supply the namespace extensions they need per participant.
 *
 * @example
 * const { appUser, appProvider, sv } = await createLocalNetSdks({
 *     appUser: { amulet: amuletConfig, token: tokenConfig },
 *     appProvider: { token: tokenConfig },
 *     sv: { token: tokenConfig },
 * })
 *
 * @param participants - Namespace extensions (`amulet`, `token`, `asset`,
 *   `events`) for each participant; each returned SDK is typed with exactly the
 *   namespaces provided for it.
 * @param options - Optional shared overrides for `auth` (defaults to the LocalNet
 *   self-signed auth) and the log adapter.
 */
export async function createLocalNetSdks<
    AppUser extends Partial<ExtendedSDKOptions> = Record<string, never>,
    AppProvider extends Partial<ExtendedSDKOptions> = Record<string, never>,
    Sv extends Partial<ExtendedSDKOptions> = Record<string, never>,
>(
    participants: {
        appUser?: AppUser
        appProvider?: AppProvider
        sv?: Sv
    } = {},
    options?: LocalNetSdkOptions
): Promise<{
    appUser: SDKInterface<GetExtendedKeys<AppUser>>
    appProvider: SDKInterface<GetExtendedKeys<AppProvider>>
    sv: SDKInterface<GetExtendedKeys<Sv>>
}> {
    const [appUser, appProvider, sv] = await Promise.all([
        createLocalNetSdk(
            'app-user',
            participants.appUser ?? ({} as AppUser),
            options
        ),
        createLocalNetSdk(
            'app-provider',
            participants.appProvider ?? ({} as AppProvider),
            options
        ),
        createLocalNetSdk('sv', participants.sv ?? ({} as Sv), options),
    ])
    return { appUser, appProvider, sv }
}
