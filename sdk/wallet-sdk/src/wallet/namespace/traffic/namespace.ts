// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Decimal } from 'decimal.js'
import { z } from 'zod'
import type { Ops } from '@canton-network/core-provider-ledger'
import {
    HOLDING_INTERFACE_ID,
    type HoldingView,
    type InstrumentId,
    type Transfer,
} from '@canton-network/core-token-standard'
import { TokenStandardService } from '@canton-network/core-token-standard-service'
import {
    TrafficPurchaser,
    type TrafficPurchaser_PurchaseCredits,
} from '@canton-network/core-traffic-purchase'
import type { PrettyContract } from '@canton-network/core-tx-parser'
import type { Numeric } from '@canton-network/core-types'
import type { SDKContext } from '../../init/types/context.js'
import type { SDKLogger } from '../../logger/logger.js'
import type { LedgerCommonSchemas } from '@canton-network/core-ledger-client-types'
import type { PreparedCommand } from '../transactions/types.js'
import { dedupeDisclosedContracts } from '../utils/disclosedContracts.js'
import { findAsset } from '../asset/index.js'
import { ParsedURL, parseAssets } from '../utils/url.js'
import { assetNeededFor, sumAmounts, wholeBytes } from './pricing.js'
import type {
    ContractIdString,
    PurchaseTrafficParams,
    TopUpTrafficParams,
    TrafficAccount,
} from './types.js'

/** Allowed delay of execute after prepare operation */
const DEFAULT_EXECUTE_BEFORE_MS = 10 * 60 * 1000

/**
 * Sets the registry request's requestedAt to 60 seconds before now,
 * allowing for clock differences with the participant.
 *
 * The ledger transfer uses ledger time, so this offset only affects the registry request
 */
const REQUESTED_AT_SKEW_MS = 60_000

/**
 * The registry's choice context, as the choice expects it.
 *
 */
type TransferExtraArgs = TrafficPurchaser_PurchaseCredits['transferExtraArgs']

/**
 * What `purchaseTraffic` needs on top of the base context: a registry to ask how
 * a payment would settle, and a way to read the buyer's holdings.
 *
 */
export type TrafficPurchaseContext = SDKContext & {
    tokenStandardService: TokenStandardService
    registryUrls: ParsedURL[]
}

/**
 * Traffic accounting on a Canton participant, and buying traffic on-ledger.
 *
 * The `/v2/traffic/*` endpoints behind `getTraffic`/`topUpTraffic` are only
 * served when the participant runs with `traffic-enforcement.enabled = true`;
 * 404 is returned otherwise.
 */
export class TrafficAccountNamespace {
    private readonly logger: SDKLogger

    // The namespace is only built via `sdk.extend({ traffic })`, which always
    // supplies the registry-bearing context, so it is required here rather than
    // detected at runtime.
    constructor(private readonly ctx: TrafficPurchaseContext) {
        this.logger = ctx.logger.child({ namespace: 'TrafficAccountNamespace' })
    }

    /**
     * Current traffic balance of an account.
     *
     * Needs `ActAs` or `ExecuteAs` rights on the party the account id names.
     */
    public async getTraffic(accountId: string): Promise<TrafficAccount> {
        this.logger.debug({ accountId }, 'Fetching traffic account')

        return this.ctx.ledgerProvider.request<Ops.GetV2TrafficAccountsAccountId>(
            {
                method: 'ledgerApi',
                params: {
                    resource: '/v2/traffic/accounts/{account-id}',
                    requestMethod: 'get',
                    path: { 'account-id': accountId },
                },
            }
        )
    }

    /**
     * Applies a balance delta to an account, and reports the state it came to.
     *
     * Admin-only, and off-ledger: this moves the participant's own accounting,
     * so nothing about it is recorded on the ledger.
     */
    public async topUpTraffic(
        params: TopUpTrafficParams
    ): Promise<TrafficAccount> {
        const { accountId, balanceDelta } = params
        const deduplicationId = params.deduplicationId ?? crypto.randomUUID()

        this.logger.debug(
            { accountId, balanceDelta, deduplicationId },
            'Topping up traffic account'
        )

        const updated =
            await this.ctx.ledgerProvider.request<Ops.PostV2TrafficAccounts>({
                method: 'ledgerApi',
                params: {
                    resource: '/v2/traffic/accounts',
                    requestMethod: 'post',
                    body: { accountId, balanceDelta, deduplicationId },
                },
            })

        return updated.response
    }

