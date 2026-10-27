// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import createClient, { type Client } from 'openapi-fetch'
import type { AccessTokenProvider } from '@canton-network/core-wallet-auth'

import type {
    components,
    paths,
} from './generated-clients/traffic-purchase-v1/traffic-purchase-v1.js'

// TODO: switch to logtape like the other core packages (see #2667)
type Logger = Pick<Console, 'debug' | 'info' | 'warn' | 'error'>

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
 * A paymaster that answered, but not with what was asked for.
 *
 * Carries the HTTP status, which `TokenStandardClient` does not: a caller has to tell a paymaster
 * that simply does not sell this instrument (404) from one that is misconfigured (401/403) or
 * broken (5xx), and the error body alone does not say which. The body is kept as `unknown` rather
 * than typed as `ErrorResponse` because a server that is failing is exactly the one least likely
 * to honour its own schema.
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
 *
 * Payment details are not handled here. They are provided by the token registry through a
 * separate API.
 */
export class TrafficPurchaseClient {
    // Private so `rollup-plugin-dts` elides the type rather than inlining the whole of
    // `openapi-fetch` into this package's declaration bundle.
    private readonly client: Client<paths>
    private readonly logger: Logger
    private readonly accessTokenProvider: AccessTokenProvider

    constructor(
        public url: string,
        logger: Logger,
        accessTokenProvider: AccessTokenProvider
    ) {
        this.accessTokenProvider = accessTokenProvider
        this.logger = logger
        this.logger.debug({ url }, 'TrafficPurchaseClient initialized')
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
        this.logger.debug({ path, response: resp }, `GET ${path}`)
        return this.getResponseData(path, resp)
    }

    /**
     * The rate this paymaster sells traffic for one instrument at.
     *
     * Takes the `{ admin, id }` pair because that is what keys a rate; splitting it across the
     * path and the query is this API's business rather than a caller's, which is why it is done
     * here and not at the call site.
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
        this.logger.debug({ path, params, response: resp }, `GET ${path}`)
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
