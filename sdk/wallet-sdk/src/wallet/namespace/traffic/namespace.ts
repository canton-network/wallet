// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { v4 } from 'uuid'
import { Decimal } from 'decimal.js'
import type { Ops } from '@canton-network/core-provider-ledger'
import {
    HOLDING_INTERFACE_ID,
    type HoldingView,
    type InstrumentId,
    type Transfer,
} from '@canton-network/core-token-standard'
import {
    CoreService,
    TokenStandardService,
} from '@canton-network/core-token-standard-service'
import {
    ConversionRate,
    TrafficPurchaser,
    type TrafficPurchaser_PurchaseCredits,
} from '@canton-network/core-traffic-purchase'
import { ACSReader } from '@canton-network/core-acs-reader'
import type { PrettyContract } from '@canton-network/core-tx-parser'
import type { Numeric, PartyId } from '@canton-network/core-types'
import type { SDKContext } from '../../init/types/context.js'
import type { SDKLogger } from '../../logger/logger.js'
import type { LedgerCommonSchemas } from '@canton-network/core-ledger-client-types'
import type { PreparedCommand } from '../transactions/types.js'
import {
    dedupeDisclosedContracts,
    toDisclosedContract,
} from '../transactions/disclosure.js'
import { findAsset } from '../asset/index.js'
import { ParsedURL, parseAssets } from '../utils/url.js'
import { assetNeededFor, sumAmounts, wholeBytes } from './pricing.js'
import { assertSetupParams, planTrafficSetup, trafficSetupOf } from './setup.js'
import type {
    ActiveTrafficSetup,
    ContractIdString,
    PurchaseTrafficParams,
    SetupTrafficParams,
    TopUpTrafficParams,
    TrafficAccount,
    TrafficSetupPlan,
} from './types.js'

/** How long a purchase gives the registry to settle, when the caller says nothing. */
const DEFAULT_EXECUTE_BEFORE_MS = 10 * 60 * 1000

/**
 * How far in the past the transfer the registry is asked about says it was
 * requested.
 *
 * `requestedAt` must not be after the ledger effective time -- Amulet asserts
 * that to the microsecond -- and the clock this runs on is not the
 * participant's. A minute of slack is what splice's own tooling allows, and it
 * is the same figure `core-token-standard-service` uses.
 *
 * The figure only ever reaches the registry: the transfer the ledger settles is
 * built by `TrafficPurchaser_PurchaseCredits` with `requestedAt = getTime`, i.e.
 * the ledger effective time itself, so the assertion cannot fail on the ledger's
 * own figure.
 */
const REQUESTED_AT_SKEW_MS = 60_000

/**
 * The registry's choice context, as the choice expects it.
 *
 * Taken off the model's own choice type rather than from
 * `@canton-network/core-token-standard`: both packages carry their own copy of
 * the generated `AnyValue`, and being recursive the two are not interchangeable
 * to TypeScript even though they describe the same wire format. The one the
 * model was built against is the one that has to typecheck.
 */
type TransferExtraArgs = TrafficPurchaser_PurchaseCredits['transferExtraArgs']

/**
 * What `purchaseTraffic` needs on top of the base context: a registry to ask how
 * a payment would settle, and a way to read the buyer's holdings.
 *
 * Supplied by `sdk.extend({ traffic: ... })`. The base namespace is built
 * without it, so `getTraffic` and `topUpTraffic` -- which are pure Ledger API
 * calls -- cost a caller no registry configuration.
 */
export type TrafficPurchaseContext = {
    tokenStandardService: TokenStandardService
    registryUrls: ParsedURL[]
}

/**
 * Traffic accounting on a Canton participant, and buying traffic on-ledger.
 *
 * The `/v2/traffic/*` endpoints behind `getTraffic`/`topUpTraffic` are only
 * served when the participant runs with `traffic-enforcement.enabled = true`;
 * against one that does not, they answer 404.
 */
export class TrafficAccountNamespace {
    private readonly logger: SDKLogger
    private readonly acsReader: ACSReader