    /**
     * Builds the exercise that buys traffic from a paymaster, paying with
     * token-standard holdings, at the ledger conversion rate.
     *
     *
     *
     */
    public async purchaseTraffic(
        params: PurchaseTrafficParams
    ): Promise<PreparedCommand<'ExerciseCommand'>> {
        const executeBefore =
            params.executeBefore ??
            new Date(Date.now() + DEFAULT_EXECUTE_BEFORE_MS)

        const asset = await this.resolveAsset(
            params.instrumentId,
            params.registryUrl
        )
        const instrumentId: InstrumentId = {
            admin: asset.admin,
            id: asset.id,
        }

        const { holdingCids, assetAmount } = await this.priceThePurchase(
            params,
            instrumentId
        )

        this.logger.debug(
            {
                purchaser: params.purchaser,
                targetAccount: params.targetAccount,
                assetAmount,
                trafficAmount: params.trafficAmount,
                holdings: holdingCids.length,
            },
            'Pricing a traffic purchase'
        )

        const factory = await this.resolveTransferFactory({
            params,
            instrumentId,
            registryUrl: asset.registryUrl,
            // The generated contract-id type is branded; a caller only ever has
            // the plain string the ledger reported.
            holdingCids: holdingCids as unknown as Transfer['inputHoldingCids'],
            assetAmount,
            executeBefore,
        })

        const choiceArgument: TrafficPurchaser_PurchaseCredits = {
            purchaser: params.purchaser,
            // The model's `AccountId` is an opaque record wrapping the id; the
            // ledger re-validates it (non-empty, at most 255 UTF-16 units).
            targetAccount: { value: params.targetAccount },
            // The generated contract-id types are branded, and a caller only
            // ever has the plain string the ledger reported.
            conversionRateCid:
                params.conversionRateCid as TrafficPurchaser_PurchaseCredits['conversionRateCid'],
            holdingCids:
                holdingCids as unknown as TrafficPurchaser_PurchaseCredits['holdingCids'],
            transferFactoryCid:
                factory.factoryId as TrafficPurchaser_PurchaseCredits['transferFactoryCid'],
            // A Daml `Optional` is the value itself, or null for `None`;
            // `None` is what tells the choice to spend the holdings in full.
            requestedTrafficAmount: params.trafficAmount ?? null,
            executeBefore: executeBefore.toISOString(),
            transferExtraArgs: {
                context: { values: factory.contextValues },
                meta: { values: {} },
            },
        }

        return [
            {
                ExerciseCommand: {
                    templateId: TrafficPurchaser.templateId,
                    contractId: params.trafficPurchaserCid,
                    choice: TrafficPurchaser.TrafficPurchaser_PurchaseCredits
                        .choiceName,
                    choiceArgument,
                },
            },
            // The paymaster's set and the registry's choice context overlap in
            // practice -- both can name the same instrument configuration --
            // and the participant rejects a contract disclosed twice.
            dedupeDisclosedContracts([
                ...(params.disclosedContracts ?? []),
                ...factory.disclosedContracts,
            ]),
        ]
    }

    public async setup(): Promise<never> {
        this.ctx.error.throw({
            message: 'traffic.setup is not implemented yet',
            type: 'SDKOperationUnsupported',
        })
    }

    /**
     * Runs a `pricing.ts` calculation, reporting a malformed figure as an
     * `SDKError`.
     *
     * That module is pure by design -- it holds no SDK context -- so it rejects
     * a `Decimal` it cannot parse, or a non-positive rate, with a plain `Error`.
     * Every other failure this namespace produces goes through
     * `ctx.error.throw`, so the translation belongs here rather than leaving a
     * caller to handle two kinds of error from one method.
     */
    private computeDecimal<T>(compute: () => T): T {
        try {
            return compute()
        } catch (originalError) {
            return this.ctx.error.throw({
                message:
                    originalError instanceof Error
                        ? originalError.message
                        : String(originalError),
                type: 'BadRequest',
                originalError,
            })
        }
    }

    /** Resolve the instrument's AssetBody. */
    private async resolveAsset(
        instrumentId: string,
        registryUrl: PurchaseTrafficParams['registryUrl']
    ) {
        const purchaseCtx = this.ctx
        const assets = parseAssets(
            this.ctx,
            await purchaseCtx.tokenStandardService.registriesToAssets(
                purchaseCtx.registryUrls
            )
        )

        return findAsset(
            assets,
            instrumentId,
            this.ctx.error,
            new ParsedURL(this.ctx, registryUrl)
        )
    }

    /**
     * The holdings to spend and cost for a given traffic amount.
     */
    private async priceThePurchase(
        params: PurchaseTrafficParams,
        instrumentId: InstrumentId
    ): Promise<{ holdingCids: ContractIdString[]; assetAmount: Numeric }> {
        const purchaseCtx = this.ctx
        if (params.trafficAmount !== undefined) {
            const { trafficAmount, conversionRate } = params

            if (
                this.computeDecimal(() => wholeBytes(trafficAmount)) !==
                trafficAmount
            ) {
                this.ctx.error.throw({
                    message:
                        `${trafficAmount} is not a whole number of bytes. Traffic is ` +
                        'counted in whole bytes, and the model rejects a fractional request.',
                    type: 'BadRequest',
                })
            }

            const assetAmount = this.computeDecimal(() =>
                assetNeededFor(trafficAmount, conversionRate)
            )
            // With `inputUtxos` named this returns them as given -- unfiltered
            // and unchecked against the cost, the way `token.transfer.create`
            // also behaves. The model re-validates ownership, instrument and
            // sufficiency, so `prepare` is what rejects a bad selection.
            const holdingCids =
                await purchaseCtx.tokenStandardService.core.getInputHoldingsCids(
                    {
                        sender: params.purchaser,
                        instrumentAdmin: instrumentId.admin,
                        instrumentId: instrumentId.id,
                        inputUtxos: params.inputUtxos ?? [],
                        amount: new Decimal(assetAmount),
                    }
                )
            return { holdingCids, assetAmount }
        }

        const spendable = await this.spendableHoldings(params, instrumentId)
        if (spendable.length === 0) {
            this.ctx.error.throw({
                message: params.inputUtxos?.length
                    ? `None of the holdings named in inputUtxos are spendable ${instrumentId.id} ` +
                      `holdings owned by ${params.purchaser}.`
                    : `${params.purchaser} owns no spendable ${instrumentId.id} holdings to ` +
                      'pay with.',
                type: 'NotFound',
            })
        }

        return {
            holdingCids: spendable.map((holding) => holding.contractId),
            assetAmount: this.computeDecimal(() =>
                sumAmounts(
                    spendable.map(
                        (holding) => holding.interfaceViewValue.amount
                    )
                )
            ),
        }
    }

