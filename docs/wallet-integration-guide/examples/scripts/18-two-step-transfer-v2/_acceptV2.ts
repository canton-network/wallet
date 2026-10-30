import type { TransferTestScriptParameters } from './types.js'
import { assertV2 } from '../utils/assert.js'
import { TestTokenV2 } from '@canton-network/core-splice-codegen'
import { TEST_TOKEN_V2_REGISTRY } from '../utils/constants.js'

export default async (args: TransferTestScriptParameters) => {
    const { sdk, sender, receiver, senderKeys, receiverKeys, logger } = args

    const [transferCommand, transferDisclosedContracts] =
        await sdk.token.v2.transfer.create({
            sender: sender.partyId,
            recipient: receiver.partyId,
            instrumentId: TestTokenV2.DAR.TestTokenID,
            registryUrl: TEST_TOKEN_V2_REGISTRY.URL,
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
            TEST_TOKEN_V2_REGISTRY.URL
        )

    await sdk.ledger
        .prepare({
            partyId: receiver.partyId,
            commands: acceptCommand,
            disclosedContracts: acceptDisclosedContracts,
        })
        .sign(receiverKeys.privateKey)
        .execute({ partyId: receiver.partyId })
    logger.info('Receiver accepted the transfer instruction')

    const receiverUtxos = await sdk.token.utxos.list({
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

    assertV2(
        receiverTestTokenUtxos.length > 0,
        'No TestTokenV2 UTXOs found for Receiver after accepting transfer instruction'
    )

    logger.info('Two step transfer process completed successfully')
}
