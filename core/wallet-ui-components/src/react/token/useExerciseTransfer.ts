// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PartyId } from '@canton-network/core-types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { TokenStandardVersion } from './client.ts'
import { tokenQueryKeys } from './query-keys.ts'
import { useTokenContext } from './useTokenContext.ts'

export type TransferInstructionChoice = 'Accept' | 'Reject' | 'Withdraw'

export interface ExerciseTransferArgs {
    party: PartyId
    contractId: string
    instrumentId: { admin: PartyId; id: string }
    instructionChoice: TransferInstructionChoice
    version: TokenStandardVersion
    actors?: PartyId[]
}

export const useExerciseTransfer = () => {
    const { client } = useTokenContext()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (args: ExerciseTransferArgs) => {
            if (!client) {
                throw new Error('The token client is not ready')
            }
            const { transfer } = client.token
            const exercise = {
                Accept: transfer.accept,
                Reject: transfer.reject,
                Withdraw: transfer.withdraw,
            }[args.instructionChoice]
            if (!exercise) {
                throw new Error(
                    `Unsupported instruction choice: ${String(args.instructionChoice)}`
                )
            }
            await exercise.call(transfer, {
                partyId: args.party,
                contractId: args.contractId,
                instrumentId: args.instrumentId,
                version: args.version,
                actors: args.actors,
            })
        },
        onSuccess: (_, args) => {
            // Refetch in the background so broad holdings refreshes do not
            // keep the completed transfer mutation pending.
            void queryClient.invalidateQueries({
                queryKey: tokenQueryKeys.pendingTransfers.forParty(args.party),
            })
            void queryClient.invalidateQueries({
                queryKey: tokenQueryKeys.holdings.all,
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
