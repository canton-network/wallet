/** CIP-0112 paused-instrument guard (soft-skips if the test-token registry is down). */
import { localNetStaticConfig, SDK } from '@canton-network/wallet-sdk'
import { pino } from 'pino'
import {
    AMULET_NAMESPACE_CONFIG,
    TEST_TOKEN_REGISTRY,
    TEST_TOKEN_REGISTRY_CONFIG,
    TOKEN_PROVIDER_CONFIG_DEFAULT,
} from './utils/index.js'

const logger = pino({ name: 'cip112-19-paused', level: 'info' })
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
        'SKIP: test-token registry not running on :5634 — paused-instrument check not executed'
    )
    process.exit(0)
}

const sdk = await SDK.create({
    auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
    ledgerClientUrl: localNetStaticConfig.LOCALNET_APP_USER_LEDGER_URL,
    token: TEST_TOKEN_REGISTRY_CONFIG,
    amulet: AMULET_NAMESPACE_CONFIG,
    asset: {
        registries: TEST_TOKEN_REGISTRY_CONFIG.registries,
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
