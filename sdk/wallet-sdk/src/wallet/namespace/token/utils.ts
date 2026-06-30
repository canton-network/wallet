// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { PartyId } from '@canton-network/core-types'
import { TokenNamespaceConfig } from './namespace.js'

export function resolveProviderParty(
    ctx: TokenNamespaceConfig,
    methodName: string,
    explicitParty?: PartyId
): PartyId {
    const providerParty = explicitParty || ctx.validatorParty
    if (!providerParty) {
        ctx.commonCtx.error.throw({
            type: 'BadRequest',
            message: `Error during ${methodName}. Please initialize the token namespace with a validatorURL or provide a validatorParty in this method`,
        })
    }
    return providerParty
}
