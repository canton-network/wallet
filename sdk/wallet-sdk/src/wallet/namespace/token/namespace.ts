// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
    TokenStandardService,
    AssetBody,
} from '@canton-network/core-token-standard-service'
import type { PrettyTransactions } from '@canton-network/core-tx-parser'
import type { PartyId } from '@canton-network/core-types'

import type { SDKContext } from '../../init/types/context.ts'
import { findAsset } from '../asset/index.ts'
import { ParsedURL, type URLInput, parseAssets } from '../utils/url.ts'
import { AllocationNamespace } from './allocation/index.ts'
import { TransferNamespace } from './transfer/index.ts'
import { UtxoNamespace } from './utxos/index.ts'
import { TokenV2Namespace } from './v2/namespace.ts'

export type TokenNamespaceConfig = {
    tokenStandardService: TokenStandardService
    registryUrls: ParsedURL[]
    validatorParty?: PartyId
    commonCtx: SDKContext
}

export class TokenNamespace {
    public readonly v1: {
        readonly transfer: TransferNamespace
        readonly allocation: AllocationNamespace
        readonly utxos: UtxoNamespace
    }
    public readonly v2: TokenV2Namespace
    constructor(private readonly tokenContext: TokenNamespaceConfig) {
        const transfer = new TransferNamespace(tokenContext)
        this.v1 = {
            transfer,
            allocation: new AllocationNamespace(tokenContext),
            utxos: new UtxoNamespace(tokenContext, transfer),
        }
        this.v2 = new TokenV2Namespace(tokenContext)
    }

    /**@deprecated Use `sdk.token.v1.transfer`. Same behavior, the unversioned namespace will be removed in a future release. */
    get transfer(): TransferNamespace {
        return this.v1.transfer
    }

    /**@deprecated Use `sdk.token.v1.allocation`. Same behavior, the unversioned namespace will be removed in a future release. */
    get allocation(): AllocationNamespace {
        return this.v1.allocation
    }

    /**@deprecated Use `sdk.token.v1.utxos`. Same behavior, the unversioned namespace will be removed in a future release. */
    get utxos(): UtxoNamespace {
        return this.v1.utxos
    }
    /**
     * Lists all holdings for a specified party
     * @returns A promise that resolves to an array of holdings
     */
    async holdings(params: {
        partyId: PartyId
        afterOffset?: number
        beforeOffset?: number
    }): Promise<PrettyTransactions> {
        return await this.tokenContext.tokenStandardService.listHoldingTransactions(
            params.partyId,
            params.afterOffset,
            params.beforeOffset
        )
    }

    /** Gets transaction info parsed in a way relevant to token standard transfer flows
     * @param updateId id of queried transaction
     * @param partyId for transaction
     * @returns A promise that resolves to a transaction
     */
    async transactionsById(params: { updateId: string; partyId: PartyId }) {
        return await this.tokenContext.tokenStandardService.getTransactionById(
            params.updateId,
            params.partyId
        )
    }

    /**
     * Lists the token-standard assets served by the registries this namespace
     * was configured with (the `registries` passed to `token` in `SDK.create`).
     *
     * Unlike the `asset` namespace — which resolves its list once when the SDK
     * is created — this queries the configured registries on each call, so it
     * also works with registries that only come online after the SDK exists.
     */
    async assets(): Promise<AssetBody[]> {
        return parseAssets(
            this.tokenContext.commonCtx,
            await this.tokenContext.tokenStandardService.registriesToAssets(
                this.tokenContext.registryUrls
            )
        )
    }

    /**
     * Resolves a single asset — including the `registryUrl` that serves it — by
     * instrument id from the configured registries. Provide `registryUrl` to
     * disambiguate when the same instrument id is served by more than one
     * registry.
     */
    async find(
        instrumentId: string,
        registryUrl?: ParsedURL | URLInput
    ): Promise<AssetBody> {
        let resolvedRegistryUrl: ParsedURL | undefined

        if (registryUrl) {
            if (registryUrl instanceof ParsedURL) {
                resolvedRegistryUrl = registryUrl
            } else {
                resolvedRegistryUrl = new ParsedURL(
                    this.tokenContext.commonCtx,
                    registryUrl
                )
            }
        }

        return findAsset(
            await this.assets(),
            instrumentId,
            this.tokenContext.commonCtx.error,
            resolvedRegistryUrl
        )
    }
}
