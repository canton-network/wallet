// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { AssetCapabilities } from '@canton-network/core-token-standard-service'

import type { TokenStandardVersion } from './client.ts'

export type TransferVersionResult = {
    requested: TokenStandardVersion
    used: TokenStandardVersion
    fallback: boolean
}

export const resolveTransferVersion = (
    asset: { capabilities: AssetCapabilities },
    requested: TokenStandardVersion
): TransferVersionResult => {
    const used =
        requested === 'v2' &&
        asset.capabilities.transferInstruction.includes('v2')
            ? 'v2'
            : 'v1'

    return { requested, used, fallback: used !== requested }
}
