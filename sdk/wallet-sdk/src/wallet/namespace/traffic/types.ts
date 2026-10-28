// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Ops } from '@canton-network/core-provider-ledger'
import type { LedgerCommonSchemas } from '@canton-network/core-ledger-client-types'
import type { Numeric, PartyId } from '@canton-network/core-types'
import type { URLInput } from '../utils/url.js'

/** The state a participant reports for one traffic account. */
export type TrafficAccount =
    Ops.GetV2TrafficAccountsAccountId['ledgerApi']['result']

type UpdateAccountBody =
    Ops.PostV2TrafficAccounts['ledgerApi']['params']['body']

export type TopUpTrafficParams = Omit<
    UpdateAccountBody,
    'balanceDelta' | 'deduplicationId'
> & {
    /** Bytes to add to the balance. A negative value subtracts. */
    balanceDelta: number
    deduplicationId?: string
}

/**
 * A ledger contract id, as the Ledger API renders it.
 *
 * An opaque string whose exact format is the ledger's business -- currently a
 * hex blob such as `00a1b2...`. Left unbranded (rather than `ContractId<T>`
 * from `@daml/types`) so a caller can pass the string the ledger handed it
 * without a cast, which is how every other contract-id parameter in the SDK
 * behaves.
 */
export type ContractIdString = string

/**
 * Specifies how much traffic to buy:
 * - `trafficAmount`: buy that many bytes and return any change; requires a rate.
 * - Omitted: spend all offered holdings; the rate is not needed.
 */
export type PurchaseTrafficAmount =
    | {
          /**
           * Bytes to buy, as a Daml `Int`: a base-10 integer string with no
           * exponent or decimal point, e.g. `'2097152'`. Traffic is counted in
           * whole bytes, and the model's `requestedTrafficAmount` is an `Int`.
           */
          trafficAmount: Numeric
          /**
           * The rate to buy at: the `conversionRate` field of the
           * `ConversionRate` contract named by `conversionRateCid`, in traffic
           * bytes per unit of the payment asset. A Daml `Decimal`, e.g.
           * `'1048576'` for 1 MiB per unit. Must be positive.
           *
           * Named as the model names it, and distinct from `conversionRateCid`:
           * this is the figure, that is the contract.
           *
           * The ledger prices the purchase from the contract, but the cost has
           * to be worked out before the registry is asked about the transfer --
           * so the caller states the rate it believes it is buying at. A rate
           * repriced since makes the ledger reject the purchase rather than
           * settle at a stale price.
           */
          conversionRate: Numeric
      }
    | { trafficAmount?: never; conversionRate?: never }

/**
 * How much is being bought, if specified, Empty otherwise).
 *
 */
export type ResolvablePurchaseTrafficAmount =
    | {
          /** As {@link PurchaseTrafficAmount}: whole bytes, no exponent. */
          trafficAmount: Numeric
          /**
           * As {@link PurchaseTrafficAmount}, but optional: left out, the rate
           * the paymaster serves for `instrumentId` is used.
           */
          conversionRate?: Numeric | undefined
      }
    | { trafficAmount?: never; conversionRate?: never }

/** What every purchase takes, however the paymaster's half is arrived at. */
type PurchaseTrafficCommon = {
    /**
     * The party paying, whose key signs the submission. Owns every holding
     * spent, and is the sender of the settling transfer.
     */
    purchaser: PartyId
    /**
     * The instrument to pay with, by its token-standard instrument id
     */
    instrumentId: string
    /**
     * Base URL of the *token* registry's off-ledger API, e.g. scan's.
     */
    registryUrl: URLInput
    /**
     * The TEA account to credit, as the model's `AccountId`.
     */
    targetAccount: string
    /**
     * Contract ids of the `Splice.Api.Token.HoldingV1:Holding` contracts to
     * spend. Must be owned by `purchaser` and of `instrumentId`.
     *
     */
    inputUtxos?: ContractIdString[]
    /** The deadline the registry must settle by. Ten minutes out when left out. */
    executeBefore?: Date
    /**
     * The paymaster's `TrafficPurchaser` and `ConversionRate` as disclosures (optional).
     */
    disclosedContracts?: LedgerCommonSchemas['DisclosedContract'][]
}

/**
 * The paymaster's half of a purchase, stated by the caller.
 *
 */
type StatedPaymasterTerms = {
    paymasterApiUrl?: undefined
    /**
     * Contract id of the paymaster's
     * `#traffic-purchase-models:Tea.TrafficPurchase:TrafficPurchaser`, the
     * contract whose `TrafficPurchaser_PurchaseCredits` choice this exercises.
     * Must travel in `disclosedContracts`.
     */
    trafficPurchaserCid: ContractIdString
    /**
     * Contract id of the `#traffic-purchase-models:Tea.TrafficPurchase:ConversionRate`
     * to buy at. Must be for `instrumentId`, and must travel in
     * `disclosedContracts`.
     *
     * The *figure* it prices at is `conversionRate`; this is the contract.
     */
    conversionRateCid: ContractIdString
    /**
     * The party payments go to, as the `TrafficPurchaser` names it.
     *
     * Stated rather than read off the contract: the buyer is not a stakeholder
     * on it, and the registry has to be asked about a transfer to a *specific*
     * receiver before anything is submitted. A receiver that disagrees with the
     * contract makes the ledger reject the purchase.
     */
    paymasterReceiver: PartyId
} & PurchaseTrafficAmount

/**
 * The paymaster's half of a purchase, fetched from the paymaster itself.
 *
 */
type FetchedPaymasterTerms = {
    /**
     * Base URL of the paymaster's traffic-purchase off-ledger API, e.g.
     * `https://paymaster.example`.
     */
    paymasterApiUrl: URLInput
    /** As {@link StatedPaymasterTerms}. Served by the paymaster when left out. */
    trafficPurchaserCid?: ContractIdString | undefined
    /** As {@link StatedPaymasterTerms}. Served by the paymaster when left out. */
    conversionRateCid?: ContractIdString | undefined
    /** As {@link StatedPaymasterTerms}. Served by the paymaster when left out. */
    paymasterReceiver?: PartyId | undefined
} & ResolvablePurchaseTrafficAmount

/**
 * What `purchaseTraffic` takes.
 */
export type PurchaseTrafficParams = PurchaseTrafficCommon &
    (StatedPaymasterTerms | FetchedPaymasterTerms)
