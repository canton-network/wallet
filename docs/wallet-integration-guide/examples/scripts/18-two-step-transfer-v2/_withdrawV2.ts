import { localNetStaticConfig } from '@canton-network/wallet-sdk'
import type { TransferTestScriptParameters } from './types.js'
import { assertV2 } from '../utils/assert.js'
import { TestTokenV2 } from '@canton-network/core-splice-codegen'
import { TEST_TOKEN_V2_REGISTRY } from '../utils/constants.js'

export default async (args: TransferTestScriptParameters) => {
    const { sdk, sender, receiver, senderKeys, logger } = args

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
    if (!receiverPendingTransfers.length)
        throw Error('receiverPendingTransfers is empty')

    logger.info(
        receiverPendingTransfers,
        'Receiver pending transfer instructions'
    )

    const [withdrawCommand, withdrawDisclosedContracts] =
        await sdk.token.v2.transfer.withdraw(
            receiverPendingTransfers[0].contractId,
            [sender.partyId],
            TEST_TOKEN_V2_REGISTRY.URL
        )

    await sdk.ledger
        .prepare({
            partyId: sender.partyId,
            commands: withdrawCommand,
            disclosedContracts: withdrawDisclosedContracts,
        })
        .sign(senderKeys.privateKey)
        .execute({ partyId: sender.partyId })
    logger.info('Sender withdrew the transfer instruction')

    const pendingTransferAfterWithdraw = await sdk.token.v2.transfer.pending(
        receiver.partyId
    )

    assertV2(
        !pendingTransferAfterWithdraw.length,
        'pendingTransferAfterReject is not empty'
    )

    logger.info('Successfully withdrawn the submitted transfer')
}
