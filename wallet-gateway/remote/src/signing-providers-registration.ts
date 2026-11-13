// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import BlockdaemonSigningProvider, {
    type CantonCaip2,
} from '@canton-network/core-signing-blockdaemon'
import BitGoSigningProvider from '@canton-network/core-signing-bitgo'
import DfnsSigningProvider from '@canton-network/core-signing-dfns'
import DsrvSigningProvider from '@canton-network/core-signing-dsrv'
import FireblocksSigningProvider from '@canton-network/core-signing-fireblocks'
import { InternalSigningDriver } from '@canton-network/core-signing-internal'
import { SigningProvider } from '@canton-network/core-signing-lib'
import { ParticipantSigningDriver } from '@canton-network/core-signing-participant'
import SecurosysSigningProvider, {
    type TsbSignatureAlgorithm,
} from '@canton-network/core-signing-securosys'
import type { StoreSql as SigningStoreSql } from '@canton-network/core-signing-store-sql'
import type { Logger } from 'pino'
import type { ServerNotices } from './notices/server-notices.js'
import type { SigningDrivers } from '@canton-network/core-wallet-services'
import {
    signingProvidersConfigSchema,
    type SigningProvidersConfig,
} from './config/Config.js'
import { Env } from './env.js'

const fireblocksSchema =
    signingProvidersConfigSchema.shape.fireblocks.unwrap().shape
const blockdaemonSchema =
    signingProvidersConfigSchema.shape.blockdaemon.unwrap().shape
const dfnsSchema = signingProvidersConfigSchema.shape.dfns.unwrap().shape
const securosysSchema =
    signingProvidersConfigSchema.shape.securosys.unwrap().shape
const bitgoSchema = signingProvidersConfigSchema.shape.bitgo.unwrap().shape
const dsrvSchema = signingProvidersConfigSchema.shape.dsrv.unwrap().shape

type ProviderSecrets = {
    fireblocksApiKey: string | undefined
    fireblocksApiSecret: string | undefined
    blockdaemonApiKey: string | undefined
    securosysKeyManagementApiKey: string | undefined
    securosysKeyOperationApiKey: string | undefined
    securosysBearerToken: string | undefined
    securosysMtlsP12Password: string | undefined
    securosysKeyPassword: string | undefined
    dfnsPrivateKey: string | undefined
    dfnsAuthToken: string | undefined
    bitgoAccessToken: string | undefined
    dsrvBearerToken: string | undefined
}

type ProviderSettings = {
    fireblocksApiPath: string
    blockdaemonBaseUrl: string
    blockdaemonCaip2: CantonCaip2
    dfnsOrgId: string | undefined
    dfnsBaseUrl: string
    dfnsCredId: string | undefined
    securosysBaseUrl: string | undefined
    securosysMtlsP12Path: string | undefined
    securosysSignatureAlgorithm: string
    bitgoBaseUrl: string
    bitgoEnterpriseId: string | undefined
    bitgoCoin: string | undefined
    dsrvBaseUrl: string | undefined
}

type ProviderSelection = {
    participant: boolean
    walletKernel: boolean
    fireblocks: boolean
    blockdaemon: boolean
    securosys: boolean
    dfns: boolean
    bitgo: boolean
    dsrv: boolean
}

type UnavailableProvider =
    | 'walletKernel'
    | 'fireblocks'
    | 'blockdaemon'
    | 'securosys'
    | 'dfns'
    | 'bitgo'
    | 'dsrv'

// Why an enabled provider is unavailable, depending on whether providers are
// configured in signingProviders (explicit) or not (legacy). Legacy mode
// enables every provider, so an unavailable provider there is usually just
// unused: it is logged, but only reported as a notice in explicit mode
const UNAVAILABLE_PROVIDER_MESSAGES: Record<
    UnavailableProvider,
    { explicit: string; legacy: string }
