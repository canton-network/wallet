// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SDKContext } from '../../init/types/context.js'
import { TokenStandardService } from '@canton-network/core-token-standard-service'

export type URLInput = URL | string

function validateUrl(ctx: SDKContext, input: URLInput): URLInput {
    try {
        new URL(input)
        return input
    } catch (e) {
        ctx.error.throw({
            message: `Invalid URL provided ${input}.`,
            type: 'BadRequest',
            originalError: e,
        })
        throw e
    }
}

export class ParsedURL extends URL {
    private readonly ctx: SDKContext
    private readonly input: URLInput

    constructor(ctx: SDKContext, input: URLInput) {
        super(validateUrl(ctx, input))
        this.ctx = ctx
        this.input = input
    }
}

export function parseAssets(
    ctx: SDKContext,
    assets: Awaited<ReturnType<TokenStandardService['registriesToAssets']>>
) {
    return assets.map((asset) => {
        // The type claims `admin` is always present, but it's parsed from an
        // external registry response with no runtime validation -- a registry
        // that omits it would otherwise silently produce commands (e.g. transfer
        // preapprovals) with an undefined expectedDso.
        if (!asset.admin) {
            ctx.error.throw({
                message: `Registry response for asset "${asset.id}" is missing the "admin" (DSO) party.`,
                type: 'Unexpected',
            })
        }

        return {
            ...asset,
            registryUrl: new ParsedURL(ctx, asset.registryUrl),
        }
    })
}
