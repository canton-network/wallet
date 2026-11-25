// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PartyId } from '@canton-network/core-types'
import {
    resolveTransferVersion,
    type TokenClient,
    type TransferChoiceParams,
} from '@canton-network/core-wallet-ui-components/react/token'
import type { PreparedCommand } from '@canton-network/wallet-sdk'
import { submitViaProvider } from '@lib/submit'

import { fetchRegistryInstruments } from '../hooks/useInstruments.ts'
import type { ReadyWalletSdk } from '../hooks/useWalletSdk.ts'

type TransferChoice = 'accept' | 'reject' | 'withdraw'

/**
 * The shared token hooks' client: the wallet SDK, with the transactions it
 * builds sent to the wallet through the dApp provider.
 */
export function createPortfolioTokenClient({
    sdk,
    registryUrls,
    reachableRegistryUrls,
    onSubmitted,
}: {
    sdk: ReadyWalletSdk
    registryUrls: ReadonlyMap<PartyId, string>
    reachableRegistryUrls: ReadonlyMap<PartyId, string>
    /** After a transaction the client sent succeeds. */
    onSubmitted: () => void
}): TokenClient {
    const submit = async (command: PreparedCommand, partyId: PartyId) => {
        await submitViaProvider(command, partyId)
        onSubmitted()
    }

    const registryUrlFor = (admin: PartyId): string => {
        const registryUrl = registryUrls.get(admin)
        if (!registryUrl) {
            throw new Error(`no registry URL for admin ${admin}`)
        }
        if (reachableRegistryUrls.get(admin) !== registryUrl) {
            throw new Error(`Registry for admin ${admin} is not reachable`)
        }
        return registryUrl
    }

    const exercise =
        (choice: TransferChoice) =>
        async (params: TransferChoiceParams): Promise<void> => {
            const registryUrl = new URL(
                registryUrlFor(params.instrumentId.admin)
            )
            const preparedCommand: PreparedCommand =
                params.version === 'v2'
                    ? await sdk.token.v2.transfer[choice](
                          params.contractId,
                          params.actors ?? [params.partyId],
                          registryUrl
                      )
                    : await sdk.token.v1.transfer[choice]({
                          transferInstructionCid: params.contractId,
                          registryUrl,
                      })
            await submit(preparedCommand, params.partyId)
        }

    return {
        token: {
            instruments: async () =>
                (
                    await Promise.all(
                        Array.from(registryUrls, ([admin, url]) =>
                            fetchRegistryInstruments(admin, url)
                        )
                    )
                ).flat(),
            transfer: {
                async create(args) {
                    const registryUrl = registryUrlFor(args.instrumentId.admin)
                    const asset = await sdk.token.find(
                        args.instrumentId.id,
                        registryUrl
                    )
                    const version = resolveTransferVersion(
                        asset,
                        args.tokenStandardVersion
                    )

                    const params = {
                        sender: args.sender,
                        recipient: args.receiver,
                        amount: args.amount,
                        instrumentId: args.instrumentId.id,
                        registryUrl: new URL(registryUrl),
                        expirationDate: new Date(args.expiry),
                        memo: args.memo,
                    }

                    const preparedCommand =
                        version.used === 'v2'
                            ? await sdk.token.v2.transfer.create(params)
                            : await sdk.token.v1.transfer.create(params)
                    await submit(preparedCommand, args.sender)
                },
                accept: exercise('accept'),
                reject: exercise('reject'),
                withdraw: exercise('withdraw'),
            },
            v1: {
                utxos: { list: (params) => sdk.token.v1.utxos.list(params) },
                transfer: {
                    pending: (partyId) =>
                        sdk.token.v1.transfer.pending(partyId),
                },
            },
            v2: {
                utxos: { list: (params) => sdk.token.v2.utxos.list(params) },
                transfer: {
                    pending: (partyId) =>
                        sdk.token.v2.transfer.pending(partyId),
                },
            },
        },
    }
}
