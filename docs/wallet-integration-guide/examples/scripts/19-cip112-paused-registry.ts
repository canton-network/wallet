/**
 * CIP-0112 paused-instrument guard against the example test-token registry.
 *
 * Requires: localnet + `yarn workspace @canton-network/example-test-token-v1-registry dev`
 * (http://localhost:5634). Skips cleanly when the registry is unreachable so
 * `yarn script:test:examples` stays green without the registry process.
 */
import { localNetStaticConfig, SDK } from '@canton-network/wallet-sdk'
import { pino } from 'pino'
import {
    AMULET_NAMESPACE_CONFIG,
    TOKEN_PROVIDER_CONFIG_DEFAULT,
} from './utils/index.js'

const logger = pino({ name: 'cip112-19-paused', level: 'info' })
const TEST_TOKEN_REGISTRY = new URL('http://localhost:5634')
const PAUSED_INSTRUMENT_ID = 'test-token-paused'

async function registryReachable(): Promise<boolean> {
    try {
        const res = await fetch(
            new URL('/registry/metadata/v1/info', TEST_TOKEN_REGISTRY)
        )
        return res.ok
    } catch {
        return false
    }
}

if (!(await registryReachable())) {
    logger.warn(
        'test-token registry not reachable on :5634 — skipping paused-instrument check'
    )
    process.exit(0)
}

const sdk = await SDK.create({
    auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
    ledgerClientUrl: localNetStaticConfig.LOCALNET_APP_USER_LEDGER_URL,
    token: {
        registries: [TEST_TOKEN_REGISTRY],
        auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
        apiVersion: 'auto',
    },
    amulet: AMULET_NAMESPACE_CONFIG,
    asset: {
        registries: [TEST_TOKEN_REGISTRY],
        auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
    },
})

const paused = await sdk.asset.find(PAUSED_INSTRUMENT_ID, TEST_TOKEN_REGISTRY)
if (!paused.paused) {
    throw new Error(`Expected ${PAUSED_INSTRUMENT_ID} to be paused`)
}
logger.info({ pauseInfo: paused.pauseInfo }, 'Found paused instrument metadata')

const keys = sdk.keys.generate()
const party = await sdk.party.external
    .create(keys.publicKey, { partyHint: 'cip112-paused' })
    .sign(keys.privateKey)
    .execute()

let threw = false
try {
    await sdk.token.transfer.create({
        sender: party.partyId,
        recipient: party.partyId,
        instrumentId: PAUSED_INSTRUMENT_ID,
        registryUrl: TEST_TOKEN_REGISTRY,
        amount: '1',
        apiVersion: 'auto',
    })
} catch (e) {
    threw = true
    const message = e instanceof Error ? e.message : String(e)
    if (!/paused/i.test(message)) {
        throw new Error(`Expected pause rejection, got: ${message}`)
    }
    logger.info({ message }, 'transfer.create rejected paused instrument')
}

if (!threw) {
    throw new Error('Expected transfer.create to reject paused instrument')
}

logger.info('CIP-0112 paused-instrument check passed')
process.exit(0)
