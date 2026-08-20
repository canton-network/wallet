// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import BlockdaemonSigningProvider, {
    CantonCaip2,
} from '@canton-network/core-signing-blockdaemon'
import DfnsSigningProvider from '@canton-network/core-signing-dfns'
import FireblocksSigningProvider from '@canton-network/core-signing-fireblocks'
import { InternalSigningDriver } from '@canton-network/core-signing-internal'
import { SigningProvider } from '@canton-network/core-signing-lib'
import { ParticipantSigningDriver } from '@canton-network/core-signing-participant'
import SecurosysSigningProvider, {
    type TsbSignatureAlgorithm,
} from '@canton-network/core-signing-securosys'
import { StoreSql as SigningStoreSql } from '@canton-network/core-signing-store-sql'
import { Logger } from 'pino'
import type { SigningProvidersConfig } from './config/Config.js'
import { Env } from './env.js'
import type { SigningDrivers } from './signing/signing-drivers.js'

export function registerSigningProviders(
    signingProviders: SigningProvidersConfig,
    signingStore: SigningStoreSql | undefined,
    logger: Logger
): SigningDrivers {
    // Sensitive settings, env vars only
    const fireblocksApiKey = Env.FIREBLOCKS_API_KEY()
    const fireblocksApiSecret = Env.FIREBLOCKS_SECRET()

    const blockdaemonApiKey = Env.BLOCKDAEMON_API_KEY('') // TODO can I get rid of that fallback?

    const securosysKeyManagementApiKey =
        Env.SECUROSYS_TSB_KEY_MANAGEMENT_API_KEY()
    const securosysKeyOperationApiKey =
        Env.SECUROSYS_TSB_KEY_OPERATION_API_KEY()
    const securosysBearerToken = Env.SECUROSYS_TSB_BEARER_TOKEN()
    const securosysMtlsP12Password = Env.SECUROSYS_TSB_MTLS_P12_PASSWORD()
    const securosysKeyPassword = Env.SECUROSYS_TSB_KEY_PASSWORD()

    const dfnsPrivateKey = Env.DFNS_PRIVATE_KEY()
    const dfnsAuthToken = Env.DFNS_AUTH_TOKEN()

    // Non-sensitive settings, config first, env var if unset, sometimes fallback. If env var is set, show deprecation warning.
    const fireblocksApiPath =
        signingProviders.fireblocks.apiPath ??
        Env.FIREBLOCKS_API_PATH() ??
        'https://api.fireblocks.io/v1'
    if (Env.FIREBLOCKS_API_PATH() !== undefined) {
        logger.warn(
            'FIREBLOCKS_API_PATH is deprecated. Configure signingProviders.fireblocks.apiPath instead'
        )
    }

    const blockdaemonBaseUrl =
        signingProviders.blockdaemon.baseUrl ??
        Env.BLOCKDAEMON_API_URL() ??
        'http://localhost:5080/api/cwp/canton'
    if (Env.BLOCKDAEMON_API_URL() !== undefined) {
        logger.warn(
            'BLOCKDAEMON_API_URL is deprecated. Configure signingProviders.blockdaemon.baseUrl instead'
        )
    }

    const blockdaemonCaip2 =
        signingProviders.blockdaemon.caip2 ??
        Env.BLOCKDAEMON_CAIP2() ??
        'canton:testnet'
    if (Env.BLOCKDAEMON_CAIP2() !== undefined) {
        logger.warn(
            'BLOCKDAEMON_CAIP2 is deprecated. Configure signingProviders.blockdaemon.caip2 instead'
        )
    }

    const dfnsOrgId = signingProviders.dfns.orgId ?? Env.DFNS_ORG_ID()
    if (Env.DFNS_ORG_ID() !== undefined) {
        logger.warn(
            'DFNS_ORG_ID is deprecated. Configure signingProviders.dfns.orgId instead'
        )
    }

    const dfnsBaseUrl =
        signingProviders.dfns.baseUrl ??
        Env.DFNS_BASE_URL() ??
        'https://api.dfns.io'
    if (Env.DFNS_BASE_URL() !== undefined) {
        logger.warn(
            'DFNS_BASE_URL is deprecated. Configure signingProviders.dfns.baseUrl instead'
        )
    }

    const dfnsCredId = signingProviders.dfns.credId ?? Env.DFNS_CRED_ID()
    if (Env.DFNS_CRED_ID() !== undefined) {
        logger.warn(
            'DFNS_CRED_ID is deprecated. Configure signingProviders.dfns.credId instead'
        )
    }

    const securosysBaseUrl =
        signingProviders.securosys.baseUrl ?? Env.SECUROSYS_TSB_BASE_URL()
    if (Env.SECUROSYS_TSB_BASE_URL() !== undefined) {
        logger.warn(
            'SECUROSYS_TSB_BASE_URL is deprecated. Configure signingProviders.securosys.baseUrl instead'
        )
    }
    const securosysMtlsP12Path =
        signingProviders.securosys.mtlsP12Path ??
        Env.SECUROSYS_TSB_MTLS_P12_PATH()
    if (Env.SECUROSYS_TSB_MTLS_P12_PATH() !== undefined) {
        logger.warn(
            'SECUROSYS_TSB_MTLS_P12_PATH is deprecated. Configure signingProviders.securosys.mtlsP12Path instead'
        )
    }
    const securosysSignatureAlgorithm =
        signingProviders.securosys.signatureAlgorithm ??
        Env.SECUROSYS_TSB_SIGNATURE_ALGORITHM() ??
        'EDDSA'
    if (Env.SECUROSYS_TSB_SIGNATURE_ALGORITHM() !== undefined) {
        logger.warn(
            'SECUROSYS_TSB_SIGNATURE_ALGORITHM is deprecated. Configure signingProviders.securosys.signatureAlgorithm instead'
        )
    }

    // Signing drivers registration. Conditional depending on all required variables/configs being set and `enable` config property not being false (opt-out)
    const drivers: SigningDrivers = {}

    if (signingProviders.participant.enable === false) {
        logger.info(
            'Participant signing provider is disabled by signingProviders.participant.enable'
        )
    } else {
        drivers[SigningProvider.PARTICIPANT] = new ParticipantSigningDriver()
    }

    if (signingProviders.walletKernel.enable === false) {
        logger.info(
            'Wallet Kernel signing provider is disabled by signingProviders.walletKernel.enable'
        )
    } else if (!signingStore) {
        logger.info(
            'Wallet Kernel signing provider is unavailable because signingStore is not configured'
        )
    } else {
        drivers[SigningProvider.WALLET_KERNEL] = new InternalSigningDriver(
            signingStore
        )
    }

    if (signingProviders.fireblocks.enable === false) {
        logger.info(
            'Fireblocks signing provider is disabled by signingProviders.fireblocks.enable'
        )
    } else if (fireblocksApiKey && fireblocksApiSecret) {
        const keyInfo = {
            apiKey: fireblocksApiKey,
            apiSecret: fireblocksApiSecret,
        }
        drivers[SigningProvider.FIREBLOCKS] = new FireblocksSigningProvider({
            defaultKeyInfo: keyInfo,
            userApiKeys: new Map([['user', keyInfo]]),
            apiPath: fireblocksApiPath,
        })
    } else {
        logger.warn(
            'Fireblocks env vars not fully set. Fireblocks signing provider will be unavailable'
        )
    }

    if (signingProviders.blockdaemon.enable === false) {
        logger.info(
            'Blockdaemon signing provider is disabled by signingProviders.blockdaemon.enable'
        )
    } else if (blockdaemonBaseUrl && blockdaemonApiKey) {
        drivers[SigningProvider.BLOCKDAEMON] = new BlockdaemonSigningProvider({
            baseUrl: blockdaemonBaseUrl,
            apiKey: blockdaemonApiKey,
            caip2: blockdaemonCaip2 as CantonCaip2,
        })
    } else {
        logger.warn(
            'Blockdaemon env vars not fully set. Blockdaemon signing provider will be unavailable'
        )
    }

    if (signingProviders.securosys.enable === false) {
        logger.info(
            'Securosys signing provider is disabled by signingProviders.securosys.enable'
        )
    } else if (
        securosysBaseUrl &&
        securosysKeyManagementApiKey &&
        securosysKeyOperationApiKey
    ) {
        drivers[SigningProvider.SECUROSYS] = new SecurosysSigningProvider({
            baseUrl: securosysBaseUrl,
            ...(securosysKeyManagementApiKey && {
                keyManagementApiKey: securosysKeyManagementApiKey,
            }),
            ...(securosysKeyOperationApiKey && {
                keyOperationApiKey: securosysKeyOperationApiKey,
            }),
            ...(securosysBearerToken && { bearerToken: securosysBearerToken }),
            ...(securosysMtlsP12Path && { mtlsP12Path: securosysMtlsP12Path }),
            ...(securosysMtlsP12Password && {
                mtlsP12Password: securosysMtlsP12Password,
            }),
            ...(securosysKeyPassword && { keyPassword: securosysKeyPassword }),
            signatureAlgorithm:
                securosysSignatureAlgorithm as TsbSignatureAlgorithm,
        })
    } else {
        logger.warn(
            'Securosys env vars not fully set. Securosys signing provider will be unavailable'
        )
    }

    if (signingProviders.dfns.enable === false) {
        logger.info(
            'Dfns signing provider is disabled by signingProviders.dfns.enable'
        )
    } else if (dfnsOrgId && dfnsCredId && dfnsPrivateKey && dfnsAuthToken) {
        drivers[SigningProvider.DFNS] = new DfnsSigningProvider({
            orgId: dfnsOrgId,
            baseUrl: dfnsBaseUrl,
            credentials: {
                credId: dfnsCredId,
                privateKey: dfnsPrivateKey,
                authToken: dfnsAuthToken,
            },
        })
    } else {
        logger.warn(
            'Dfns env vars not fully set. Dfns signing provider will be unavailable'
        )
    }

    return drivers
}
