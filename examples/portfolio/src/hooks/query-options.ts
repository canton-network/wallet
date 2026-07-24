// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { queryOptions, type QueryClient } from '@tanstack/react-query'
import * as dappSdk from '@canton-network/dapp-sdk'
import type { LedgerProvider } from '@canton-network/core-provider-ledger'
import { usePortfolio } from '../contexts/PortfolioContext'
import { usePortfolioConfig } from '../contexts/PortfolioConfigContext'
import { queryKeys } from './query-keys'
import { useWalletSdk, type WalletSdk } from './useWalletSdk'
import type { PreapprovalRow } from '../types/preapprovals'
import { logger } from '@lib/logger'
import { TransactionHistoryService } from '@services/transaction-history-service'
import { toUniquePortfolioHoldings } from '@utils/holdings'

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

export const transactionHistoryServiceQueryOptions = (partyId: string) =>
    queryOptions({
        queryKey:
            queryKeys.walletConnection.transactionHistoryService.forParty(
                partyId
            ),
        queryFn: () => {
            const provider = dappSdk.getConnectedProvider()
            if (!provider) {
                throw new Error('Dapp provider is not available')
            }

            return new TransactionHistoryService({
                logger,
                provider: provider as unknown as LedgerProvider,
                party: partyId,
            })
        },
        staleTime: Infinity,
        gcTime: Infinity,
    })

export const holdingsQueryOptions = ({
    partyId,
    sdk,
}: {
    partyId: string | undefined
    sdk: WalletSdk
}) =>
    queryOptions({
        queryKey: queryKeys.walletConnection.holdings.forParty(partyId),
        enabled: !!partyId && !!sdk,
        queryFn: async () => {
            if (!partyId || !sdk) {
                throw new Error('Wallet SDK and party are required')
            }

            const contracts = await sdk.token.utxos.list({
                partyId,
                includeLocked: true,
            })

            return toUniquePortfolioHoldings(contracts)
        },
    })

export const usePendingTransfersQueryOptions = (party: string | undefined) => {
    const { sdk } = useWalletSdk()

    return queryOptions({
        queryKey: queryKeys.walletConnection.pendingTransfers.forParty(party),
        enabled: !!party && !!sdk,
        queryFn: async () => {
            if (!party || !sdk) {
                throw new Error('Wallet SDK and party are required')
            }

            return await sdk.token.transfer.pending(party)
        },
    })
}

export const useAllocationRequestsQueryOptions = (
    party: string | undefined
) => {
    const { sdk } = useWalletSdk()

    return queryOptions({
        queryKey: queryKeys.walletConnection.allocationRequests.forParty(party),
        enabled: !!party && !!sdk,
        queryFn: async () => {
            if (!party || !sdk) {
                throw new Error('Wallet SDK and party are required')
            }
            return await sdk.token.allocation.request.pending(party)
        },
    })
}

export const useAllocationsQueryOptions = (party: string | undefined) => {
    const { sdk } = useWalletSdk()

    return queryOptions({
        queryKey: queryKeys.walletConnection.allocations.forParty(party),
        enabled: !!party && !!sdk,
        queryFn: async () => {
            if (!party || !sdk) {
                throw new Error('Wallet SDK and party are required')
            }
            return await sdk.token.allocation.pending(party)
        },
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
        queryKey: queryKeys.walletConnection.preapprovals.status({
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
