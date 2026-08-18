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
import { Env } from './env.js'
import type { SigningDrivers } from './signing/signing-drivers.js'

export function registerSigningProviders(
    signingStore: SigningStoreSql,
    logger: Logger
): SigningDrivers {
    const fireblocksApiKey = Env.FIREBLOCKS_API_KEY()
    const fireblocksApiSecret = Env.FIREBLOCKS_SECRET()
    const blockdaemonBaseUrl = Env.BLOCKDAEMON_API_URL(
        'http://localhost:5080/api/cwp/canton'
    )
    const blockdaemonApiKey = Env.BLOCKDAEMON_API_KEY('')
    const securosysKeyManagementApiKey =
        Env.SECUROSYS_TSB_KEY_MANAGEMENT_API_KEY()
    const securosysKeyOperationApiKey =
        Env.SECUROSYS_TSB_KEY_OPERATION_API_KEY()
    const securosysBearerToken = Env.SECUROSYS_TSB_BEARER_TOKEN()
    const securosysMtlsP12Path = Env.SECUROSYS_TSB_MTLS_P12_PATH()
    const securosysMtlsP12Password = Env.SECUROSYS_TSB_MTLS_P12_PASSWORD()
    const securosysKeyPassword = Env.SECUROSYS_TSB_KEY_PASSWORD()
    const securosysBaseUrl = Env.SECUROSYS_TSB_BASE_URL()
    const dfnsOrgId = Env.DFNS_ORG_ID()
    const dfnsCredId = Env.DFNS_CRED_ID()
    const dfnsPrivateKey = Env.DFNS_PRIVATE_KEY()
    const dfnsAuthToken = Env.DFNS_AUTH_TOKEN()

    const drivers: SigningDrivers = {}

    if (Env.PARTICIPANT_SIGNING_DISABLED()) {
        logger.info(
            'Participant signing provider is disabled by PARTICIPANT_SIGNING_DISABLED'
        )
    } else {
        drivers[SigningProvider.PARTICIPANT] = new ParticipantSigningDriver()
    }

    if (Env.WALLET_KERNEL_SIGNING_DISABLED()) {
        logger.info(
            'Wallet Kernel signing provider is disabled by WALLET_KERNEL_SIGNING_DISABLED'
        )
    } else {
        drivers[SigningProvider.WALLET_KERNEL] = new InternalSigningDriver(
            signingStore
        )
    }

    if (Env.FIREBLOCKS_SIGNING_DISABLED()) {
        logger.info(
            'Fireblocks signing provider is disabled by FIREBLOCKS_SIGNING_DISABLED'
        )
    } else if (fireblocksApiKey && fireblocksApiSecret) {
        const keyInfo = {
            apiKey: fireblocksApiKey,
            apiSecret: fireblocksApiSecret,
        }
        drivers[SigningProvider.FIREBLOCKS] = new FireblocksSigningProvider({
            defaultKeyInfo: keyInfo,
            userApiKeys: new Map([['user', keyInfo]]),
            apiPath: Env.FIREBLOCKS_API_PATH('https://api.fireblocks.io/v1'),
        })
    } else {
        logger.warn(
            'Fireblocks env vars not fully set. Fireblocks signing provider will be unavailable'
        )
    }

    if (Env.BLOCKDAEMON_SIGNING_DISABLED()) {
        logger.info(
            'Blockdaemon signing provider is disabled by BLOCKDAEMON_SIGNING_DISABLED'
        )
    } else if (blockdaemonBaseUrl && blockdaemonApiKey) {
        drivers[SigningProvider.BLOCKDAEMON] = new BlockdaemonSigningProvider({
            baseUrl: blockdaemonBaseUrl,
            apiKey: blockdaemonApiKey,
            caip2: Env.BLOCKDAEMON_CAIP2('canton:testnet') as CantonCaip2,
        })
    } else {
        logger.warn(
            'Blockdaemon env vars not fully set. Blockdaemon signing provider will be unavailable'
        )
    }

    if (Env.SECUROSYS_SIGNING_DISABLED()) {
        logger.info(
            'Securosys signing provider is disabled by SECUROSYS_SIGNING_DISABLED'
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
            signatureAlgorithm: Env.SECUROSYS_TSB_SIGNATURE_ALGORITHM(
                'EDDSA'
            ) as TsbSignatureAlgorithm,
        })
    } else {
        logger.warn(
            'Blockdaemon env vars not fully set. Securosys signing provider will be unavailable'
        )
    }

    if (Env.DFNS_SIGNING_DISABLED()) {
        logger.info(
            'Dfns signing provider is disabled by DFNS_SIGNING_DISABLED'
        )
    } else if (dfnsOrgId && dfnsCredId && dfnsPrivateKey && dfnsAuthToken) {
        drivers[SigningProvider.DFNS] = new DfnsSigningProvider({
            orgId: dfnsOrgId,
            baseUrl: Env.DFNS_BASE_URL('https://api.dfns.io'),
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
