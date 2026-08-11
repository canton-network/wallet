/**
 * CIP-0112 localnet solvency checks against Amulet.
 *
 * Covers: metadata dual APIs, apiVersion auto/v1 (and forced-v2 expectation),
 * two-step accept, reject, withdraw, and holdings history.
 *
 * SettleBatch / paused custom instruments need the test-token registry — not covered here.
 */
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

function supportsV2(
    supportedApis: Record<string, string> | undefined
): boolean {
    if (!supportedApis) return false
    return Object.keys(supportedApis).some(
        (key) => key.includes('splice-api-token-') && key.includes('-v2')
    )
}

function isMissingOffLedgerEndpoint(error: unknown): boolean {
    const message =
        typeof error === 'string'
            ? error
            : error && typeof error === 'object' && 'error' in error
              ? String((error as { error: unknown }).error)
              : error instanceof Error
                ? error.message
                : JSON.stringify(error)
    return /could not be found|not found|\b404\b/i.test(message)
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
if (!supportsV2(amulet.supportedApis)) {
    throw new Error(
        `Expected Amulet to advertise V2 APIs, got ${JSON.stringify(amulet.supportedApis)}`
    )
}
logger.info(
    { supportedApis: amulet.supportedApis },
    'Amulet advertises CIP-0112 packages'
)

const [tapCmd, tapDc] = await sdk.amulet.tap(sender.partyId, '10000')
await sdk.ledger
    .prepare({
        partyId: sender.partyId,
        commands: tapCmd,
        disclosedContracts: tapDc,
    })
    .sign(senderKeys.privateKey)
    .execute({ partyId: sender.partyId })

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

// Forced V1 still works against a dual-advertised instrument.
await executePrepared(
    sender.partyId,
    senderKeys.privateKey,
    await sdk.token.transfer.create({
        sender: sender.partyId,
        recipient: receiver.partyId,
        instrumentId: 'Amulet',
        registryUrl,
        amount: '100',
        apiVersion: 'v1',
    })
)
const pendingV1 = await sdk.token.transfer.pending(receiver.partyId)
if (!pendingV1.length)
    throw new Error('Expected pending transfer after forced v1 create')
await executePrepared(
    receiver.partyId,
    receiverKeys.privateKey,
    await sdk.token.transfer.accept({
        transferInstructionCid: pendingV1[0].contractId,
        registryUrl,
    })
)
logger.info('Forced apiVersion=v1 two-step accept succeeded')

// auto: prefer V2 metadata, fall back to V1 OffLedger when V2 factory is 404.
await executePrepared(
    sender.partyId,
    senderKeys.privateKey,
    await sdk.token.transfer.create({
        sender: sender.partyId,
        recipient: receiver.partyId,
        instrumentId: 'Amulet',
        registryUrl,
        amount: '200',
        apiVersion: 'auto',
    })
)
const pendingAuto = await sdk.token.transfer.pending(receiver.partyId)
if (!pendingAuto.length)
    throw new Error('Expected pending transfer after auto create')
await executePrepared(
    receiver.partyId,
    receiverKeys.privateKey,
    await sdk.token.transfer.accept({
        transferInstructionCid: pendingAuto[0].contractId,
        registryUrl,
    })
)
logger.info('apiVersion=auto two-step accept succeeded')

// reject path
await executePrepared(
    sender.partyId,
    senderKeys.privateKey,
    await sdk.token.transfer.create({
        sender: sender.partyId,
        recipient: receiver.partyId,
        instrumentId: 'Amulet',
        registryUrl,
        amount: '50',
        apiVersion: 'auto',
    })
)
const pendingReject = await sdk.token.transfer.pending(receiver.partyId)
if (!pendingReject.length)
    throw new Error('Expected pending transfer for reject')
await executePrepared(
    receiver.partyId,
    receiverKeys.privateKey,
    await sdk.token.transfer.reject({
        transferInstructionCid: pendingReject[0].contractId,
        registryUrl,
    })
)
if ((await sdk.token.transfer.pending(receiver.partyId)).length) {
    throw new Error('Pending transfers should be empty after reject')
}
logger.info('reject succeeded')

// withdraw path
await executePrepared(
    sender.partyId,
    senderKeys.privateKey,
    await sdk.token.transfer.create({
        sender: sender.partyId,
        recipient: receiver.partyId,
        instrumentId: 'Amulet',
        registryUrl,
        amount: '50',
        apiVersion: 'auto',
    })
)
const pendingWithdraw = await sdk.token.transfer.pending(receiver.partyId)
if (!pendingWithdraw.length)
    throw new Error('Expected pending transfer for withdraw')
await executePrepared(
    sender.partyId,
    senderKeys.privateKey,
    await sdk.token.transfer.withdraw({
        transferInstructionCid: pendingWithdraw[0].contractId,
        registryUrl,
    })
)
if ((await sdk.token.transfer.pending(receiver.partyId)).length) {
    throw new Error('Pending transfers should be empty after withdraw')
}
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
