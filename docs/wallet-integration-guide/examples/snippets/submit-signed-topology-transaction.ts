import {
    SDK,
    localNetStaticConfig,
    signTransactionHash,
} from '@canton-network/wallet-sdk'

export default async function () {
    const sdk = await SDK.create({
        auth: global.TOKEN_PROVIDER_CONFIG_DEFAULT,
        ledgerClientUrl: localNetStaticConfig.LOCALNET_APP_USER_LEDGER_URL,
    })

    //Online signing
    const keys = sdk.keys.generate()

    await sdk.party.external
        .create(keys.publicKey, {
            partyHint: 'snippet-party-hint',
            synchronizerId: global.SYNCHRONIZER_ID,
        })
        .sign(keys.privateKey)
        .execute()

    //offline signing where the keys are held externally
    const offlineSigningKeys = sdk.keys.generate()

    const receiverPartyCreation = sdk.party.external.create(
        offlineSigningKeys.publicKey,
        {
            partyHint: 'offline-signing-party',
            synchronizerId: global.SYNCHRONIZER_ID,
        }
    )

    const unsignedReceiver = await receiverPartyCreation.topology()

    // offline signing simulation - in most cases a signing provider would sign the multihash
    const receiverPartySignature = signTransactionHash(
        unsignedReceiver.multiHash,
        offlineSigningKeys.privateKey
    )

    await receiverPartyCreation.execute(receiverPartySignature)
}
