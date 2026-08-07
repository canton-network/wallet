// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { PartyId } from '@canton-network/core-types'
import sdk from './sdk'

export const operator = {
    party: '',
    keys: sdk.keys.generate(),
}

export const initOperatorParty = async (admin?: typeof operator) => {
    if (admin) {
        Object.assign(operator, admin)
        return
    }
    const createdParty = await sdk.party.external
        .create(operator.keys.publicKey, {
            partyHint: 'operator',
        })
        .sign(operator.keys.privateKey)
        .execute()

        operator.party = createdParty.partyId
    }
}
