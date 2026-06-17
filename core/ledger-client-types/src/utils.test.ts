// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import { EventFilterBySetup, TransactionFilterBySetup } from './utils'

const PARTY_ID = 'alice::abc123'
const TEMPLATE_ID = 'pkg:Module:Template'
const INTERFACE_ID = 'pkg:Module:Interface'

describe('TransactionFilterBySetup', () => {
    it('builds a party filter for a single template id', () => {
        const filter = TransactionFilterBySetup({
            partyId: PARTY_ID,
            templateIds: TEMPLATE_ID,
        })

        expect(filter.filtersByParty).toEqual({
            [PARTY_ID]: {
                cumulative: [
                    {
                        identifierFilter: {
                            TemplateFilter: {
                                value: {
                                    templateId: TEMPLATE_ID,
                                    includeCreatedEventBlob: true,
                                },
                            },
                        },
                    },
                ],
            },
        })
    })

    it('normalizes template ids and adds a wildcard filter when requested', () => {
        const filter = TransactionFilterBySetup({
            partyId: PARTY_ID,
            templateIds: [TEMPLATE_ID, 'pkg:Module:Other'],
            includeWildcard: true,
        })

        expect(filter.filtersByParty?.[PARTY_ID]?.cumulative).toEqual([
            {
                identifierFilter: {
                    TemplateFilter: {
                        value: {
                            templateId: TEMPLATE_ID,
                            includeCreatedEventBlob: true,
                        },
                    },
                },
            },
            {
                identifierFilter: {
                    TemplateFilter: {
                        value: {
                            templateId: 'pkg:Module:Other',
                            includeCreatedEventBlob: true,
                        },
                    },
                },
            },
            {
                identifierFilter: {
                    WildcardFilter: {
                        value: { includeCreatedEventBlob: true },
                    },
                },
            },
        ])
    })

    it('builds interface filters when no template ids are provided', () => {
        const filter = TransactionFilterBySetup({
            partyId: PARTY_ID,
            interfaceIds: INTERFACE_ID,
        })

        expect(filter.filtersByParty?.[PARTY_ID]?.cumulative).toEqual([
            {
                identifierFilter: {
                    InterfaceFilter: {
                        value: {
                            interfaceId: INTERFACE_ID,
                            includeInterfaceView: true,
                            includeCreatedEventBlob: true,
                        },
                    },
                },
            },
        ])
    })

    it('uses filtersForAnyParty for master users', () => {
        const filter = TransactionFilterBySetup({
            isMasterUser: true,
            templateIds: TEMPLATE_ID,
        })

        expect(filter.filtersByParty).toEqual({})
        expect(filter.filtersForAnyParty).toEqual({
            cumulative: [
                {
                    identifierFilter: {
                        InterfaceFilter: {
                            value: {
                                interfaceId: TEMPLATE_ID,
                                includeInterfaceView: true,
                                includeCreatedEventBlob: true,
                            },
                        },
                    },
                },
            ],
        })
    })

    it('requires a party id for non-master users', () => {
        expect(() =>
            TransactionFilterBySetup({ templateIds: TEMPLATE_ID })
        ).toThrow('Party must be provided for non-master users')
    })
})

describe('EventFilterBySetup', () => {
    it('defaults verbose to false', () => {
        const filter = EventFilterBySetup({
            partyId: PARTY_ID,
            templateIds: TEMPLATE_ID,
        })

        expect(filter.verbose).toBe(false)
    })

    it('includes verbose when requested', () => {
        const filter = EventFilterBySetup({
            partyId: PARTY_ID,
            templateIds: TEMPLATE_ID,
            verbose: true,
        })

        expect(filter.verbose).toBe(true)
        expect(filter.filtersByParty?.[PARTY_ID]?.cumulative).toHaveLength(1)
    })
})