    /**
     * The purchaser's unlocked holdings of one instrument, narrowed to the ones
     * the caller named.
     *
     * Locked holdings are ignored. `ConversionRate_ValidateAssets` accepts a
     * lock that has expired, but only the ledger knows the time that is judged
     * against, so offering one risks a rejection for a holding that was never
     * needed.
     */
    private async spendableHoldings(
        params: PurchaseTrafficParams,
        instrumentId: InstrumentId
    ): Promise<PrettyContract<HoldingView>[]> {
        const purchaseCtx = this.ctx
        const now = new Date()
        const holdings =
            await purchaseCtx.tokenStandardService.listContractsByInterface<HoldingView>(
                HOLDING_INTERFACE_ID,
                params.purchaser
            )

        // `CoreService` is internal to core-token-standard-service, so this
        // repeats its instrument filter rather than reaching into the package.
        const unlockedHoldings = holdings.filter(
            (holding) =>
                !TokenStandardService.isHoldingLocked(holding, now) &&
                holding.interfaceViewValue.instrumentId.id ===
                    instrumentId.id &&
                holding.interfaceViewValue.instrumentId.admin ===
                    instrumentId.admin
        )

        const requested = params.inputUtxos
        if (requested === undefined || requested.length === 0) {
            return unlockedHoldings
        }
        return unlockedHoldings.filter((holding) =>
            requested.includes(holding.contractId)
        )
    }

    /**
     * The registry checks the same transfer that `TrafficPurchaser_PurchaseCredits`
     * will use, so it prices the right context. We build the choice arguments here
     * because the token-standard builder adds a memo that `emptyMetadata` doesn't include.
     */
    private async resolveTransferFactory(options: {
        params: PurchaseTrafficParams
        instrumentId: InstrumentId
        registryUrl: URL
        holdingCids: Transfer['inputHoldingCids']
        assetAmount: Numeric
        executeBefore: Date
    }): Promise<{
        factoryId: ContractIdString
        contextValues: TransferExtraArgs['context']['values']
        disclosedContracts: LedgerCommonSchemas['DisclosedContract'][]
    }> {
        const {
            params,
            instrumentId,
            registryUrl,
            holdingCids,
            assetAmount,
            executeBefore,
        } = options
        const purchaseCtx = this.ctx
        const transfer: Transfer = {
            sender: params.purchaser,
            receiver: params.paymasterReceiver,
            amount: assetAmount,
            instrumentId,
            requestedAt: new Date(
                Date.now() - REQUESTED_AT_SKEW_MS
            ).toISOString(),
            executeBefore: executeBefore.toISOString(),
            inputHoldingCids: holdingCids,
            meta: { values: {} },
        }

        const { factoryId, transferKind, choiceContext } =
            await purchaseCtx.tokenStandardService.transfer.fetchTransferFactoryChoiceContext(
                registryUrl,
                {
                    expectedAdmin: instrumentId.admin,
                    transfer,
                    extraArgs: {
                        context: { values: {} },
                        meta: { values: {} },
                    },
                }
            )

        if (transferKind === 'offer') {
            this.ctx.error.throw({
                message:
                    `The registry at ${registryUrl} would settle this payment as an offer ` +
                    'rather than a transfer, so it would not be paid in one step and the ' +
                    'purchase would be rejected. The receiver ' +
                    `${params.paymasterReceiver} needs to pre-approve direct transfers of ` +
                    `${instrumentId.id}.`,
                type: 'BadRequest',
            })
        }

        return {
            factoryId,
            contextValues: contextValuesOf(choiceContext.choiceContextData),
            disclosedContracts: choiceContext.disclosedContracts,
        }
    }
}

const choiceContextSchema = z.object({
    values: z.record(
        z.string(),
        z.custom<TransferExtraArgs['context']['values'][string]>()
    ),
})

function contextValuesOf(
    choiceContextData: unknown
): TransferExtraArgs['context']['values'] {
    const parsed = choiceContextSchema.safeParse(choiceContextData)
    return parsed.success ? parsed.data.values : {}
}
