/**
 * CIP-0112 localnet solvency checks against Amulet.
 *
 * Covers: metadata dual APIs, apiVersion auto/v1 (and forced-v2 expectation),
 * two-step accept, reject, withdraw, and holdings history.
 *
 * SettleBatch / paused custom instruments need the test-token registry — not covered here.
 */
import {
    instrumentSupportsV2,
    isMissingOffLedgerEndpoint,
} from '@canton-network/core-token-standard'
import { localNetStaticConfig, SDK } from '@canton-network/wallet-sdk'
import { pino } from 'pino'
import {
    AMULET_NAMESPACE_CONFIG,
    ASSET_CONFIG,
    TOKEN_NAMESPACE_CONFIG,
    TOKEN_PROVIDER_CONFIG_DEFAULT,
} from './utils/index.js'

const logger = pino({ name: 'cip112-18-solvency', level: 'info' })
const registryUrl = localNetStaticConfig.LOCALNET_REGISTRY_API_URL
const PENDING_WAIT_MS = 30_000
const PENDING_POLL_MS = 500

async function sleep(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitUntil<T>(
    label: string,
    fn: () => Promise<T | undefined>
): Promise<T> {
    const deadline = Date.now() + PENDING_WAIT_MS
    while (Date.now() < deadline) {
        const value = await fn()
        if (value !== undefined) return value
        await sleep(PENDING_POLL_MS)
    }
    throw new Error(`Timed out waiting for ${label}`)
}

const sdk = await SDK.create({
    auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
    ledgerClientUrl: localNetStaticConfig.LOCALNET_APP_USER_LEDGER_URL,
    token: TOKEN_NAMESPACE_CONFIG,
    amulet: AMULET_NAMESPACE_CONFIG,
    asset: ASSET_CONFIG,
})

async function executePrepared(
    partyId: string,
    privateKey: string,
    prepared: readonly [unknown, unknown]
) {
    const [commands, disclosedContracts] = prepared
    return sdk.ledger
        .prepare({
            partyId,
            commands,
            ...(Array.isArray(disclosedContracts)
                ? { disclosedContracts }
                : {}),
        })
        .sign(privateKey)
        .execute({ partyId })
}

async function pendingCids(partyId: string): Promise<Set<string>> {
    const pending = await sdk.token.transfer.pending(partyId)
    return new Set(pending.map((p) => p.contractId))
}

async function waitForNewPending(
    partyId: string,
    known: Set<string>
): Promise<string> {
    return waitUntil('new pending transfer instruction', async () => {
        const pending = await sdk.token.transfer.pending(partyId)
        return pending.find((p) => !known.has(p.contractId))?.contractId
    })
}

async function waitUntilPendingGone(partyId: string, cid: string) {
    await waitUntil(`pending ${cid} archived`, async () => {
        const pending = await sdk.token.transfer.pending(partyId)
        return pending.some((p) => p.contractId === cid) ? undefined : true
    })
}

const senderKeys = sdk.keys.generate()
const sender = await sdk.party.external
    .create(senderKeys.publicKey, { partyHint: 'cip112-alice' })
    .sign(senderKeys.privateKey)
    .execute()

const receiverKeys = sdk.keys.generate()
const receiver = await sdk.party.external
    .create(receiverKeys.publicKey, { partyHint: 'cip112-bob' })
    .sign(receiverKeys.privateKey)
    .execute()

const amulet = await sdk.asset.find('Amulet', registryUrl)
if (amulet.paused) {
    throw new Error('Expected Amulet to be unpaused on localnet')
}
const v2Advertised = instrumentSupportsV2(amulet.supportedApis)
if (!v2Advertised) {
    logger.warn(
        { supportedApis: amulet.supportedApis },
        'Amulet does not advertise V2 APIs; continuing with V1-only checks'
    )
} else {
    logger.info(
        { supportedApis: amulet.supportedApis },
        'Amulet advertises CIP-0112 packages'
    )
}

const [tapCmd, tapDc] = await sdk.amulet.tap(sender.partyId, '10000')
await sdk.ledger
    .prepare({
        partyId: sender.partyId,
        commands: tapCmd,
        disclosedContracts: tapDc,
    })
    .sign(senderKeys.privateKey)
    .execute({ partyId: sender.partyId })

if (v2Advertised) {
    // Forced V2: OffLedger factory may still be missing on scan-proxy (0.6.12).
    try {
        await sdk.token.transfer.create({
            sender: sender.partyId,
            recipient: receiver.partyId,
            instrumentId: 'Amulet',
            registryUrl,
            amount: '10',
            apiVersion: 'v2',
        })
        logger.info('Forced apiVersion=v2 transfer factory is available')
    } catch (e) {
        if (!isMissingOffLedgerEndpoint(e)) throw e
        logger.warn(
            'Forced apiVersion=v2 OffLedger factory not mounted on scan-proxy (expected until registry V2 proxy lands)'
        )
    }
}

async function createTransfer(amount: string, apiVersion: 'v1' | 'auto') {
    const known = await pendingCids(receiver.partyId)
    await executePrepared(
        sender.partyId,
        senderKeys.privateKey,
        await sdk.token.transfer.create({
            sender: sender.partyId,
            recipient: receiver.partyId,
            instrumentId: 'Amulet',
            registryUrl,
            amount,
            apiVersion,
        })
    )
    return waitForNewPending(receiver.partyId, known)
}

// Forced V1 still works against a dual-advertised or V1-only instrument.
const pendingV1Cid = await createTransfer('100', 'v1')
await executePrepared(
    receiver.partyId,
    receiverKeys.privateKey,
    await sdk.token.transfer.accept({
        transferInstructionCid: pendingV1Cid,
        registryUrl,
        apiVersion: 'v1',
        supportedApis: amulet.supportedApis,
    })
)
await waitUntilPendingGone(receiver.partyId, pendingV1Cid)
logger.info('Forced apiVersion=v1 two-step accept succeeded')

// auto: prefer V2 metadata, fall back to V1 OffLedger when V2 factory is 404.
const pendingAutoCid = await createTransfer('200', 'auto')
await executePrepared(
    receiver.partyId,
    receiverKeys.privateKey,
    await sdk.token.transfer.accept({
        transferInstructionCid: pendingAutoCid,
        registryUrl,
        apiVersion: 'auto',
        actors: [receiver.partyId],
        supportedApis: amulet.supportedApis,
    })
)
await waitUntilPendingGone(receiver.partyId, pendingAutoCid)
logger.info('apiVersion=auto two-step accept succeeded')

const pendingRejectCid = await createTransfer('50', 'auto')
await executePrepared(
    receiver.partyId,
    receiverKeys.privateKey,
    await sdk.token.transfer.reject({
        transferInstructionCid: pendingRejectCid,
        registryUrl,
        apiVersion: 'auto',
        actors: [receiver.partyId],
        supportedApis: amulet.supportedApis,
    })
)
await waitUntilPendingGone(receiver.partyId, pendingRejectCid)
logger.info('reject succeeded')

const pendingWithdrawCid = await createTransfer('50', 'auto')
await executePrepared(
    sender.partyId,
    senderKeys.privateKey,
    await sdk.token.transfer.withdraw({
        transferInstructionCid: pendingWithdrawCid,
        registryUrl,
        apiVersion: 'auto',
        actors: [sender.partyId],
        supportedApis: amulet.supportedApis,
    })
)
await waitUntilPendingGone(receiver.partyId, pendingWithdrawCid)
logger.info('withdraw succeeded')

const history = await sdk.token.holdings({ partyId: receiver.partyId })
const eventTypes = history.transactions.flatMap((tx) =>
    tx.events.map((event) => event.label.type)
)
const transferIn = history.transactions
    .flatMap((tx) => tx.events)
    .find((event) => event.label.type === 'TransferIn')
if (!transferIn) {
    throw new Error(
        `Expected TransferIn in receiver holdings history; got ${eventTypes.join(',')}`
    )
}
logger.info({ eventTypes }, 'holdings history includes TransferIn')

logger.info('CIP-0112 Amulet solvency checks passed')
process.exit(0)
