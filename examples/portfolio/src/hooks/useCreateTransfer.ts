// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { PartyId } from '@canton-network/core-types'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { submitViaProvider } from '@lib/submit'
import { useInstruments } from './useInstruments'
import { useReachableRegistryUrls, useRegistryUrls } from './useRegistryUrls'
import { queryKeys } from './query-keys'
import { useWalletSdk } from './useWalletSdk'

export interface CreateTransferArgs {
    sender: string
    receiver: string
    instrumentId: { admin: PartyId; id: string }
    amount: string
    expiry: Date
    memo?: string
}

export const useCreateTransfer = () => {
    const { sdk } = useWalletSdk()
    const registryUrls = useRegistryUrls()
    const { reachableRegistryUrls } = useReachableRegistryUrls()
    const instruments = useInstruments()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (args: CreateTransferArgs) => {
            if (!sdk) {
                throw new Error('Wallet SDK is not ready')
            }

            const registryUrl = registryUrls.get(args.instrumentId.admin)
            if (!registryUrl) {
                throw new Error(
                    `no registry URL for admin ${args.instrumentId.admin}`
                )
            }

            if (
                reachableRegistryUrls.get(args.instrumentId.admin) !==
                registryUrl
            ) {
                throw new Error(
                    `Registry for admin ${args.instrumentId.admin} is not reachable`
                )
            }

            const instrument = instruments
                .get(args.instrumentId.admin)
                ?.find((item) => item.id === args.instrumentId.id)

            const preparedCommand = await sdk.token.transfer.create({
                sender: args.sender,
                recipient: args.receiver,
                amount: args.amount,
                instrumentId: args.instrumentId.id,
                registryUrl: new URL(registryUrl),
                expirationDate: args.expiry,
                memo: args.memo,
                apiVersion: 'auto',
                actors: [args.sender],
                supportedApis: instrument?.supportedApis,
            })

            await submitViaProvider(preparedCommand, args.sender)
        },
        onSuccess: () => {
            // Refetch in the background so broad holdings/history refreshes do
            // not keep the completed transfer mutation pending.
            void queryClient.invalidateQueries({
                queryKey: queryKeys.walletConnection.pendingTransfers.all,
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
