// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { queryOptions, type QueryClient } from '@tanstack/react-query'
import { usePortfolio } from '../contexts/PortfolioContext'
import { usePortfolioConfig } from '../contexts/PortfolioConfigContext'
import { queryKeys } from './query-keys'
import type { useWalletSdk } from './useWalletSdk'
import type { PreapprovalRow } from '../types/preapprovals'

type WalletSdk = ReturnType<typeof useWalletSdk>['sdk'] | undefined

const UTILITY_OPERATOR_ENDPOINT = '/api/utilities/v0/operator'

type UtilityOperatorResponse = {
    partyId?: string
}

export const utilityOperatorQueryOptions = ({
    registryPartyId,
    registryUrl,
}: {
    registryPartyId: string
    registryUrl: string
}) =>
    queryOptions({
        queryKey: queryKeys.utilityOperators.forRegistry(
            registryPartyId,
            registryUrl
        ),
        queryFn: async () => {
            const response = await fetch(
                new URL(
                    `${new URL(registryUrl).origin}${UTILITY_OPERATOR_ENDPOINT}`
                )
            )

            if (!response.ok) {
                throw new Error('Unable to read utility operator party')
            }

            const { partyId } =
                (await response.json()) as UtilityOperatorResponse
            if (!partyId) {
                throw new Error('Utility operator response is missing partyId')
            }

            return partyId
        },
        // The operator party for a registry is fixed, so cache it forever and
        // let consumers re-fetch on demand when a lookup previously failed.
        staleTime: Infinity,
    })

export const usePendingTransfersQueryOptions = (party: string | undefined) => {
    const { listPendingTransfers } = usePortfolio()
    return queryOptions({
        retry: 10,
        queryKey: queryKeys.listPendingTransfers.forParty(party),
        queryFn: async () =>
            party ? listPendingTransfers({ party: party! }) : [],
    })
}

export const useAllocationRequestsQueryOptions = (
    party: string | undefined
) => {
    const { listAllocationRequests } = usePortfolio()
    return queryOptions({
        queryKey: queryKeys.listAllocationRequests.forParty(party),
        queryFn: () => listAllocationRequests({ party: party! }),
        enabled: !!party,
    })
}

export const useAllocationsQueryOptions = (party: string | undefined) => {
    const { listAllocations } = usePortfolio()
    return queryOptions({
        queryKey: queryKeys.listAllocations.forParty(party),
        queryFn: () => listAllocations({ party: party! }),
        enabled: !!party,
    })
}

export const useIsDevNetQueryOptions = (sessionToken: string | undefined) => {
    const { isDevNet } = usePortfolio()
    const {
        token: { validatorUrl },
    } = usePortfolioConfig()
    return queryOptions({
        queryKey: queryKeys.isDevNet.all,
        queryFn: async () =>
            sessionToken ? isDevNet({ sessionToken, validatorUrl }) : false,
        enabled: !!sessionToken,
        staleTime: Infinity, // Network doesn't change, so cache forever
    })
}

export const preapprovalStatusQueryOptions = ({
    row,
    party,
    sdk,
    queryClient,
}: {
    row: PreapprovalRow
    party: string | undefined
    sdk: WalletSdk
    queryClient: QueryClient
}) =>
    queryOptions({
        queryKey: queryKeys.preapprovals.status({
            party,
            kind: row.kind,
            registryPartyId: row.registryPartyId,
            instrumentId: row.instrument.id,
        }),
        enabled: !!party && !!sdk,
        // Match the SDK's 10-second preapproval visibility polling interval.
        staleTime: 10_000,
        queryFn: async () => {
            if (!party || !sdk) {
                return null
            }

            if (row.kind === 'amulet') {
                return (await sdk.amulet.preapproval.fetchQuick(party)) ?? null
            }

            // The operator party is a precondition for the utility status
            // lookup. Resolving it here means a failed operator fetch surfaces
            // through this query's error state (and its retry), rather than
            // leaving the row stuck on "Checking...".
            const operator = await queryClient.ensureQueryData(
                utilityOperatorQueryOptions({
                    registryPartyId: row.registryPartyId,
                    registryUrl: row.registryUrl,
                })
            )

            return await sdk.utilities.preapprovalTransfer.fetchQuick({
                receiver: party,
                operator,
                instrumentAdmin: row.registryPartyId,
                instrumentId: row.instrument.id,
            })
        },
    })