> = {
    walletKernel: {
        explicit:
            'The Wallet Kernel signing provider is unavailable because signingStore is not configured. Configure signingStore, or remove signingProviders.walletKernel.',
        legacy: 'The Wallet Kernel signing provider is not registered because signingStore is not configured.',
    },
    fireblocks: {
        explicit:
            'Fireblocks is unavailable because the environment variables named by signingProviders.fireblocks.apiKeyEnv and secretEnv are not set. Set them, or remove signingProviders.fireblocks.',
        legacy: 'Fireblocks is not registered because FIREBLOCKS_API_KEY and FIREBLOCKS_SECRET are not set.',
    },
    blockdaemon: {
        explicit:
            'Blockdaemon is unavailable because the environment variable named by signingProviders.blockdaemon.apiKeyEnv is not set. Set it, or remove signingProviders.blockdaemon.',
        legacy: 'Blockdaemon is not registered because BLOCKDAEMON_API_KEY is not set.',
    },
    securosys: {
        explicit:
            'Securosys is unavailable because signingProviders.securosys.baseUrl is not set. Set it, or remove signingProviders.securosys.',
        legacy: 'Securosys is not registered because SECUROSYS_TSB_BASE_URL is not set.',
    },
    dfns: {
        explicit:
            'Dfns is unavailable because the environment variables named by signingProviders.dfns.privateKeyEnv and authTokenEnv are not set. Set them, or remove signingProviders.dfns.',
        legacy: 'Dfns is not registered because DFNS_ORG_ID, DFNS_CRED_ID, DFNS_PRIVATE_KEY and DFNS_AUTH_TOKEN are not all set.',
    },
    bitgo: {
        explicit:
            'BitGo is unavailable because the environment variable named by signingProviders.bitgo.accessTokenEnv is not set. Set it, or remove signingProviders.bitgo.',
        legacy: 'BitGo is not registered because BITGO_ACCESS_TOKEN is not set.',
    },
    dsrv: {
        explicit:
            'DSRV is unavailable because signingProviders.dsrv.baseUrl is empty or the environment variable named by signingProviders.dsrv.bearerTokenEnv is not set. Set them, or remove signingProviders.dsrv.',
        legacy: 'DSRV is not registered because it is only configured through signingProviders.',
    },
}

function readLegacySecrets(): ProviderSecrets {
    return {
        fireblocksApiKey: Env.get(fireblocksSchema.apiKeyEnv.parse(undefined)),
        fireblocksApiSecret: Env.get(
            fireblocksSchema.secretEnv.parse(undefined)
        ),
        blockdaemonApiKey: Env.get(
            blockdaemonSchema.apiKeyEnv.parse(undefined)
        ),
        securosysKeyManagementApiKey: Env.get(
            securosysSchema.keyManagementApiKeyEnv.parse(undefined)
        ),
        securosysKeyOperationApiKey: Env.get(
            securosysSchema.keyOperationApiKeyEnv.parse(undefined)
        ),
        securosysBearerToken: Env.get(
            securosysSchema.bearerTokenEnv.parse(undefined)
        ),
        securosysMtlsP12Password: Env.get(
            securosysSchema.mtlsP12PasswordEnv.parse(undefined)
        ),
        securosysKeyPassword: Env.get(
            securosysSchema.keyPasswordEnv.parse(undefined)
        ),
        dfnsPrivateKey: Env.get(dfnsSchema.privateKeyEnv.parse(undefined)),
        dfnsAuthToken: Env.get(dfnsSchema.authTokenEnv.parse(undefined)),
        bitgoAccessToken: Env.get(bitgoSchema.accessTokenEnv.parse(undefined)),
        dsrvBearerToken: undefined,
    }
}

