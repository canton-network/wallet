// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const token = ['token'] as const

export const tokenQueryKeys = {
    all: token,

    holdings: {
        all: [...token, 'holdings'] as const,
        forParty: (partyId: string | undefined) =>
            [...token, 'holdings', partyId] as const,
    },
}
