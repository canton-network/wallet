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
    TrafficPurchaseApiError,
    TrafficPurchaseClient,
    TrafficPurchaser,
    type ConversionRateWithDisclosures,
    type TrafficPurchaser_PurchaseCredits,
    type TrafficPurchaserWithDisclosures,
} from '@canton-network/core-traffic-purchase'
import type { AccessTokenProvider } from '@canton-network/core-wallet-auth'
import type { PrettyContract } from '@canton-network/core-tx-parser'
import type { Numeric, PartyId } from '@canton-network/core-types'
import type { SDKContext } from '../../init/types/context.js'
import type { SDKLogger } from '../../logger/logger.js'
import type { LedgerCommonSchemas } from '@canton-network/core-ledger-client-types'
import type { PreparedCommand } from '../transactions/types.js'
import { dedupeDisclosedContracts } from '../utils/disclosedContracts.js'
import { findAsset } from '../asset/index.js'
import { ParsedURL, parseAssets } from '../utils/url.js'
import {
    assetNeededFor,
    damlDecimal,
    sumAmounts,
    wholeBytes,
} from './pricing.js'
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
    /**
     * What authenticates against a paymaster's off-ledger API.
     *
     * Kept apart from the token registries' provider because a paymaster URL is
     * a *per-call* parameter: reusing the configured bearer token would send it
     * to whatever host a caller happens to name. Defaults to sending none.
     */
    paymasterAuth: AccessTokenProvider
}

/**
 * The paymaster's half of a purchase, however it was arrived at.
 *
 * What `purchaseTraffic` works with once a caller's params and a paymaster's
 * answers have been reconciled, so nothing downstream has to know which of the
 * two a figure came from.
 */
type PaymasterTerms = {
    trafficPurchaserCid: ContractIdString
    conversionRateCid: ContractIdString
    paymasterReceiver: PartyId
    /** The rate to price at. Present exactly when a `trafficAmount` needs pricing. */
    conversionRate?: Numeric
    disclosedContracts: LedgerCommonSchemas['DisclosedContract'][]
}