function readExplicitSecrets(
    signingProviders: SigningProvidersConfig
): ProviderSecrets {
    return {
        fireblocksApiKey: Env.get(
            fireblocksSchema.apiKeyEnv.parse(
                signingProviders.fireblocks?.apiKeyEnv
            )
        ),
        fireblocksApiSecret: Env.get(
            fireblocksSchema.secretEnv.parse(
                signingProviders.fireblocks?.secretEnv
            )
        ),
        blockdaemonApiKey: Env.get(
            blockdaemonSchema.apiKeyEnv.parse(
                signingProviders.blockdaemon?.apiKeyEnv
            )
        ),
        securosysKeyManagementApiKey: Env.get(
            securosysSchema.keyManagementApiKeyEnv.parse(
                signingProviders.securosys?.keyManagementApiKeyEnv
            )
        ),
        securosysKeyOperationApiKey: Env.get(
            securosysSchema.keyOperationApiKeyEnv.parse(
                signingProviders.securosys?.keyOperationApiKeyEnv
            )
        ),
        securosysBearerToken: Env.get(
            securosysSchema.bearerTokenEnv.parse(
                signingProviders.securosys?.bearerTokenEnv
            )
        ),
        securosysMtlsP12Password: Env.get(
            securosysSchema.mtlsP12PasswordEnv.parse(
                signingProviders.securosys?.mtlsP12PasswordEnv
            )
        ),
        securosysKeyPassword: Env.get(
            securosysSchema.keyPasswordEnv.parse(
                signingProviders.securosys?.keyPasswordEnv
            )
        ),
        dfnsPrivateKey: Env.get(
            dfnsSchema.privateKeyEnv.parse(signingProviders.dfns?.privateKeyEnv)
        ),
        dfnsAuthToken: Env.get(
            dfnsSchema.authTokenEnv.parse(signingProviders.dfns?.authTokenEnv)
        ),
        bitgoAccessToken: Env.get(
            bitgoSchema.accessTokenEnv.parse(
                signingProviders.bitgo?.accessTokenEnv
            )
        ),
        dsrvBearerToken: Env.get(
            dsrvSchema.bearerTokenEnv.parse(
                signingProviders.dsrv?.bearerTokenEnv
            )
        ),
    }
}

function legacySettings(): ProviderSettings {
    return {
        fireblocksApiPath: fireblocksSchema.apiPath.parse(
            Env.get('FIREBLOCKS_API_PATH')
        ),
        blockdaemonBaseUrl: blockdaemonSchema.baseUrl.parse(
            Env.get('BLOCKDAEMON_API_URL')
        ),
        blockdaemonCaip2: blockdaemonSchema.caip2.parse(
            Env.get('BLOCKDAEMON_CAIP2')
        ),
        dfnsOrgId: Env.get('DFNS_ORG_ID'),
        dfnsBaseUrl: dfnsSchema.baseUrl.parse(Env.get('DFNS_BASE_URL')),
        dfnsCredId: Env.get('DFNS_CRED_ID'),
        securosysBaseUrl: Env.get('SECUROSYS_TSB_BASE_URL'),
        securosysMtlsP12Path: Env.get('SECUROSYS_TSB_MTLS_P12_PATH'),
        securosysSignatureAlgorithm: securosysSchema.signatureAlgorithm.parse(
            Env.get('SECUROSYS_TSB_SIGNATURE_ALGORITHM')
        ),
        bitgoBaseUrl: bitgoSchema.baseUrl.parse(Env.get('BITGO_API_URL')),
        bitgoEnterpriseId: Env.get('BITGO_ENTERPRISE_ID'),
        bitgoCoin: Env.get('BITGO_COIN'),
        dsrvBaseUrl: undefined,
    }
}

function explicitSettings(
    signingProviders: SigningProvidersConfig
): ProviderSettings {
    return {
        fireblocksApiPath: fireblocksSchema.apiPath.parse(
            signingProviders.fireblocks?.apiPath
        ),
        blockdaemonBaseUrl: blockdaemonSchema.baseUrl.parse(
            signingProviders.blockdaemon?.baseUrl
        ),
        blockdaemonCaip2: blockdaemonSchema.caip2.parse(
            signingProviders.blockdaemon?.caip2
        ),
        dfnsOrgId: signingProviders.dfns?.orgId,
        dfnsBaseUrl: dfnsSchema.baseUrl.parse(signingProviders.dfns?.baseUrl),
        dfnsCredId: signingProviders.dfns?.credId,
        securosysBaseUrl: signingProviders.securosys?.baseUrl,
        securosysMtlsP12Path: signingProviders.securosys?.mtlsP12Path,
        securosysSignatureAlgorithm: securosysSchema.signatureAlgorithm.parse(
            signingProviders.securosys?.signatureAlgorithm
        ),
        bitgoBaseUrl: bitgoSchema.baseUrl.parse(
            signingProviders.bitgo?.baseUrl
        ),
        bitgoEnterpriseId: signingProviders.bitgo?.enterpriseId,
        bitgoCoin: signingProviders.bitgo?.coin,
        dsrvBaseUrl: signingProviders.dsrv?.baseUrl,
    }
}

