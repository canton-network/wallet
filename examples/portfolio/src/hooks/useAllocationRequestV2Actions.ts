// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useWalletSdk } from './useWalletSdk'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { PartyId } from '@canton-network/core-types'
import { useState } from 'react'
import { queryKeys } from './query-keys'
import type { AllocationRequestV2ActionItem } from '@components/types'
import { submitViaProvider } from '@lib/submit'
import { isSpecCovered } from '@utils/v2-allocation-items'

export type AcceptProgress =
    | { phase: 'idle' }
    | { phase: 'preparing' }
    | { phase: 'allocating'; done: number; total: number }
    | { phase: 'accepting' }

/**
 * Accepted: all party's specs are allocated and requested is accepted
 * Partial: Some specs were not allocated (either different authorizers or no reeachable registry). Request is still open
 */
export type AcceptResult =
    | { status: 'accepted'; allocated: number }
    | { status: 'partial'; allocated: number; skippedAdmins: PartyId[] }

/**
 * Accept and reject for v2 allocation requests
 */

export function useAllocationRequestV2Actions() {
    const { sdk } = useWalletSdk()
    const queryClient = useQueryClient()
    const [progress, setProgress] = useState<AcceptProgress>({ phase: 'idle' })

    const invalidate = (party: PartyId) => {
        void queryClient.invalidateQueries({
            queryKey:
                queryKeys.walletConnection.allocationRequests.forParty(party),
        })

        void queryClient.invalidateQueries({
            queryKey: queryKeys.walletConnection.allocations.forParty(party),
        })

        void queryClient.invalidateQueries({
            queryKey: queryKeys.walletConnection.holdings.all,
        })

        void queryClient.invalidateQueries({
            queryKey: queryKeys.walletConnection.transactionHistory.all,
        })
    }

    const accept = useMutation({
        mutationFn: async (
            item: AllocationRequestV2ActionItem
        ): Promise<AcceptResult> => {
            if (!sdk) throw new Error(`Wallet sdk not ready`)
            const party = item.currentPartyId as PartyId
            setProgress({ phase: 'preparing' })

            const [allocations, instructions] = await Promise.all([
                sdk.token.v2.allocation.pending(party),
                sdk.token.v2.allocation.instruction.pending(party),
            ])

            const existing = [...allocations, ...instructions].map(
                (c) => c.interfaceViewValue
            )
            const covered = (
                spec: AllocationRequestV2ActionItem['ownSpecs'][number]
            ) => isSpecCovered(spec, item.settlement, existing)

            if (item.ownSpecs.every(covered)) {
                setProgress({ phase: 'accepting' })
                await submitViaProvider(
                    await sdk.token.v2.allocation.request.prepareAccept({
                        request: item.request,
                        partyId: party,
                    }),
                    party
                )
                return { status: 'accepted', allocated: 0 }
            }

            //generate one command per spec of the party. skip specs whose admin has no registry
            const {
                allocate,
                accept: acceptCommand,
                skipped,
            } = await sdk.token.v2.allocation.request.acceptForParty({
                request: item.request,
                partyId: party,
            })

            const allocatedSpecs =
                item.request.interfaceViewValue.allocations.filter(
                    (s) =>
                        s.authorizer.owner === party &&
                        !skipped.includes(s.admin)
                )

            const toSubmit = allocate.filter(
                (_, i) => !covered(allocatedSpecs[i])
            )

            for (const [i, prepared] of toSubmit.entries()) {
                setProgress({
                    phase: 'allocating',
                    done: i,
                    total: toSubmit.length,
                })
                try {
                    await submitViaProvider(prepared, party)
                } catch (error) {
                    throw Error(
                        `Allocation ${i + 1} of ${toSubmit.length} failed. ${(error as Error).message}.`
                    )
                }
            }

            if (!acceptCommand) {
                return {
                    status: 'partial',
                    allocated: toSubmit.length,
                    skippedAdmins: skipped,
                }
            }

            setProgress({ phase: 'accepting' })
            try {
                await submitViaProvider(acceptCommand, party)
            } catch (error) {
                throw Error(
                    `Allocations were created, but accepting the request failed. Accept again to retry. ${(error as Error).message}.`
                )
            }

            return { status: 'accepted', allocated: toSubmit.length }
        },

        onSettled: (_result, _error, item) => {
            setProgress({ phase: 'idle' })
            invalidate(item.currentPartyId as PartyId)
        },
    })

    const reject = useMutation({
        mutationFn: async (item: AllocationRequestV2ActionItem) => {
            if (!sdk) throw new Error(`Wallet sdk not ready`)
            const party = item.currentPartyId as PartyId

            await submitViaProvider(
                await sdk.token.v2.allocation.request.reject({
                    request: item.request,
                    partyId: party,
                }),
                party
            )
        },
        onSettled: (_result, _error, item) => {
            invalidate(item.currentPartyId as PartyId)
        },
    })

    return { accept, reject, progress }
}
