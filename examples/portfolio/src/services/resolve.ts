// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { type Logger } from 'pino'
import { LedgerClient } from '@canton-network/core-ledger-client'
import { TokenStandardService } from '@canton-network/core-token-standard-service'
import type { LedgerProvider } from '@canton-network/core-provider-ledger'
import * as sdk from '@canton-network/dapp-sdk'
import { type AccessTokenProvider } from '@canton-network/core-wallet-auth'
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

// Global, but so is the dApp SDK.
const ledgerClient: { singleton: LedgerClient | undefined } = {
    singleton: undefined,
}
const tokenStandardService: { singleton: TokenStandardService | undefined } = {
    singleton: undefined,
}
// Can be called to reset clients on disconnects.
export const clear = () => {
    ledgerClient.singleton = undefined
    tokenStandardService.singleton = undefined
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
