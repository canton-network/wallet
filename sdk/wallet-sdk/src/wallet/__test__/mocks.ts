// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { MockedObject, vi } from 'vitest'
import { SDKContext } from '../sdk.js'
import { SDKLogger } from '../logger/logger.js'
import { SDKErrorHandler } from '../error/handler.js'

const ledgerProvider = {
    request: vi.fn().mockResolvedValue(undefined),
}

const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    trace: vi.fn(),
    child: vi.fn().mockReturnThis(),
    additionalContext: {},
    adapter: { log: vi.fn() },
    allowedAdapter: 'pino' as const,
} as unknown as MockedObject<SDKLogger>

const mockErrorHandler = new SDKErrorHandler(mockLogger)
const throwSpy = vi.spyOn(mockErrorHandler, 'throw')
throwSpy.mockImplementation(vi.fn() as never)

const ctx: SDKContext = {
    ledgerProvider,
    userId: 'userId',
    logger: mockLogger,
    error: mockErrorHandler,
    defaultSynchronizerId: '',
}

export const mock = {
    ledgerProvider,
    mockLogger,
    ctx,
}
