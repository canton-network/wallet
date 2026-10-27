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
import type { Account } from '@canton-network/core-token-standard-v2'

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
                            [args.party],
                            new URL(registryUrl)
                        )
                        break
                    case 'Reject':
                        preparedCommand = await sdk.token.v2.transfer.reject(
                            args.contractId,
                            [args.party],
                            new URL(registryUrl)
                        )
                        break
                    case 'Withdraw':
                        preparedCommand = await sdk.token.v2.transfer.withdraw(
                            args.contractId,
                            [args.party],
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

export function transferActionVersion(
    item: {
        versions: TokenStandardVersion[]
        senderAccount?: Account
        receiverAccount?: Account
    },
    preferred: TokenStandardVersion = 'v1'
): TokenStandardVersion {
    const isBasicAccount = (a?: Account) =>
        !a || (a.provider == null && a.id === '')
    if (!item.versions.includes('v1')) return 'v2'
    if (!item.versions.includes('v2')) return 'v1'
    if (
        !isBasicAccount(item.senderAccount) ||
        !isBasicAccount(item.receiverAccount)
    )
        return 'v2' //non basic accounts can only use v2
    return preferred //default to preferred version if an asset supports v1 and v2 transfers
}