function buildDrivers(
    selected: ProviderSelection,
    settings: ProviderSettings,
    secrets: ProviderSecrets,
    signingStore: SigningStoreSql | undefined,
    notices: ServerNotices,
    logger: Logger,
    explicit: boolean
): SigningDrivers {
    const drivers: SigningDrivers = {}

    const reportUnavailable = (provider: UnavailableProvider) => {
        const messages = UNAVAILABLE_PROVIDER_MESSAGES[provider]
        if (explicit) {
            notices.report({
                id: `signing-provider-unavailable:${provider}`,
                severity: 'warning',
                message: messages.explicit,
            })
        } else {
            logger.info(messages.legacy)
        }
    }

    if (selected.participant) {
        drivers[SigningProvider.PARTICIPANT] = new ParticipantSigningDriver()
    }

    if (selected.walletKernel) {
        if (!signingStore) {
            reportUnavailable('walletKernel')
        } else {
            drivers[SigningProvider.WALLET_KERNEL] = new InternalSigningDriver(
                signingStore
            )
        }
    }

    if (selected.fireblocks) {
        if (secrets.fireblocksApiKey && secrets.fireblocksApiSecret) {
            const keyInfo = {
                apiKey: secrets.fireblocksApiKey,
                apiSecret: secrets.fireblocksApiSecret,
            }
            drivers[SigningProvider.FIREBLOCKS] = new FireblocksSigningProvider(
                {
                    defaultKeyInfo: keyInfo,
                    userApiKeys: new Map([['user', keyInfo]]),
                    apiPath: settings.fireblocksApiPath,
                }
            )
        } else {
            reportUnavailable('fireblocks')
        }
    }

    if (selected.blockdaemon) {
        if (secrets.blockdaemonApiKey) {
            drivers[SigningProvider.BLOCKDAEMON] =
                new BlockdaemonSigningProvider({
                    baseUrl: settings.blockdaemonBaseUrl,
                    apiKey: secrets.blockdaemonApiKey,
                    caip2: settings.blockdaemonCaip2,
                })
        } else {
            reportUnavailable('blockdaemon')
        }
    }

    if (selected.securosys) {
        if (settings.securosysBaseUrl) {
            drivers[SigningProvider.SECUROSYS] = new SecurosysSigningProvider({
                baseUrl: settings.securosysBaseUrl,
                ...(secrets.securosysKeyManagementApiKey && {
                    keyManagementApiKey: secrets.securosysKeyManagementApiKey,
                }),
                ...(secrets.securosysKeyOperationApiKey && {
                    keyOperationApiKey: secrets.securosysKeyOperationApiKey,
                }),
                ...(secrets.securosysBearerToken && {
                    bearerToken: secrets.securosysBearerToken,
                }),
                ...(settings.securosysMtlsP12Path && {
                    mtlsP12Path: settings.securosysMtlsP12Path,
                }),
                ...(secrets.securosysMtlsP12Password && {
                    mtlsP12Password: secrets.securosysMtlsP12Password,
                }),
                ...(secrets.securosysKeyPassword && {
                    keyPassword: secrets.securosysKeyPassword,
                }),
                signatureAlgorithm:
                    settings.securosysSignatureAlgorithm as TsbSignatureAlgorithm,
            })
        } else {
            reportUnavailable('securosys')
        }
    }

    if (selected.dfns) {
        if (
            settings.dfnsOrgId &&
            settings.dfnsCredId &&
            secrets.dfnsPrivateKey &&
            secrets.dfnsAuthToken
        ) {
            drivers[SigningProvider.DFNS] = new DfnsSigningProvider({
                orgId: settings.dfnsOrgId,
                baseUrl: settings.dfnsBaseUrl,
                credentials: {
                    credId: settings.dfnsCredId,
                    privateKey: secrets.dfnsPrivateKey,
                    authToken: secrets.dfnsAuthToken,
                },
            })
        } else {
            reportUnavailable('dfns')
        }
    }

    if (selected.bitgo) {
        if (secrets.bitgoAccessToken) {
            if (!settings.bitgoEnterpriseId) {
                notices.report({
                    id: 'signing-provider-config:bitgo.enterpriseId',
                    severity: 'warning',
                    message: explicit
                        ? 'BitGo wallet creation will fail and restart-safe transaction lookup is unavailable because signingProviders.bitgo.enterpriseId is not set. Set it to your BitGo enterprise ID.'
                        : 'BitGo wallet creation will fail and restart-safe transaction lookup is unavailable because BITGO_ENTERPRISE_ID is not set. Set it to your BitGo enterprise ID.',
                })
            }
            drivers[SigningProvider.BITGO] = new BitGoSigningProvider({
                accessToken: secrets.bitgoAccessToken,
                baseUrl: settings.bitgoBaseUrl,
                enterpriseId: settings.bitgoEnterpriseId,
                coin: settings.bitgoCoin,
            })
        } else {
            reportUnavailable('bitgo')
        }
    }

    if (selected.dsrv) {
        if (settings.dsrvBaseUrl && secrets.dsrvBearerToken) {
            drivers[SigningProvider.DSRV] = new DsrvSigningProvider({
                baseUrl: settings.dsrvBaseUrl,
                bearerToken: secrets.dsrvBearerToken,
            })
        } else {
            reportUnavailable('dsrv')
        }
    }

    return drivers
}

