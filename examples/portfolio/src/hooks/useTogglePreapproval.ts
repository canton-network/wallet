// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { v4 } from 'uuid'
import { toast } from 'sonner'
import * as dappSdk from '@canton-network/dapp-sdk'
import type { LedgerTypes } from '@canton-network/wallet-sdk'
import { utilityOperatorQueryOptions } from './query-options'
import { queryKeys } from './query-keys'
import type { useWalletSdk } from './useWalletSdk'
import { WalletSDKUtilitiesPluginName } from '@lib/utilities-wallet-sdk-plugin'
import type { PreapprovalRow } from '../types/preapprovals'

type WalletSdk = ReturnType<typeof useWalletSdk>['sdk'] | undefined

type TogglePreapprovalInput = {
    row: PreapprovalRow
    enabled: boolean
}

type UseTogglePreapprovalArgs = {
    primaryParty: string | undefined
    sdk: WalletSdk
}

export function useTogglePreapproval({
    primaryParty,
    sdk,
}: UseTogglePreapprovalArgs) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ row, enabled }: TogglePreapprovalInput) => {
            if (!primaryParty) {
                throw new Error('Primary party is unavailable')
            }

            if (!sdk) {
                throw new Error('Wallet SDK is not ready')
            }

            if (row.kind === 'amulet') {
                if (enabled) {
                    const command = await sdk.amulet.preapproval.command.create(
                        {
                            parties: { receiver: primaryParty },
                        }
                    )

                    await submitPreapprovalCommand({
                        command,
                        disclosedContracts: [],
                        receiver: primaryParty,
                    })
                    await sdk.amulet.preapproval.fetchStatus(primaryParty)
                    return
                }

                const [command, disclosedContracts] =
                    await sdk.amulet.preapproval.command.cancel({
                        parties: { receiver: primaryParty },
                    })

                await submitPreapprovalCommand({
                    command,
                    disclosedContracts,
                    receiver: primaryParty,
                })
                await sdk.amulet.preapproval.fetchStatus(primaryParty, {
                    cancelled: true,
                })
                return
            }

            const operator = await queryClient.ensureQueryData(
                utilityOperatorQueryOptions({
                    registryPartyId: row.registryPartyId,
                    registryUrl: row.registryUrl,
                })
            )

            const args = {
                receiver: primaryParty,
                operator,
                instrumentAdmin: row.registryPartyId,
                instrumentId: row.instrument.id,
            }

            if (enabled) {
                const [command, disclosedContracts] = sdk[
                    WalletSDKUtilitiesPluginName
                ].preapprovalTransfer.create({
                    receiver: primaryParty,
                    operator,
                    instrumentAdmin: row.registryPartyId,
                    instrumentAllowances: [{ id: row.instrument.id }],
                })

                await submitPreapprovalCommand({
                    command,
                    disclosedContracts,
                    receiver: primaryParty,
                })
                await sdk[
                    WalletSDKUtilitiesPluginName
                ].preapprovalTransfer.fetchStatus(args)
                return
            }

            const [command, disclosedContracts] =
                await sdk[
                    WalletSDKUtilitiesPluginName
                ].preapprovalTransfer.cancel(args)

            await submitPreapprovalCommand({
                command,
                disclosedContracts,
                receiver: primaryParty,
            })
            await sdk[
                WalletSDKUtilitiesPluginName
            ].preapprovalTransfer.fetchStatus(args, { cancelled: true })
        },
        onSuccess: async (_data, variables) => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.preapprovals.status({
                    party: primaryParty,
                    kind: variables.row.kind,
                    registryPartyId: variables.row.registryPartyId,
                    instrumentId: variables.row.instrument.id,
                }),
            })
            toast.success(
                variables.enabled
                    ? 'Preapproval enabled'
                    : 'Preapproval disabled'
            )
        },
        onError: (error) => {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to update preapproval'
            )
        },
    })
}

type SubmitPreapprovalCommandArgs = {
    command: LedgerTypes['Command'] | null
    disclosedContracts?: readonly LedgerTypes['DisclosedContract'][]
    receiver: string
}

async function submitPreapprovalCommand({
    command,
    disclosedContracts = [],
    receiver,
}: SubmitPreapprovalCommandArgs) {
    if (!command) {
        return
    }

    const provider = dappSdk.getConnectedProvider()
    if (!provider) {
        throw new Error('Dapp provider is not available')
    }

    await provider.request({
        method: 'prepareExecuteAndWait',
        params: {
            commands: [command],
            commandId: v4(),
            actAs: [receiver],
            disclosedContracts: [...disclosedContracts],
        },
    })
}
