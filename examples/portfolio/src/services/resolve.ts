// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { type Logger } from 'pino'
import { LedgerClient } from '@canton-network/core-ledger-client'
import { TokenStandardService } from '@canton-network/core-token-standard-service'
import { AmuletService } from '@canton-network/core-amulet-service'
import { ScanProxyClient } from '@canton-network/core-splice-client'
import type { LedgerProvider } from '@canton-network/core-provider-ledger'
import * as sdk from '@canton-network/dapp-sdk'
import {
    AuthTokenProvider,
    type AccessTokenProvider,
} from '@canton-network/core-wallet-auth'
import { logger } from '@lib/logger'

// This module allows us to resolve (i.e. get an instance of) the different
// dependency services used throughout the project.

export const resolveLedgerProvider = () => {
    const provider = sdk.getConnectedProvider()
    if (provider) {
        return provider as unknown as LedgerProvider
    } else {
        throw new Error('Dapp Provider is not available')
    }
}

const createTokenStandardService = async ({
    logger,
}: {
    logger: Logger
}): Promise<TokenStandardService> => {
    const provider = resolveLedgerProvider()

    const tokenStandardService = new TokenStandardService(
        provider,
        logger,
        noAuthAccessTokenProvider,
        false // isMasterUser
    )
    return tokenStandardService
}

const resolveValidatorUrl = (validatorUrl: string): URL => {
    const url = new URL(validatorUrl)

    if (url.protocol === 'http:') {
        logger.warn(
            { validatorUrl: url.toString() },
            'Using a non-TLS validator endpoint. This is acceptable only in trusted environments. Set validatorUrl in portfolio config to an HTTPS endpoint if the validator API is reachable over an untrusted network.'
        )
    }

    return url
}

const createAmuletService = async ({
    sessionToken,
    validatorUrl,
    tokenStandardService,
}: {
    sessionToken: string
    validatorUrl: string
    tokenStandardService: TokenStandardService
}): Promise<AmuletService> => {
    const scanProxyClient = new ScanProxyClient(
        resolveValidatorUrl(validatorUrl),
        logger,
        AuthTokenProvider.fromToken(sessionToken, logger)
    )
    return new AmuletService(tokenStandardService, scanProxyClient, undefined)
}

// Global, but so is the dApp SDK.
const ledgerClient: { singleton: LedgerClient | undefined } = {
    singleton: undefined,
}
const tokenStandardService: { singleton: TokenStandardService | undefined } = {
    singleton: undefined,
}
const amuletServices = new Map<string, AmuletService>()

// Can be called to reset clients on disconnects.
export const clear = () => {
    ledgerClient.singleton = undefined
    tokenStandardService.singleton = undefined
    amuletServices.clear()
}

export const resolveTokenStandardService =
    async (): Promise<TokenStandardService> => {
        if (!tokenStandardService.singleton) {
            tokenStandardService.singleton = await createTokenStandardService({
                logger,
            })
        }
        return tokenStandardService.singleton
    }

export const resolveAmuletService = async ({
    sessionToken,
    validatorUrl,
}: {
    sessionToken: string
    validatorUrl: string
}): Promise<AmuletService> => {
    const key = `${validatorUrl}:current-session`
    if (amuletServices.has(key)) return amuletServices.get(key)!
    const tokenStandardService = await resolveTokenStandardService()
    const amuletService = await createAmuletService({
        sessionToken,
        validatorUrl,
        tokenStandardService,
    })
    amuletServices.set(key, amuletService)
    return amuletService
}

const noAuthAccessTokenProvider: AccessTokenProvider = {
    async getAccessToken() {
        return ''
    },
    async getAuthContext() {
        return {
            accessToken: '',
            userId: '',
        }
    },
}
