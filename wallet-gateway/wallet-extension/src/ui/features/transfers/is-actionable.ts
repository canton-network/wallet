// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
    PendingTransfer,
    PendingTransfersResult,
} from '@canton-network/core-wallet-ui-components/react/token'

/**
 * Whether the user may act on `transfer` now. Not when it is listed as v1
 * while v2 failed to load: the contract may implement v2, which must then
 * be acted through.
 */
export function isActionable(
    pending: PendingTransfersResult,
    transfer: PendingTransfer
): boolean {
    return !(
        transfer.version === 'v1' &&
        pending.failures.some((failure) => failure.version === 'v2')
    )
}
