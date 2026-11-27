// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    useTokenContext,
    type PendingTransfer,
} from '@canton-network/core-wallet-ui-components/react/token'

/** The instrument's symbol, else its id. */
export function useSymbol({ instrumentId }: PendingTransfer): string {
    const { instruments } = useTokenContext()
    return (
        instruments
            .get(instrumentId.admin)
            ?.find((instrument) => instrument.id === instrumentId.id)?.symbol ??
        instrumentId.id
    )
}
