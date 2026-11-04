// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod'

export const OriginHandshakeMessage = z.enum([
    'SPLICE_WALLET_BROADCAST_ORIGIN',
    'SPLICE_WALLET_BROADCAST_ORIGIN_ACK',
])
export type OriginHandshakeMessage = z.infer<typeof OriginHandshakeMessage>

export const OriginHandshake = z.object({
    message: OriginHandshakeMessage,
    origin: z.string(),
})
