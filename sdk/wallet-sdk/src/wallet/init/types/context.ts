// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { AbstractLedgerProvider } from '@canton-network/core-provider-ledger'
import { SDKLogger } from '../../logger/logger.js'
import { SDKErrorHandler } from '../../error/handler.js'

export type SDKContext = {
    ledgerProvider: AbstractLedgerProvider
    userId: string
    logger: SDKLogger
    error: SDKErrorHandler
    defaultSynchronizerId: string
}

export type OfflineSDKContext = {
    logger: SDKLogger
    error: SDKErrorHandler
}
