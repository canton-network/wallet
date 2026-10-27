// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * The `Tea.TrafficPurchase` model, as `dpm codegen-js` renders it.
 *
 * The generated packages are gitignored, so this only resolves after
 * `pnpm generate:traffic-purchase` -- which this package's `build` runs first.
 *
 * Entities are re-exported from the module by name rather than through the
 * generated barrel. Each one is a *merged* declaration -- a `type` and a `const`
 * companion of the same name -- and bundling the barrel keeps only the value
 * side (`typeof X`), which would leave `X` usable as a value but not as a type.
 * Naming them here is what makes the choice arguments type-checkable by a
 * consumer, which is the point of shipping the codegen at all.
 */

/**
 * The two templates, exported as values so they carry both meanings: the payload
 * type, and the companion holding the template id and its choice names -- which
 * a command builder would otherwise have to spell by hand.
 */
export {
    ConversionRate,
    TrafficPurchaser,
} from '@daml.js/traffic-purchase-models-1.0.0/lib/Tea/TrafficPurchase/module.js'

export type {
    ConversionRate_Update,
    ConversionRate_ValidateAssets,
    ConversionRateInterface,
    PaymentAsset,
    TrafficPurchasedResult,
    TrafficPurchaser_PurchaseCredits,
    TrafficPurchaserInterface,
    ValidatedAssets,
} from '@daml.js/traffic-purchase-models-1.0.0/lib/Tea/TrafficPurchase/module.js'

/**
 * The TEA account a purchase credits.
 */
export type { AccountId } from '@daml.js/canton-traffic-credit-1.0.0/lib/Canton/Traffic/Credit/module.js'

/** Package id of the DAR these bindings were generated from. */
export { packageId } from '@daml.js/traffic-purchase-models-1.0.0'