export function registerSigningProviders(
    signingProviders: SigningProvidersConfig | undefined,
    signingStore: SigningStoreSql | undefined,
    logger: Logger,
    notices: ServerNotices
): SigningDrivers {
    const secrets =
        signingProviders === undefined
            ? readLegacySecrets()
            : readExplicitSecrets(signingProviders)

    if (signingProviders === undefined) {
        notices.report({
            id: 'signing-providers-legacy-mode',
            severity: 'warning',
            message:
                'The config file has no signingProviders section, so signing providers are discovered from environment variables and the participant signing provider is always enabled. This legacy mode is deprecated and will be removed. Add a signingProviders section to choose the signing providers explicitly.',
        })
        return buildDrivers(
            {
                participant: true,
                walletKernel: true,
                fireblocks: true,
                blockdaemon: true,
                securosys: true,
                dfns: true,
                bitgo: true,
                // Not discovered from the environment, needs signingProviders.dsrv
                dsrv: false,
            },
            legacySettings(),
            secrets,
            signingStore,
            notices,
            logger,
            false
        )
    }

    const drivers = buildDrivers(
        {
            participant: signingProviders.participant !== undefined,
            walletKernel: signingProviders.walletKernel !== undefined,
            fireblocks: signingProviders.fireblocks !== undefined,
            blockdaemon: signingProviders.blockdaemon !== undefined,
            securosys: signingProviders.securosys !== undefined,
            dfns: signingProviders.dfns !== undefined,
            bitgo: signingProviders.bitgo !== undefined,
            dsrv: signingProviders.dsrv !== undefined,
        },
        explicitSettings(signingProviders),
        secrets,
        signingStore,
        notices,
        logger,
        true
    )

    // Legacy mode always registers the participant provider, so only an
    // explicit configuration can end up without any provider
    if (Object.keys(drivers).length === 0) {
        notices.report({
            id: 'signing-providers-none',
            severity: 'warning',
            message:
                'No signing provider is available, so no wallets can be created or used. Add at least one provider to signingProviders and make sure its settings are complete.',
        })
    }

    return drivers
}
