// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PartyId } from '@canton-network/core-types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { TokenClient, TokenStandardVersion } from './client.ts'
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

/**
 * Calls the client's method for the choice directly: the extension's client
 * is a messaging proxy, where reading `.call` would name another method.
 */
export async function exerciseTransfer(
    client: TokenClient,
    args: ExerciseTransferArgs
): Promise<void> {
    const { transfer } = client.token
    const params = {
        partyId: args.party,
        contractId: args.contractId,
        instrumentId: args.instrumentId,
        version: args.version,
        actors: args.actors,
    }
    switch (args.instructionChoice) {
        case 'Withdraw':
            return transfer.withdraw(params)
        case 'Accept':
            if (transfer.accept) return transfer.accept(params)
            break
        case 'Reject':
            if (transfer.reject) return transfer.reject(params)
            break
    }
    throw new Error(
        `Unsupported instruction choice: ${String(args.instructionChoice)}`
    )
}

export const useExerciseTransfer = () => {
    const { client } = useTokenContext()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (args: ExerciseTransferArgs) => {
            if (!client) {
                throw new Error('The token client is not ready')
            }
            await exerciseTransfer(client, args)
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
