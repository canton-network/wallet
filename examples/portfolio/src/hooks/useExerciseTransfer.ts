// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PartyId } from '@canton-network/core-types'
import type { PreparedCommand } from '@canton-network/wallet-sdk'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { submitViaProvider } from '@lib/submit'
import { useReachableRegistryUrls, useRegistryUrls } from './useRegistryUrls'
import { queryKeys } from './query-keys'
import { useWalletSdk } from './useWalletSdk'
import type { TokenStandardVersion } from '../types/instruments'

export const useExerciseTransfer = () => {
    const { sdk } = useWalletSdk()
    const registryUrls = useRegistryUrls()
    const { reachableRegistryUrls } = useReachableRegistryUrls()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (args: {
            party: PartyId
            contractId: string
            instrumentId: { admin: string; id: string }
            instructionChoice: 'Accept' | 'Reject' | 'Withdraw'
            version: TokenStandardVersion
            actors?: PartyId[]
        }) => {
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

            const choiceArgs = {
                transferInstructionCid: args.contractId,
                registryUrl: new URL(registryUrl),
            }
            let preparedCommand: PreparedCommand

            if (args.version === 'v2') {
                switch (args.instructionChoice) {
                    case 'Accept':
                        preparedCommand = await sdk.token.v2.transfer.accept(
                            args.contractId,
                            args.actors ?? [args.party],
                            new URL(registryUrl)
                        )
                        break
                    case 'Reject':
                        preparedCommand = await sdk.token.v2.transfer.reject(
                            args.contractId,
                            args.actors ?? [args.party],
                            new URL(registryUrl)
                        )
                        break
                    case 'Withdraw':
                        preparedCommand = await sdk.token.v2.transfer.withdraw(
                            args.contractId,
                            args.actors ?? [args.party],
                            new URL(registryUrl)
                        )
                        break
                    default: {
                        const unsupportedChoice: never = args.instructionChoice
                        throw new Error(
                            `Unsupported instruction choice: ${String(unsupportedChoice)}`
                        )
                    }
                }
            } else {
                switch (args.instructionChoice) {
                    case 'Accept':
                        preparedCommand =
                            await sdk.token.v1.transfer.accept(choiceArgs)
                        break
                    case 'Reject':
                        preparedCommand =
                            await sdk.token.v1.transfer.reject(choiceArgs)
                        break
                    case 'Withdraw':
                        preparedCommand =
                            await sdk.token.v1.transfer.withdraw(choiceArgs)
                        break
                    default: {
                        const unsupportedChoice: never = args.instructionChoice
                        throw new Error(
                            `Unsupported instruction choice: ${String(unsupportedChoice)}`
                        )
                    }
                }
            }

            await submitViaProvider(preparedCommand, args.party)
        },
        onSuccess: (_, args) => {
            // Refetch in the background so broad holdings/history refreshes do
            // not keep the completed transfer mutation pending.
            void queryClient.invalidateQueries({
                queryKey: queryKeys.walletConnection.pendingTransfers.forParty(
                    args.party
                ),
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

/**
 * If contract implements v2 act through v2. v1 is only for contracts that only implement v1
 * @param item
 * @returns
 */
export function transferActionVersion(item: {
    versions: TokenStandardVersion[]
}): TokenStandardVersion {
    return item.versions.includes('v2') ? 'v2' : 'v1'
}
