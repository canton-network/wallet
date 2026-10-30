import { computePreparedTransactionHash } from '@canton-network/core-tx-hashing'
import {
    SDK,
    localNetStaticConfig,
    signTransactionHash,
} from '@canton-network/wallet-sdk'

export default async function () {
    const sdk = await SDK.create({
        auth: global.TOKEN_PROVIDER_CONFIG_DEFAULT,
        ledgerClientUrl: localNetStaticConfig.LOCALNET_APP_USER_LEDGER_URL,
        synchronizerId: global.LOCALNET_GLOBAL_SYNCHRONIZER,
    })
    const myParty = global.EXISTING_PARTY_1
    const keys = global.EXISTING_PARTY_1_KEYS

    const { response } = await sdk.ledger
        .prepare({
            partyId: myParty,
            commands: sdk.utils.ping.create([
                { initiator: myParty, responder: myParty },
            ]),
        })
        .toJSON()

    // The SDK's prepare sets no hashing scheme, so the validator uses V2, and
    // sdk.ledger.execute submits as V2. Refuse any other scheme.
    const requested = 'HASHING_SCHEME_VERSION_V2'
    if (response.hashingSchemeVersion !== requested)
        throw Error(
            `The validator hashed with ${response.hashingSchemeVersion}`
        )

    // Recompute the hash under that scheme
    const hash = await computePreparedTransactionHash(
        response.preparedTransaction,
        response.hashingSchemeVersion
    )

    // Do not sign if the validator returned another hash
    if (!Buffer.from(response.preparedTransactionHash, 'base64').equals(hash))
        throw Error('Prepared transaction hash does not match')

    // Sign the hash computed here, not the one the validator returned
    const signature = signTransactionHash(
        Buffer.from(hash).toString('base64'),
        keys.privateKey
    )

    const signed = sdk.ledger.fromSignature(response, signature)
    await sdk.ledger.execute(signed, { partyId: myParty })
}
