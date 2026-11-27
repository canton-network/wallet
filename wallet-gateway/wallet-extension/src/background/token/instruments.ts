// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    type OffLedger,
    TokenStandardClient,
} from '@canton-network/core-token-standard'
import type { AccessTokenProvider } from '@canton-network/core-wallet-auth'
import type { RegistryInstrument } from '@canton-network/core-wallet-ui-components/react/token'
import { resolveCapabilities } from '@canton-network/wallet-sdk'

import { logger } from '@/shared/logger.ts'

type Instrument = OffLedger.MetadataV1.components['schemas']['Instrument']

const log = logger.getChild('registry')

// The client logs pino-style: fields first, then the message.
const clientLogger = {
    debug: (...args: unknown[]) => log.debug(String(args.at(-1))),
    info: (...args: unknown[]) => log.info(String(args.at(-1))),
    warn: (...args: unknown[]) => log.warn(String(args.at(-1))),
    error: (...args: unknown[]) => log.error(String(args.at(-1))),
}

// Registries are public, so the user's ledger token isn't sent to them.
const noAuth: AccessTokenProvider = {
    getAccessToken: async () => '',
    getAuthContext: async () => ({ accessToken: '', userId: '' }),
}

/** Every instrument a registry lists, across all pages. */
export async function registryInstruments(
    registryUrl: string
): Promise<RegistryInstrument[]> {
    const client = new TokenStandardClient(registryUrl, clientLogger, noAuth)
    const { adminId } = await client.get('/registry/metadata/v1/info')
    const instruments: Instrument[] = []
    let page = await client.get('/registry/metadata/v1/instruments')
    instruments.push(...page.instruments)
    while (page.nextPageToken) {
        page = await client.get('/registry/metadata/v1/instruments', {
            query: { pageToken: page.nextPageToken },
        })
        instruments.push(...page.instruments)
    }
    return instruments.map((instrument) => ({
        id: instrument.id,
        admin: adminId,
        registryUrl: new URL(registryUrl).href,
        displayName: instrument.name,
        name: instrument.name,
        symbol: instrument.symbol,
        decimals: instrument.decimals,
        capabilities: resolveCapabilities({
            supportedApis: instrument.supportedApis,
        }),
    }))
}
