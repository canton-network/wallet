import { localNetStaticConfig, SDK } from '@canton-network/wallet-sdk'
import _acceptV2 from './_acceptV2.js'
import type { TransferTestScriptParameters } from './types.js'

import {
    TOKEN_NAMESPACE_CONFIG,
    TOKEN_PROVIDER_CONFIG_DEFAULT,
    localNetGlobalSynchronizer,
} from '../utils/index.js'
import _rejectV2 from './_rejectV2.js'
import _withdrawV2 from './_withdrawV2.js'

import { configureLogging } from '../utils/configure-logging.js'
import {
    startRegistry,
    stopRegistry,
} from '@canton-network/example-test-token-v2-registry'
import { TEST_TOKEN_V2_REGISTRY } from '../utils/constants.js'
import { assertV2 } from '../utils/assert.js'
import { TestTokenV2 } from '@canton-network/core-splice-codegen'
const logger = await configureLogging()

const sdk = await SDK.create({
    auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
    ledgerClientUrl: localNetStaticConfig.LOCALNET_APP_USER_LEDGER_URL,
    synchronizerId: localNetGlobalSynchronizer,
    token: {
        ...TOKEN_NAMESPACE_CONFIG,
        registries: [
            ...TOKEN_NAMESPACE_CONFIG.registries,
            new URL(TEST_TOKEN_V2_REGISTRY.URL),
        ],
    },
})

await TestTokenV2.utils.vetDar(sdk)

const adminKeys = sdk.keys.generate()
const admin = await sdk.party.external
    .create(adminKeys.publicKey, {
        partyHint: 'admin',
        isAdmin: true,
    })
    .sign(adminKeys.privateKey)
    .execute()

await startRegistry({
    sdk,
    port: TEST_TOKEN_V2_REGISTRY.PORT,
    operator: {
        party: admin.partyId,
        keys: adminKeys,
    },
})

const senderKeys = sdk.keys.generate()

const sender = await sdk.party.external
    .create(senderKeys.publicKey, {
        partyHint: 'v1-18-alice',
    })
    .sign(senderKeys.privateKey)
    .execute()

const receiverKeys = sdk.keys.generate()

const receiver = await sdk.party.external
    .create(receiverKeys.publicKey, {
        partyHint: 'v1-18-bob',
    })
    .sign(receiverKeys.privateKey)
    .execute()

// Direct creation requires both the admin and the account owner's authority.
// Mint to the admin first, then let Alice accept a transfer of those tokens.
const adminTestTokenCreateCommand = TestTokenV2.commands.create.token({
    amount: '10000',
    account: {
        owner: admin.partyId,
        provider: null,
        id: '',
    },
    instrumentId: {
        admin: admin.partyId,
    },
})

await sdk.ledger
    .prepare({
        partyId: admin.partyId,
        commands: adminTestTokenCreateCommand,
    })
    .sign(adminKeys.privateKey)
    .execute({ partyId: admin.partyId })

const [fundSenderCommand, fundSenderDisclosedContracts] =
    await sdk.token.v2.transfer.create({
        sender: admin.partyId,
        recipient: sender.partyId,
        instrumentId: TestTokenV2.DAR.TestTokenID,
        registryUrl: TEST_TOKEN_V2_REGISTRY.URL,
        amount: '10000',
    })

await sdk.ledger
    .prepare({
        partyId: admin.partyId,
        commands: fundSenderCommand,
        disclosedContracts: fundSenderDisclosedContracts,
    })
    .sign(adminKeys.privateKey)
    .execute({ partyId: admin.partyId })

const senderPendingTransfers = await sdk.token.v2.transfer.pending(
    sender.partyId
)
const fundingTransfer = senderPendingTransfers.find(
    (transfer) =>
        transfer.interfaceViewValue.transfer.sender.owner === admin.partyId &&
        transfer.interfaceViewValue.transfer.instrumentId.admin ===
            admin.partyId &&
        transfer.interfaceViewValue.transfer.instrumentId.id ===
            TestTokenV2.DAR.TestTokenID
)
assertV2(!!fundingTransfer, 'No funding transfer found for Sender')

const [acceptFundingCommand, acceptFundingDisclosedContracts] =
    await sdk.token.v2.transfer.accept(
        fundingTransfer.contractId,
        [sender.partyId],
        TEST_TOKEN_V2_REGISTRY.URL
    )

await sdk.ledger
    .prepare({
        partyId: sender.partyId,
        commands: acceptFundingCommand,
        disclosedContracts: acceptFundingDisclosedContracts,
    })
    .sign(senderKeys.privateKey)
    .execute({ partyId: sender.partyId })

const senderUtxos = await sdk.token.utxos.list({ partyId: sender.partyId })

const senderTestTokenUtxos = senderUtxos.filter((utxo) => {
    return (
        utxo.interfaceViewValue.amount === '10000.0000000000' &&
        utxo.interfaceViewValue.instrumentId.id === TestTokenV2.DAR.TestTokenID
    )
})

assertV2(!!senderTestTokenUtxos.length, 'No UTXOs found for Sender')

const transferTestScriptParameters: TransferTestScriptParameters = {
    sdk,
    sender,
    senderKeys,
    receiver,
    receiverKeys,
    logger,
}

//requires splice 0.8.3+ for Token standard v2 transfer
await _acceptV2(transferTestScriptParameters)

await _rejectV2(transferTestScriptParameters)

await _withdrawV2(transferTestScriptParameters)

// Forcefully exit to prevent floating ledger retries from crashing the event loop
stopRegistry()
process.exit(0)
