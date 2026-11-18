// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { queryOptions } from '@tanstack/react-query'
import { logger as reactLogger } from '../logger'
import type { TokenClient } from './client'
import { mergeHoldings, toOwnedHoldings } from './holdings'
import { tokenQueryKeys } from './query-keys'

const logger = reactLogger.getChild('token')

export const holdingsQueryOptions = ({
    client,
    partyId,
}: {
    client: TokenClient | undefined
    partyId: string | undefined
}) =>
    queryOptions({
        queryKey: tokenQueryKeys.holdings.forParty(partyId),
        enabled: !!partyId && !!client,
        queryFn: async () => {
            if (!partyId || !client) {
                throw new Error('Token client and party are required')
            }

            const [v1, v2] = await Promise.all([
                client.token.v1.utxos.list({
                    partyId,
                    includeLocked: true,
                }),
                client.token.v2.utxos
                    .list({
                        partyId,
                        includeLocked: true,
                    })
                    .catch((error: unknown) => {
                        logger.warn(
                            'V2 holdings unavailable, showing V1 only: {error}',
                            { error }
                        )
                        return []
                    }),
            ])

            return toOwnedHoldings(mergeHoldings(v1, v2), partyId)
        },
    })
