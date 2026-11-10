// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PartyId } from '@canton-network/core-types'
import type { PreparedCommand } from '@canton-network/wallet-sdk'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { submitViaProvider } from '@lib/submit'
import { useReachableRegistryUrls, useRegistryUrls } from './useRegistryUrls'
import { useWalletSdk } from './useWalletSdk'
import { queryKeys } from './query-keys'
import type { AllocationV2ActionItem } from '@components/types'
import { getAllocationActions } from '@utils/v2-allocation-items'

export const useWithdrawAllocationV2 = () => {
    const { sdk } = useWalletSdk()
    const registryUrls = useRegistryUrls()
    const { reachableRegistryUrls } = useReachableRegistryUrls()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (item: AllocationV2ActionItem) => {
            if (!sdk) {
                throw new Error('Wallet SDK is not ready')
            }

            const party = item.currentPartyId as PartyId
            const admin = item.allocation.admin
            const withdraw = getAllocationActions(item).find(
                (a) => a.action === 'Withdraw' && a.status === 'available'
            )

            if (!withdraw || withdraw.status !== 'available') {
                throw new Error(
                    `This allocation cannot be withdrawn by you right now`
                )
            }

            const registryUrl = registryUrls.get(admin)
            if (!registryUrl)
                throw new Error(`No registry configured for admin ${admin}`)
            if (reachableRegistryUrls.get(admin) !== registryUrl)
                throw new Error(`Registry for admin ${admin} is no reachable`)

            const instrumentId =
                item.allocation.transferLegSides[0]?.instrumentId
            if (!instrumentId)
                throw new Error('Allocation has no transfer legs')
            const asset = await sdk.token.find(instrumentId, registryUrl)

            const preparedCommand = (await sdk.token.v2.allocation.withdraw({
                allocationCid: item.contractId,
                actors: withdraw.actors as PartyId[],
                asset,
            })) as PreparedCommand

            await submitViaProvider(preparedCommand, party)
        },
        onSettled: (_result, _error, _item) => {
            const party = _item.currentPartyId
            void queryClient.invalidateQueries({
                queryKey:
                    queryKeys.walletConnection.allocations.forParty(party),
            })
            void queryClient.invalidateQueries({
                queryKey: queryKeys.walletConnection.holdings.all,
            })
            void queryClient.invalidateQueries({
                queryKey: queryKeys.walletConnection.transactionHistory.all,
            })
        },
    })
}
