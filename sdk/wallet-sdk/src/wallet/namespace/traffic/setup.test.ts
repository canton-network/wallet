// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest'
import {
    ConversionRate,
    TrafficPurchaser,
} from '@canton-network/core-traffic-purchase'
import {
    assertSetupParams,
    conversionRateOf,
    instrumentKey,
    instrumentOf,
    isConversionRate,
    isTrafficPurchaser,
    paymasterReceiverOf,
    planTrafficSetup,
    sameConversionRate,
    trafficSetupOf,
    type CreatedContract,
} from './setup'
import type {
    ActiveConversionRate,
    ActiveTrafficSetup,
    ConversionRateSpec,
    SetupTrafficParams,
} from './types'

const paymaster = 'paymaster::1'
const instrumentId = { admin: 'dso::1', id: 'Amulet' }

const resolvedPackage = (templateId: string): string =>
    `deadbeef${templateId.slice(templateId.indexOf(':'))}`

const conversionRateContract = (
    overrides: Partial<{
        contractId: string
        createArgument: unknown
    }> = {}
): CreatedContract => ({
    templateId: ConversionRate.templateId,
    contractId: overrides.contractId ?? 'cr-1',
    createArgument:
        'createArgument' in overrides
            ? overrides.createArgument
            : {
                  paymaster,
                  instrumentId,
                  conversionRate: '1048576.0000000000',
              },
})

const trafficPurchaserContract = (
    overrides: Partial<{
        contractId: string
        createArgument: unknown
    }> = {}
): CreatedContract => ({
    templateId: TrafficPurchaser.templateId,
    contractId: overrides.contractId ?? 'tp-1',
    createArgument:
        'createArgument' in overrides
            ? overrides.createArgument
            : { paymaster, paymasterReceiver: paymaster },
})

const spec = (
    overrides: Partial<ConversionRateSpec> = {}
): ConversionRateSpec => ({
    instrumentId,
    conversionRate: '1048576',
    ...overrides,
})

const setupParams = (
    overrides: Partial<SetupTrafficParams> = {}
): SetupTrafficParams => ({
    paymaster,
    conversionRates: [spec()],
    ...overrides,
})

const noSetup: ActiveTrafficSetup = {
    trafficPurchasers: [],
    conversionRates: [],
}

