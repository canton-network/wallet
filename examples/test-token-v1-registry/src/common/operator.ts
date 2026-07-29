// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import sdk from './sdk'

export const operator = {
    party: '',
    keys: sdk.keys.generate(),
}

export const initOperatorParty = async () => {
    const createdParty = await sdk.party.external
        .create(operator.keys.publicKey, {
            partyHint: 'operator',
        })
        .sign(operator.keys.privateKey)
        .execute()

    operator.party = createdParty.partyId
}