    constructor(
        private readonly ctx: SDKContext,
        private readonly purchaseCtx?: TrafficPurchaseContext
    ) {
        this.logger = ctx.logger.child({ namespace: 'TrafficAccountNamespace' })
        this.acsReader = new ACSReader(ctx.ledgerProvider)
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
        const deduplicationId = params.deduplicationId ?? v4()

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
     * Preparing interprets the transaction, so everything the Daml model refuses
     * -- an expired rate, a purchase over `maxTrafficPerPurchase`, holdings the
     * buyer does not own -- is reported by `prepare`, before anything is signed.
     * Those invariants are therefore deliberately not re-checked here.
     *
     * The traffic itself is not credited by the purchase. The choice records what
     * was bought; applying it to a traffic account is a separate off-ledger step
     * (`topUpTraffic`) that the wallet provider takes, keyed on `requestId`.
     */
    public async purchaseTraffic(
        params: PurchaseTrafficParams
    ): Promise<PreparedCommand<'ExerciseCommand'>> {
        const purchaseCtx = this.purchaseCtx
        if (purchaseCtx === undefined) {
            this.ctx.error.throw({
                message:
                    'traffic.purchaseTraffic needs a registry to price the payment against. ' +
                    'Call sdk.extend({ traffic: { registries, auth } }) first.',
                type: 'SDKOperationUnsupported',
            })
        }

        const requestId = params.requestId ?? v4()
        if (requestId === '') {
            this.ctx.error.throw({
                message:
                    'requestId must not be empty: it is what makes crediting the traffic ' +
                    'exactly-once, and the model rejects a purchase without one.',
                type: 'BadRequest',
            })
        }

        const executeBefore =
            params.executeBefore ??
            new Date(Date.now() + DEFAULT_EXECUTE_BEFORE_MS)

        const asset = await this.resolveAsset(
            purchaseCtx,
            params.instrumentId,
            params.registryUrl
        )
        const instrumentId: InstrumentId = {
            admin: asset.admin,
            id: asset.id,
        }

        const { holdingCids, assetAmount } = await this.priceThePurchase(
            purchaseCtx,
            params,
            instrumentId
        )

        this.logger.debug(
            {
                purchaser: params.purchaser,
                requestId,
                assetAmount,
                trafficAmount: params.trafficAmount,
                holdings: holdingCids.length,
            },
            'Pricing a traffic purchase'
        )

        const factory = await this.resolveTransferFactory(
            purchaseCtx,
            params,
            instrumentId,
            asset.registryUrl.href,
            holdingCids,
            assetAmount,
            executeBefore
        )

        const choiceArgument: TrafficPurchaser_PurchaseCredits = {
            purchaser: params.purchaser,
            targetUser: {
                accountId: params.targetUser.accountId,
                scope: params.targetUser.scope ?? '',
            },
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
            requestId,
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

    /**
     * Works out what a paymaster's ledger needs in order to sell traffic, and
     * returns the commands that get it there.
     *
     * Idempotent by design. The ledger is meant to carry one `TrafficPurchaser`
     * per paymaster and one `ConversionRate` per instrument that paymaster
     * accepts, so this reads what is already there and plans only the
     * difference: what is missing is created, a rate whose terms have changed is
     * repriced through `ConversionRate_Update`, and one that already matches is
     * left alone. Calling it twice with the same params plans nothing at all;
     * the result says which of the three applies to each rate, since repricing
     * replaces a contract and invalidates any disclosure a buyer cached for it.
     *
     * Convergence is scoped to what the call names. Each `ConversionRateSpec` is
     * the whole intended terms of its rate rather than a patch -- a field left
     * out is set to `None` -- while an instrument no spec mentions is not
     * touched at all, so a partial call cannot withdraw an instrument from sale.
     *
     * Nothing is submitted here: the paymaster signs for itself, so the caller
     * drives `sdk.ledger.internal.submit({ commands, actAs: [paymaster] })` for
     * a participant-hosted paymaster, or
     * `sdk.ledger.prepare({ partyId: paymaster, commands })` for an external
     * one. Everything planned goes on in a single transaction, so a setup takes
     * effect whole or not at all.
     *
     * The model's DAR must already be vetted on the participant, and the
     * paymaster party must already exist -- deploying a package and allocating
     * a party are an operator's steps (`sdk.ledger.dar.upload`,
     * `sdk.party.internal.allocate`), not this method's.
     *
     * What it cannot do is serialise itself against another setup running at the
     * same moment. A paymaster that ends up with two purchasers, or an
     * instrument with two live rates, is reported with both contract ids named
     * rather than resolved by guessing -- see the note in `setup.ts`.
     */
    public async setup(params: SetupTrafficParams): Promise<TrafficSetupPlan> {
        const { paymaster } = params
        // Refused before the read, so a call that could never converge does not
        // spend a round trip on an ACS it is not going to use.
        this.rethrowAsBadRequest(() => assertSetupParams(params))

        const contracts = await this.readActiveSetup(paymaster)

        const existing = this.rethrowAsBadRequest(() =>
            trafficSetupOf(paymaster, contracts)
        )
        const plan = this.rethrowAsBadRequest(() =>
            planTrafficSetup(existing, params)
        )

        // Only the contracts the plan leaves alone can be disclosed: a created
        // or repriced one has no contract id until the caller's transaction
        // commits, and `sdk.ledger.disclose` is what resolves those afterwards.
        const reused = new Set(
            [
                plan.trafficPurchaser.contractId,
                ...plan.conversionRates.map((rate) => rate.contractId),
            ].filter((contractId) => contractId !== undefined)
        )
        const disclosedContracts = dedupeDisclosedContracts(
            contracts
                .filter((contract) => reused.has(contract.contractId))
                .map((contract) =>
                    toDisclosedContract(contract, this.ctx.error)
                )
        )

        this.logger.debug(
            {
                paymaster,
                commands: plan.commands.length,
                trafficPurchaser: plan.trafficPurchaser.status,
                conversionRates: plan.conversionRates.map((rate) => ({
                    instrumentId: rate.instrumentId,
                    status: rate.status,
                })),
            },
            'Planned a traffic setup'
        )

        return { ...plan, disclosedContracts }
    }

    /**
     * Everything of a paymaster's traffic setup that is live on the ledger.
     *
     * One ACS read filtered to the two templates. Useful on its own to diagnose
     * what `setup` refuses: a paymaster carrying two `TrafficPurchaser`s, or an
     * instrument priced by two live `ConversionRate`s.
     *
     * Needs no rights beyond the ones a setup already needs in order to submit,
     * since acting as a party implies reading as it.
     */
    public async readTrafficSetup(
        paymaster: PartyId
    ): Promise<ActiveTrafficSetup> {
        const contracts = await this.readActiveSetup(paymaster)
        return this.rethrowAsBadRequest(() =>
            trafficSetupOf(paymaster, contracts)
        )
    }

    /**
     * Reads the paymaster's `TrafficPurchaser` and `ConversionRate` contracts.
     *
     * Straight to the service rather than through the ACS cache: converging on
     * what the ledger says now is the whole point, and a cached answer could
     * plan a create for a contract that is already there.
     *
     * The filter this builds already asks for `includeCreatedEventBlob`, so one
     * read yields both the arguments to converge on and the blobs a buyer's
     * disclosures need. Filtering to the paymaster is enough to say the
     * contracts are its own: it is the sole signatory of both templates.
     */
    private async readActiveSetup(paymaster: PartyId) {
        return this.acsReader.raw.readJsContracts({
            parties: [paymaster],
            templateIds: [
                TrafficPurchaser.templateId,
                ConversionRate.templateId,
            ],
            filterByParty: true,
        })
    }

    /**
     * Runs a pure calculation, reporting the plain `Error` it rejects with as an
     * `SDKError`.
     *
     * `pricing.ts` and `setup.ts` are pure by design -- they hold no SDK context
     * -- so a `Decimal` that cannot be parsed, a non-positive rate, or a ledger
     * a setup refuses to converge all arrive as plain `Error`s. Every other
     * failure this namespace produces goes through `ctx.error.throw`, so the
     * translation belongs here rather than leaving a caller to handle two kinds
     * of error from one method.
     */
    private rethrowAsBadRequest<T>(compute: () => T): T {
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

    /** The instrument's admin and registry, as the configured registries report them. */
    private async resolveAsset(
        purchaseCtx: TrafficPurchaseContext,
        instrumentId: string,
        registryUrl: PurchaseTrafficParams['registryUrl']
    ) {
        const assets = parseAssets(
            this.ctx,
            await purchaseCtx.tokenStandardService.registriesToAssets(
                purchaseCtx.registryUrls.map((url) => url.href)
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
     * The holdings to spend and what they cost, in the model's own two branches.
     *
     * Asked for a traffic amount, the cost is the asset needed for it at the
     * stated rate and holdings are selected to cover that. Asked for nothing, the
     * offered holdings are spent whole, so they have to be read for their
     * *amounts* rather than just their ids -- and the rate never enters it.
     */
    private async priceThePurchase(
        purchaseCtx: TrafficPurchaseContext,
        params: PurchaseTrafficParams,
        instrumentId: InstrumentId
    ): Promise<{ holdingCids: ContractIdString[]; assetAmount: Numeric }> {
        if (params.trafficAmount !== undefined) {
            const { trafficAmount, conversionRate } = params

            if (
                this.rethrowAsBadRequest(() => wholeBytes(trafficAmount)) !==
                trafficAmount
            ) {
                this.ctx.error.throw({
                    message:
                        `${trafficAmount} is not a whole number of bytes. Traffic is ` +
                        'counted in whole bytes, and the model rejects a fractional request.',
                    type: 'BadRequest',
                })
            }

            const assetAmount = this.rethrowAsBadRequest(() =>
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

        const spendable = await this.spendableHoldings(
            purchaseCtx,
            params,
            instrumentId
        )
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
            assetAmount: this.rethrowAsBadRequest(() =>
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
     * Locked holdings are dropped. `ConversionRate_ValidateAssets` does accept a
     * lock that has expired, but only the ledger knows the time that is judged
     * against, so offering one risks a rejection for a holding that was never
     * needed.
     */
    private async spendableHoldings(
        purchaseCtx: TrafficPurchaseContext,
        params: PurchaseTrafficParams,
        instrumentId: InstrumentId
    ): Promise<PrettyContract<HoldingView>[]> {
        const now = new Date()
        const holdings =
            await purchaseCtx.tokenStandardService.listContractsByInterface<HoldingView>(
                HOLDING_INTERFACE_ID,
                params.purchaser
            )

        const forInstrument = await CoreService.filterHoldingsByInstrument({
            holdings: holdings.filter(
                (holding) => !TokenStandardService.isHoldingLocked(holding, now)
            ),
            instrumentAdmin: instrumentId.admin,
            instrumentId: instrumentId.id,
        })

        const requested = params.inputUtxos
        if (requested === undefined || requested.length === 0) {
            return forInstrument
        }
        return forInstrument.filter((holding) =>
            requested.includes(holding.contractId)
        )
    }

    /**
     * Which factory settles the payment, and with what context.
     *
     * The transfer the registry is asked about mirrors the one
     * `TrafficPurchaser_PurchaseCredits` builds, so the context it prices is the
     * context the choice will use. That is also why the choice arguments are
     * assembled here rather than through the token-standard service's own
     * builder, which stamps a memo into `transfer.meta` that the model's
     * `emptyMetadata` does not carry.
     */
    private async resolveTransferFactory(
        purchaseCtx: TrafficPurchaseContext,
        params: PurchaseTrafficParams,
        instrumentId: InstrumentId,
        registryUrl: string,
        holdingCids: ContractIdString[],
        assetAmount: Numeric,
        executeBefore: Date
    ): Promise<{
        factoryId: ContractIdString
        contextValues: TransferExtraArgs['context']['values']
        disclosedContracts: LedgerCommonSchemas['DisclosedContract'][]
    }> {
        const transfer: Transfer = {
            sender: params.purchaser,
            receiver: params.paymasterReceiver,
            amount: assetAmount,
            instrumentId,
            requestedAt: new Date(
                Date.now() - REQUESTED_AT_SKEW_MS
            ).toISOString(),
            executeBefore: executeBefore.toISOString(),
            inputHoldingCids:
                holdingCids as unknown as Transfer['inputHoldingCids'],
            meta: { values: {} },
        }

        const { factoryId, transferKind, choiceContext } =
            await purchaseCtx.tokenStandardService.transfer.fetchTransferFactoryChoiceContext(
                registryUrl,
                {
                    expectedAdmin: instrumentId.admin,
                    transfer,
                    // Sent empty: filling the context in is the registry's half
                    // of the exchange.
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

/**
 * The `values` map out of a registry's choice context data.
 *
 * The context is a Daml `ChoiceContext`, i.e. a record with one `values` field,
 * but the registry's OpenAPI spec types it as an opaque object -- repeating the
 * Daml types there would only let them drift. So it is read rather than cast,
 * and a registry that sends no values is treated as sending none rather than as
 * broken.
 */
function contextValuesOf(
    choiceContextData: unknown
): TransferExtraArgs['context']['values'] {
    if (typeof choiceContextData !== 'object' || choiceContextData === null) {
        return {}
    }
    if (!('values' in choiceContextData)) return {}

    const values = choiceContextData.values
    if (typeof values !== 'object' || values === null) return {}
    return values as TransferExtraArgs['context']['values']
}