describe('traffic setup', () => {
    describe('template matching', () => {
        it('matches a ConversionRate by qualified name whatever the package', () => {
            expect(isConversionRate(ConversionRate.templateId)).toBe(true)
            expect(
                isConversionRate(resolvedPackage(ConversionRate.templateId))
            ).toBe(true)
            expect(isConversionRate(TrafficPurchaser.templateId)).toBe(false)
        })

        it('matches a TrafficPurchaser by qualified name whatever the package', () => {
            expect(isTrafficPurchaser(TrafficPurchaser.templateId)).toBe(true)
            expect(
                isTrafficPurchaser(resolvedPackage(TrafficPurchaser.templateId))
            ).toBe(true)
            expect(isTrafficPurchaser(ConversionRate.templateId)).toBe(false)
        })
    })

    describe('instrumentKey', () => {
        it('is equal for the same instrument and differs otherwise', () => {
            expect(instrumentKey(instrumentId)).toBe(
                instrumentKey({ ...instrumentId })
            )
            expect(instrumentKey(instrumentId)).not.toBe(
                instrumentKey({ admin: 'dso::1', id: 'Other' })
            )
        })
    })

    describe('instrumentOf', () => {
        it('reads a well-formed instrument', () => {
            expect(instrumentOf({ instrumentId })).toEqual(instrumentId)
        })
    })

    describe('conversionRateOf', () => {
        it('reads a rate with its optionals', () => {
            const rate = conversionRateOf('cr-1', {
                instrumentId,
                conversionRate: '1048576.0000000000',
                expiresAt: '2030-01-01T00:00:00Z',
                maxTrafficPerPurchase: '2097152',
            })

            expect(rate).toEqual({
                contractId: 'cr-1',
                instrumentId,
                conversionRate: '1048576.0000000000',
                expiresAt: '2030-01-01T00:00:00Z',
                maxTrafficPerPurchase: '2097152',
            })
        })

        it('treats absent optionals as undefined', () => {
            const rate = conversionRateOf('cr-1', {
                instrumentId,
                conversionRate: '1048576.0000000000',
                expiresAt: null,
            })

            expect(rate?.expiresAt).toBeUndefined()
            expect(rate?.maxTrafficPerPurchase).toBeUndefined()
        })

        it('returns undefined when the arguments do not decode', () => {
            expect(conversionRateOf('cr-1', 'nope')).toBeUndefined()
            expect(conversionRateOf('cr-1', { instrumentId })).toBeUndefined()
            expect(
                conversionRateOf('cr-1', {
                    instrumentId,
                    conversionRate: 10,
                })
            ).toBeUndefined()
            expect(
                conversionRateOf('cr-1', {
                    instrumentId,
                    conversionRate: '1',
                    expiresAt: 5,
                })
            ).toBeUndefined()
            expect(
                conversionRateOf('cr-1', {
                    instrumentId,
                    conversionRate: '1',
                    maxTrafficPerPurchase: 5,
                })
            ).toBeUndefined()
        })
    })

    describe('paymasterReceiverOf', () => {
        it('reads the receiver when present, undefined otherwise', () => {
            expect(paymasterReceiverOf({ paymasterReceiver: paymaster })).toBe(
                paymaster
            )
            expect(paymasterReceiverOf({})).toBeUndefined()
            expect(paymasterReceiverOf('nope')).toBeUndefined()
        })
    })

    describe('trafficSetupOf', () => {
        it('sorts contracts into the two templates and ignores others', () => {
            const setup = trafficSetupOf(paymaster, [
                trafficPurchaserContract(),
                conversionRateContract(),
                { templateId: 'other:Some.Module:Thing', contractId: 'x-1' },
            ])

            expect(setup.trafficPurchasers).toHaveLength(1)
            expect(setup.conversionRates).toHaveLength(1)
            expect(setup.conversionRates[0]?.instrumentId).toEqual(instrumentId)
        })

        it('keeps a purchaser whose receiver cannot be read', () => {
            const setup = trafficSetupOf(paymaster, [
                trafficPurchaserContract({ createArgument: {} }),
            ])

            expect(setup.trafficPurchasers).toEqual([{ contractId: 'tp-1' }])
        })

        it('throws when a ConversionRate does not decode', () => {
            expect(() =>
                trafficSetupOf(paymaster, [
                    conversionRateContract({
                        createArgument: { instrumentId },
                    }),
                ])
            ).toThrow(/does not look like one this SDK knows/)
        })
    })

    describe('assertSetupParams', () => {
        it('accepts a valid set of rates', () => {
            expect(() => assertSetupParams(setupParams())).not.toThrow()
        })

        it('rejects no rates', () => {
            expect(() =>
                assertSetupParams(setupParams({ conversionRates: [] }))
            ).toThrow(/no conversion rates given/)
        })

        it('rejects two rates for one instrument', () => {
            expect(() =>
                assertSetupParams(
                    setupParams({ conversionRates: [spec(), spec()] })
                )
            ).toThrow(/two conversion rates for instrument/)
        })
    })

    describe('sameConversionRate', () => {
        const onLedger: ActiveConversionRate = {
            contractId: 'cr-1',
            instrumentId,
            conversionRate: '1048576.0000000000',
        }

        it('is true when the figures match despite spelling', () => {
            expect(
                sameConversionRate(
                    onLedger,
                    spec({ conversionRate: '1048576' })
                )
            ).toBe(true)
        })

        it('is false when the rate differs', () => {
            expect(
                sameConversionRate(onLedger, spec({ conversionRate: '2' }))
            ).toBe(false)
        })

        it('is false when one side has an optional the other lacks', () => {
            expect(
                sameConversionRate(
                    onLedger,
                    spec({ expiresAt: new Date('2030-01-01T00:00:00Z') })
                )
            ).toBe(false)
            expect(
                sameConversionRate(
                    { ...onLedger, maxTrafficPerPurchase: '2097152' },
                    spec()
                )
            ).toBe(false)
        })

        it('compares optionals that both sides carry', () => {
            const withExpiry: ActiveConversionRate = {
                ...onLedger,
                expiresAt: '2030-01-01T00:00:00Z',
                maxTrafficPerPurchase: '2097152.0000000000',
            }
            expect(
                sameConversionRate(
                    withExpiry,
                    spec({
                        expiresAt: new Date('2030-01-01T00:00:00Z'),
                        maxTrafficPerPurchase: '2097152',
                    })
                )
            ).toBe(true)
        })
    })

    describe('planTrafficSetup', () => {
        it('creates the purchaser and rate when nothing exists', () => {
            const plan = planTrafficSetup(noSetup, setupParams())

            expect(plan.commands).toHaveLength(2)
            expect(plan.trafficPurchaser.status).toBe('created')
            expect(plan.trafficPurchaser.contractId).toBeUndefined()
            expect(plan.conversionRates).toEqual([
                { instrumentId, status: 'created' },
            ])
        })

        it('defaults the receiver to the paymaster when creating', () => {
            const plan = planTrafficSetup(noSetup, setupParams())
            const create = plan.commands.find(
                (
                    command
                ): command is Extract<
                    (typeof plan.commands)[number],
                    { CreateCommand: unknown }
                > => 'CreateCommand' in command
            )

            expect(create?.CreateCommand.createArguments).toMatchObject({
                paymasterReceiver: paymaster,
            })
        })

        it('reuses an existing purchaser and leaves a matching rate alone', () => {
            const existing: ActiveTrafficSetup = {
                trafficPurchasers: [
                    { contractId: 'tp-1', paymasterReceiver: paymaster },
                ],
                conversionRates: [
                    {
                        contractId: 'cr-1',
                        instrumentId,
                        conversionRate: '1048576.0000000000',
                    },
                ],
            }

            const plan = planTrafficSetup(existing, setupParams())

            expect(plan.commands).toHaveLength(0)
            expect(plan.trafficPurchaser).toEqual({
                contractId: 'tp-1',
                status: 'unchanged',
            })
            expect(plan.conversionRates).toEqual([
                { instrumentId, status: 'unchanged', contractId: 'cr-1' },
            ])
        })

        it('reprices a rate whose terms changed', () => {
            const existing: ActiveTrafficSetup = {
                trafficPurchasers: [{ contractId: 'tp-1' }],
                conversionRates: [
                    {
                        contractId: 'cr-1',
                        instrumentId,
                        conversionRate: '1.0000000000',
                    },
                ],
            }

            const plan = planTrafficSetup(existing, setupParams())

            expect(plan.conversionRates).toEqual([
                { instrumentId, status: 'updated' },
            ])
            const exercise = plan.commands.find((c) => 'ExerciseCommand' in c)
            expect(exercise).toBeDefined()
        })

        it('throws when the paymaster has two purchasers and none is named', () => {
            const existing: ActiveTrafficSetup = {
                trafficPurchasers: [
                    { contractId: 'tp-1' },
                    { contractId: 'tp-2' },
                ],
                conversionRates: [],
            }

            expect(() => planTrafficSetup(existing, setupParams())).toThrow(
                /more than one TrafficPurchaser/
            )
        })

        it('throws when the named purchaser is not active', () => {
            const existing: ActiveTrafficSetup = {
                trafficPurchasers: [{ contractId: 'tp-1' }],
                conversionRates: [],
            }

            expect(() =>
                planTrafficSetup(
                    existing,
                    setupParams({ trafficPurchaser: 'tp-9' })
                )
            ).toThrow(/is not an active TrafficPurchaser/)
        })

        it('throws when the existing receiver disagrees with the requested one', () => {
            const existing: ActiveTrafficSetup = {
                trafficPurchasers: [
                    { contractId: 'tp-1', paymasterReceiver: 'other::1' },
                ],
                conversionRates: [],
            }

            expect(() =>
                planTrafficSetup(
                    existing,
                    setupParams({ paymasterReceiver: paymaster })
                )
            ).toThrow(/pays other::1, not the requested/)
        })

        it('throws when an instrument is priced by more than one live rate', () => {
            const existing: ActiveTrafficSetup = {
                trafficPurchasers: [{ contractId: 'tp-1' }],
                conversionRates: [
                    { contractId: 'cr-1', instrumentId, conversionRate: '1' },
                    { contractId: 'cr-2', instrumentId, conversionRate: '2' },
                ],
            }

            expect(() => planTrafficSetup(existing, setupParams())).toThrow(
                /more than one live ConversionRate/
            )
        })
    })
})