/** What a paymaster answered, when there was one to ask. */
type ServedTerms = {
    purchaser?: TrafficPurchaserWithDisclosures
    rate?: ConversionRateWithDisclosures
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
     * token-standard holdings.
     *
     * Prices the purchase, asks the registry how it would settle the payment,
     * and returns the `TrafficPurchaser_PurchaseCredits` command together with
     * every contract the submission has to disclose. Nothing is submitted here:
     * the buyer signs for itself, so the caller drives
     * `sdk.ledger.prepare(...).sign(key).execute(...)`.
     *
     * The paymaster's half of the purchase -- its `TrafficPurchaser`, the
     * `ConversionRate` and its rate, the receiver, and the disclosures for both
     * contracts -- is either stated by the caller or, given a
     * `paymasterApiUrl`, read off the paymaster's own off-ledger API. The
     * disclosures are what makes the second worth having: the paymaster is the
     * sole signatory of both templates, so a buyer cannot produce their blobs
     * and they otherwise have to travel out of band. A stated value always
     * wins over a served one, so a caller can pin the contract a disclosure it
     * already holds names.
     *
     * Preparing interprets the transaction, so everything the Daml model refuses
     * -- an expired rate, a purchase over `maxTrafficPerPurchase`, holdings the
     * buyer does not own -- is reported by `prepare`, before anything is signed.
     * Those invariants are therefore deliberately not re-checked here.
     *
     * The purchase credits the traffic on-ledger: `TrafficPurchaser_PurchaseCredits`
     * creates a `TrafficCredit` for `targetAccount`, which the paymaster's
     * participant TEA reads off the transaction tree. The returned
     * `ContractId TrafficCredit` identifies that credit.
     */
    public async purchaseTraffic(
        params: PurchaseTrafficParams
    ): Promise<PreparedCommand<'ExerciseCommand'>> {
        const executeBefore =
            params.executeBefore ??
            new Date(Date.now() + DEFAULT_EXECUTE_BEFORE_MS)

        const paymasterApi =
            params.paymasterApiUrl === undefined
                ? undefined
                : new TrafficPurchaseClient(
                      new ParsedURL(this.ctx, params.paymasterApiUrl).href,
                      this.logger,
                      this.ctx.paymasterAuth
                  )

        // Started together rather than one after the other: the purchaser
        // endpoint says nothing about the instrument, so it does not have to
        // wait for the registry. `Promise.all` and not a promise awaited later,
        // so a paymaster that fails while `resolveAsset` is also failing does
        // not surface as an unhandled rejection.
        const [asset, servedPurchaser] = await Promise.all([
            this.resolveAsset(params.instrumentId, params.registryUrl),
            paymasterApi === undefined
                ? undefined
                : this.withErrorHandling(
                      () => paymasterApi.getTrafficPurchaser(),
                      `The paymaster at ${paymasterApi.url} is not set up to sell traffic: ` +
                          'it has no TrafficPurchaser.'
                  ),
        ])
        const instrumentId: InstrumentId = {
            admin: asset.admin,
            id: asset.id,
        }

        // Only now, and not alongside the above: a rate is keyed by the
        // instrument's `{ admin, id }` pair, and the admin is whatever the
        // token registry just said it is. Guessing it to save a round trip
        // would be guessing which instrument is being paid with.
        const servedRate =
            paymasterApi === undefined
                ? undefined
                : await this.withErrorHandling(
                      () => paymasterApi.getConversionRate(instrumentId),
                      `The paymaster at ${paymasterApi.url} does not sell traffic for ` +
                          `${instrumentId.id} administered by ${instrumentId.admin}.`
                  )

        const terms = this.resolvePaymasterTerms(params, instrumentId, {
            ...(servedPurchaser && { purchaser: servedPurchaser }),
            ...(servedRate && { rate: servedRate }),
        })

        const { holdingCids, assetAmount } = await this.priceThePurchase(
            params,
            terms,
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
            terms,
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
                terms.conversionRateCid as TrafficPurchaser_PurchaseCredits['conversionRateCid'],
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
                    contractId: terms.trafficPurchaserCid,
                    choice: TrafficPurchaser.TrafficPurchaser_PurchaseCredits
                        .choiceName,
                    choiceArgument,
                },
            },
            // The paymaster's set and the registry's choice context overlap in
            // practice -- both can name the same instrument configuration --
            // and the participant rejects a contract disclosed twice.
            dedupeDisclosedContracts([
                ...terms.disclosedContracts,
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
     * Runs a read against a paymaster and reports any failure as an `SDKError`.
     *
     * The HTTP status determines the error type. A failure without a status,
     * such as an unreachable host, is reported as `Unexpected`.
     *
     * @returns The result of the read.
     * @throws {SDKError} `NotFound` for a 404, `Unauthenticated` for a 401,
     * `Unauthorized` for a 403, and `Unexpected` for anything else.
     */
    private async withErrorHandling<T>(
        read: () => Promise<T>,
        notFoundMessage: string
    ): Promise<T> {
        try {
            return await read()
        } catch (originalError) {
            const status =
                originalError instanceof TrafficPurchaseApiError
                    ? originalError.status
                    : undefined

            if (status === 404) {
                return this.ctx.error.throw({
                    message: notFoundMessage,
                    type: 'NotFound',
                    originalError,
                })
            }

            const genericErrorMessage =
                originalError instanceof Error
                    ? originalError.message
                    : String(originalError)

            return this.ctx.error.throw({
                message:
                    originalError instanceof TrafficPurchaseApiError
                        ? originalError.messageDetails()
                        : genericErrorMessage,
                type:
                    status === 401
                        ? 'Unauthenticated'
                        : status === 403
                          ? 'Unauthorized'
                          : 'Unexpected',
                originalError,
            })
        }
    }

    /**
     * Reconciles what the caller stated with what the paymaster served.
     *
     * The rule is one line long: a stated value wins, field by field, and
     * nothing is cross-checked against the served answer. Pinning a contract id
     * is the only way to buy against a disclosure already in hand, and a
     * paymaster that repriced since would otherwise make that impossible. An
     * incoherent set is not this method's business either: the ledger rejects
     * one, and `prepare` reports that before anything is signed -- on better
     * evidence than a paymaster's own reply about its own contracts.
     *
     * What is checked is only what this code then goes on to *use*: that the
     * rate is for the instrument being paid with, that it parses, and that
     * every term ended up with a value from somewhere.
     */
    private resolvePaymasterTerms(
        params: PurchaseTrafficParams,
        instrumentId: InstrumentId,
        served: ServedTerms
    ): PaymasterTerms {
        if (
            served.rate !== undefined &&
            (served.rate.instrumentId.admin !== instrumentId.admin ||
                served.rate.instrumentId.id !== instrumentId.id)
        ) {
            // Not an invariant check but an identity one: pricing at another
            // instrument's rate overpays silently, and nothing downstream --
            // the registry least of all -- would notice.
            this.ctx.error.throw({
                message:
                    `The paymaster at ${String(params.paymasterApiUrl)} answered with a rate ` +
                    `for ${served.rate.instrumentId.id} administered by ` +
                    `${served.rate.instrumentId.admin}, not the ${instrumentId.id} ` +
                    `administered by ${instrumentId.admin} that was asked for.`,
                type: 'Unexpected',
            })
        }

        const trafficPurchaserCid =
            params.trafficPurchaserCid ?? served.purchaser?.trafficPurchaserId
        const conversionRateCid =
            params.conversionRateCid ?? served.rate?.conversionRateId
        const paymasterReceiver =
            params.paymasterReceiver ?? served.purchaser?.paymasterReceiver

        this.requireTerm(trafficPurchaserCid, 'trafficPurchaserCid')
        this.requireTerm(conversionRateCid, 'conversionRateCid')
        this.requireTerm(paymasterReceiver, 'paymasterReceiver')

        this.warnOnStaleTerms(params, served.rate)

        return {
            trafficPurchaserCid,
            conversionRateCid,
            paymasterReceiver,
            // Only priced when a traffic amount has to be converted into a
            // cost. Spending holdings in full never consults a rate, so a
            // paymaster serving an unparseable one does not fail that call.
            ...(params.trafficAmount === undefined
                ? {}
                : {
                      conversionRate: this.rateToPriceAt(
                          params,
                          served.rate,
                          conversionRateCid
                      ),
                  }),
            // The caller's go last, because `dedupeDisclosedContracts` keeps
            // the last entry for a contract id -- so an explicitly passed blob
            // beats the served one, as every other stated value does.
            disclosedContracts: dedupeDisclosedContracts([
                ...(served.purchaser?.disclosedContracts ?? []),
                ...(served.rate?.disclosedContracts ?? []),
                ...(params.disclosedContracts ?? []),
            ]),
        }
    }

    /**
     * The rate to price a traffic amount at.
     *
     * Stated wins, as everywhere else. The one case this refuses is a caller
     * that pins a `conversionRateCid`, states no figure, and is served a rate
     * for a *different* contract: the purchase would be exercised against the
     * pinned contract and priced off another one, which is not a price at all.
     * That is "there is no figure to use", not a disagreement to arbitrate.
     */
    private rateToPriceAt(
        params: PurchaseTrafficParams,
        servedRate: ConversionRateWithDisclosures | undefined,
        conversionRateCid: ContractIdString
    ): Numeric {
        if (params.conversionRate !== undefined) return params.conversionRate

        if (servedRate === undefined) {
            return this.ctx.error.throw({
                message:
                    'conversionRate is required to buy a stated trafficAmount. Pass it, or ' +
                    'pass paymasterApiUrl so the rate can be read off the paymaster.',
                type: 'BadRequest',
            })
        }
        if (servedRate.conversionRateId !== conversionRateCid) {
            return this.ctx.error.throw({
                message:
                    `conversionRateCid names ${conversionRateCid}, but the paymaster is ` +
                    `selling at ${servedRate.conversionRateId}. Pass conversionRate as well ` +
                    'to say what the pinned contract prices at, or drop conversionRateCid to ' +
                    'buy at the one on offer.',
                type: 'BadRequest',
            })
        }
        // Parsed rather than trusted: this figure goes straight into
        // `assetNeededFor`, and `'1e6'` would otherwise become a real transfer
        // request for an amount nobody asked for.
        return this.computeDecimal(() =>
            damlDecimal(servedRate.conversionRate, 'the conversion rate')
        )
    }

    /** Reports a term that neither the caller nor the paymaster supplied. */
    private requireTerm(
        value: string | undefined,
        field: string
    ): asserts value is string {
        if (value === undefined) {
            this.ctx.error.throw({
                message:
                    `${field} is required, and neither the call nor the paymaster supplied ` +
                    'it. Pass it, or point paymasterApiUrl at a paymaster that reports it.',
                type: 'BadRequest',
            })
        }
    }

    /**
     * Notes a served rate that the ledger looks likely to refuse.
     *
     * Logged rather than thrown, deliberately. Both figures are the paymaster's
     * *off-ledger* view and are judged here against this machine's clock, so
     * refusing on them would be refusing on worse evidence than the ledger's --
     * which checks the same two things and reports them through `prepare`. The
     * warning only turns an opaque interpretation failure into something
     * greppable.
     */
    private warnOnStaleTerms(
        params: PurchaseTrafficParams,
        servedRate: ConversionRateWithDisclosures | undefined
    ): void {
        if (servedRate === undefined) return

        if (
            servedRate.expiresAt !== undefined &&
            Date.parse(servedRate.expiresAt) <= Date.now()
        ) {
            this.logger.warn(
                {
                    conversionRateCid: servedRate.conversionRateId,
                    expiresAt: servedRate.expiresAt,
                },
                'The paymaster served a conversion rate that has already expired; the ledger ' +
                    'will refuse to buy at it'
            )
        }

        if (
            params.trafficAmount !== undefined &&
            servedRate.maxTrafficPerPurchase !== undefined &&
            Number(params.trafficAmount) >
                Number(servedRate.maxTrafficPerPurchase)
        ) {
            this.logger.warn(
                {
                    trafficAmount: params.trafficAmount,
                    maxTrafficPerPurchase: servedRate.maxTrafficPerPurchase,
                },
                'The requested traffic exceeds the rate’s maxTrafficPerPurchase; the ' +
                    'ledger will refuse the purchase'
            )
        }
    }

    /**
     * The holdings to spend and what they cost, in the model's own two branches.
     *
     * Asked for a traffic amount, the cost is the asset needed for it at the
     * stated rate and holdings are selected to cover that. Asked for nothing, the
     * offered holdings are spent whole, so they have to be read for their
     * *amounts* rather than just their ids -- and the rate never enters it.
     */
    private async priceThePurchase(
        params: PurchaseTrafficParams,
        terms: PaymasterTerms,
        instrumentId: InstrumentId
    ): Promise<{ holdingCids: ContractIdString[]; assetAmount: Numeric }> {
        const purchaseCtx = this.ctx
        if (params.trafficAmount !== undefined) {
            const { trafficAmount } = params
            // Off the resolved terms rather than off `params`, because with a
            // `paymasterApiUrl` the figure may be the paymaster's.
            // `resolvePaymasterTerms` prices exactly this branch, so the
            // assertion only exists to fail loudly rather than silently if
            // that ever stops being true.
            const { conversionRate } = terms
            this.requireTerm(conversionRate, 'conversionRate')

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
        terms: PaymasterTerms
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
            terms,
            instrumentId,
            registryUrl,
            holdingCids,
            assetAmount,
            executeBefore,
        } = options
        const purchaseCtx = this.ctx
        const transfer: Transfer = {
            sender: params.purchaser,
            receiver: terms.paymasterReceiver,
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
                    `${terms.paymasterReceiver} needs to pre-approve direct transfers of ` +
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
