// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PartyId } from '@canton-network/core-types'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { submitViaProvider } from '@lib/submit'
import { useReachableRegistryUrls, useRegistryUrls } from './useRegistryUrls'
import { queryKeys } from './query-keys'
import { useWalletSdk } from './useWalletSdk'
import type { TokenStandardVersion } from '../types/instruments'
import type { AssetBody } from '@canton-network/wallet-sdk'
import type { Account } from '@canton-network/core-token-standard-v2'

export interface CreateTransferArgs {
    sender: Account
    receiver: Account
    instrumentId: { admin: PartyId; id: string }
    amount: string
    expiry: Date
    tokenStandardVersion: TokenStandardVersion
    memo?: string
}

export const useCreateTransfer = () => {
    const { sdk } = useWalletSdk()
    const registryUrls = useRegistryUrls()
    const { reachableRegistryUrls } = useReachableRegistryUrls()
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
            const asset: AssetBody = await sdk.token.find(
                args.instrumentId.id,
                registryUrl
            )
            const version = resolveTransferVersion(
                asset,
                args.tokenStandardVersion
            )

            const actor = args.sender.owner ?? args.sender.provider
            if (!actor) {
                throw new Error(
                    'Sender account has neither an owner nor a provider'
                )
            }

            const preparedCommand =
                version.used === 'v2'
                    ? await sdk.token.v2.transfer.create({
                          sender: args.sender,
                          recipient: args.receiver,
                          amount: args.amount,
                          instrumentId: args.instrumentId.id,
                          registryUrl: new URL(registryUrl),
                          expirationDate: args.expiry,
                          memo: args.memo,
                      })
                    : await sdk.token.v1.transfer.create({
                          sender: v1Party(args.sender, 'sender'),
                          recipient: v1Party(args.receiver, 'receiver'),
                          amount: args.amount,
                          instrumentId: args.instrumentId.id,
                          registryUrl: new URL(registryUrl),
                          expirationDate: args.expiry,
                          memo: args.memo,
                      })

            await submitViaProvider(preparedCommand, actor)
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

export type TransferVersionResult = {
    requested: TokenStandardVersion
    used: TokenStandardVersion
    fallback: boolean
}

const resolveTransferVersion = (
    asset: AssetBody,
    requested: TokenStandardVersion
): TransferVersionResult => {
    const used =
        requested === 'v2' &&
        asset.capabilities.transferInstruction.includes('v2')
            ? 'v2'
            : 'v1'

    return { requested, used, fallback: used !== requested }
}

function v1Party(account: Account, role: 'sender' | 'receiver'): PartyId {
    if (account.owner == null) {
        throw new Error(`v1 transfers require a ${role} owner`)
    }
    if (account.provider != null || account.id !== '') {
        throw new Error(
            `v1 transfers only support basic accounts, but the ${role} account has a provider or account ID`
        )
    }
    return account.owner
}
