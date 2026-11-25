// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { AllocationSpecification } from '@canton-network/core-token-standard'
import type { PartyId } from '@canton-network/core-types'
import { submitViaProvider } from '@lib/submit'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { resolveAllocationAsset } from '@utils/allocation'

import { queryKeys } from './query-keys.ts'
import { useInstruments } from './useInstruments.ts'
import { useReachableRegistryUrls, useRegistryUrls } from './useRegistryUrls.ts'
import { useWalletSdk } from './useWalletSdk.ts'

export const useCreateAllocation = () => {
    const { sdk } = useWalletSdk()
    const registryUrls = useRegistryUrls()
    const { reachableRegistryUrls } = useReachableRegistryUrls()
    const instruments = useInstruments()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (args: {
            party: PartyId
            allocationSpecification: AllocationSpecification
        }) => {
            const asset = resolveAllocationAsset({
                instrumentId:
                    args.allocationSpecification.transferLeg.instrumentId,
                instruments,
                registryUrls,
                reachableRegistryUrls,
            })
            if (!sdk) {
                throw new Error('Wallet SDK is not ready')
            }

            const preparedCommand =
                await sdk.token.v1.allocation.instruction.create({
                    allocationSpecification: args.allocationSpecification,
                    asset,
                })

            await submitViaProvider(preparedCommand, args.party)
        },
        onSuccess: async (_, args) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: queryKeys.walletConnection.allocations.forParty(
                        args.party
                    ),
                }),
                queryClient.invalidateQueries({
                    queryKey: queryKeys.walletConnection.holdings.forParty(
                        args.party
                    ),
                }),
            ])
        },
    })
}
