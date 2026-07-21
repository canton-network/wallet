// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import sdk from './sdk'

export const admin = {
    party: '',
    keys: sdk.keys.generate(),
}

export const initAdminParty = async () => {
    const createdParty = await sdk.party.external
        .create(admin.keys.publicKey, {
            partyHint: 'admin',
        })
        .sign(admin.keys.privateKey)
        .execute()

    admin.party = createdParty.partyId
}
