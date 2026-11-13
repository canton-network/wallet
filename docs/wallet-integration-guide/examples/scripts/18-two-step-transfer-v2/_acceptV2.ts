import type { TransferTestScriptParameters } from './types.js'
import { assertV2 } from '../utils/assert.js'
import { TestTokenV2 } from '@canton-network/core-splice-codegen'

export default async (args: TransferTestScriptParameters) => {
    const {
        sdk,
        sender,
        receiver,
        senderKeys,
        receiverKeys,
        registryUrl,
        logger,
    } = args

    const [transferCommand, transferDisclosedContracts] =
        await sdk.token.v2.transfer.create({
            sender: sender.partyId,
            recipient: receiver.partyId,
            instrumentId: TestTokenV2.DAR.TestTokenID,
            registryUrl,
            amount: '2000',
        })

    logger.info('Transfer command created, ready for signing and execution')

    await sdk.ledger
        .prepare({
            partyId: sender.partyId,
            commands: transferCommand,
            disclosedContracts: transferDisclosedContracts,
        })
        .sign(senderKeys.privateKey)
        .execute({ partyId: sender.partyId })

    logger.info(
        { sender, receiver },
        'Submitted transfer command from Sender to Receiver'
    )
    const receiverPendingTransfers = await sdk.token.v2.transfer.pending(
        receiver.partyId
    )
    logger.info(
        receiverPendingTransfers,
        'Receiver pending transfer instructions'
    )

    const [acceptCommand, acceptDisclosedContracts] =
        await sdk.token.v2.transfer.accept(
            receiverPendingTransfers[0].contractId,
            [receiver.partyId],
            registryUrl
        )

    const acceptTxResult = await sdk.ledger
        .prepare({
            partyId: receiver.partyId,
            commands: acceptCommand,
            disclosedContracts: acceptDisclosedContracts,
        })
        .sign(receiverKeys.privateKey)
        .execute({ partyId: receiver.partyId })
    logger.info('Receiver accepted the transfer instruction')

    const receiverUtxos = await sdk.token.v2.utxos.list({
        partyId: receiver.partyId,
    })
    logger.info(
        receiverUtxos,
        'Receiver UTXOs after accepting transfer instruction'
    )

    const receiverTestTokenUtxos = receiverUtxos.filter((utxo) => {
        return (
            utxo.interfaceViewValue.amount === '2000.0000000000' &&
            utxo.interfaceViewValue.instrumentId.id ===
                TestTokenV2.DAR.TestTokenID
        )
    })

    const receiverTx = await sdk.token.transactionsById({
        updateId: acceptTxResult.updateId,
        partyId: receiver.partyId,
    })

    logger.info(receiverTx)

    const incoming = receiverTx.events.find(
        (e) => e.label.type === 'TransferIn'
    )

    assertV2(incoming !== undefined, 'incoming is undefined')

    const show = (value: unknown) => JSON.stringify(value)
    const TOKEN = TestTokenV2.DAR.TestTokenID
    const summaries = (
        s: { instrumentId: { id: string }; amountChange: string }[]
    ) => s.map((x) => [x.instrumentId.id, x.amountChange])

    assertV2(
        incoming !== undefined,
        `receiver: no TransferIn, labels ${show(receiverTx.events.map((e) => e.label.type))}`
    )

    const unlockedSummaries = summaries(
        incoming.unlockedHoldingsChangeSummaries
    )
    assertV2(
        show(unlockedSummaries) === show([[TOKEN, '2000']]),
        `receiver: unlocked summaries ${show(unlockedSummaries)}`
    )
    assertV2(
        receiverTestTokenUtxos.length === 1,
        `receiver: expected 1 matching UTXO, got ${receiverTestTokenUtxos.length}`
    )
    const createdCids =
        incoming.unlockedHoldingsChange?.creates.map((h) => h.contractId) ?? []
    assertV2(
        createdCids.includes(receiverTestTokenUtxos[0].contractId),
        `receiver: created holdings ${show(createdCids)} don't include ${receiverTestTokenUtxos[0].contractId}`
    )
    assertV2(
        receiverTestTokenUtxos.length > 0,
        'No TestTokenV2 UTXOs found for Receiver after accepting transfer instruction'
    )

    logger.info('Two step transfer process completed successfully')
}
