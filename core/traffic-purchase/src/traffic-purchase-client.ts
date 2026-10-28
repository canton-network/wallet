// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import createClient, { type Client } from 'openapi-fetch'
import type { AccessTokenProvider } from '@canton-network/core-wallet-auth'
import { getLogger } from '@logtape/logtape'

import type {
    components,
    paths,
} from './generated-clients/traffic-purchase-v1/traffic-purchase-v1.js'

/** The paymaster's purchaser contract, with the disclosures a purchase needs. */
export type TrafficPurchaserWithDisclosures =
    components['schemas']['TrafficPurchaserWithDisclosures']

/** One live rate, its terms, and the disclosures a purchase at it needs. */
export type ConversionRateWithDisclosures =
    components['schemas']['ConversionRateWithDisclosures']

/** A contract to disclose, as the Ledger API takes it. */
export type TrafficPurchaseDisclosedContract =
    components['schemas']['DisclosedContract']

/** The instrument a rate prices, as the Daml model keys it. */
export type TrafficPurchaseInstrumentId = components['schemas']['InstrumentId']

/**
 * Traffic purchase off-ledger API error.
 *
 */
export class TrafficPurchaseApiError extends Error {
    constructor(
        readonly status: number,
        readonly body: unknown,
        message: string
    ) {
        super(message)
        this.name = 'TrafficPurchaseApiError'
    }

    /** The message with the paymaster's response body appended, when it has one. */
    public messageDetails(): string {
        if (this.body === undefined || this.body === null) {
            return this.message
        }
        const details =
            typeof this.body === 'string'
                ? this.body
                : JSON.stringify(this.body)
        return `${this.message} ${details}`
    }
}

/**
 * The off-ledger API provided by a traffic paymaster.
 *
 * It provides two reads about the paymaster's own contracts: the `TrafficPurchaser` used in a
 * purchase and the `ConversionRate` used to price it. Each read includes the disclosures required
 * for submission. Because the paymaster is the sole signatory of both templates, buyers cannot
 * create these disclosures themselves.
 */
export class TrafficPurchaseClient {
    // Private so `rollup-plugin-dts` elides the type rather than inlining the whole of
    // `openapi-fetch` into this package's declaration bundle.
    private readonly client: Client<paths>
    private readonly logger = getLogger([
        'core',
        'traffic-purchase',
        'TrafficPurchaseClient',
    ])
    private readonly accessTokenProvider: AccessTokenProvider

    constructor(
        public url: string,
        accessTokenProvider: AccessTokenProvider
    ) {
        this.accessTokenProvider = accessTokenProvider
        this.logger.debug('TrafficPurchaseClient initialized', { url })
        this.client = createClient<paths>({
            baseUrl: url,
            fetch: async (url: RequestInfo, options: RequestInit = {}) => {
                const accessToken =
                    await this.accessTokenProvider.getAccessToken()

                return fetch(url, {
                    ...options,
                    headers: {
                        ...options.headers,
                        ...(accessToken
                            ? { Authorization: `Bearer ${accessToken}` }
                            : {}),
                        'Content-Type': 'application/json',
                    },
                })
            },
        })
    }

    /** The `TrafficPurchaser` this paymaster sells through. */
    public async getTrafficPurchaser(): Promise<TrafficPurchaserWithDisclosures> {
        const path = '/registry/traffic-purchase/v1/traffic-purchaser'
        const resp = await this.client.GET(path)
        this.logger.debug('GET {path}', { path, response: resp })
        return this.getResponseData(path, resp)
    }

    /**
     * The conversion rate this paymaster sells traffic for one instrument.
     */
    public async getConversionRate(
        instrumentId: TrafficPurchaseInstrumentId
    ): Promise<ConversionRateWithDisclosures> {
        const path =
            '/registry/traffic-purchase/v1/conversion-rates/{instrumentId}'
        const params = {
            path: { instrumentId: instrumentId.id },
            query: { admin: instrumentId.admin },
        }
        const resp = await this.client.GET(path, { params })
        this.logger.debug('GET {path}', { path, params, response: resp })
        return this.getResponseData(path, resp)
    }

    private getResponseData<T>(
        path: string,
        resp: { data?: T; error?: unknown; response: Response }
    ): T {
        if (resp.data === undefined) {
            throw new TrafficPurchaseApiError(
                resp.response.status,
                resp.error,
                `The traffic paymaster at ${this.url} answered ` +
                    `${resp.response.status} for GET ${path}.`
            )
        }
        return resp.data
    }
}
