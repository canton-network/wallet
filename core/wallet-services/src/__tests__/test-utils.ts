// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { vi } from 'vitest'
import { createLogRecorder } from '@logtape/testing/recorder'
import { base64url } from 'jose'

import { configure } from '@logtape/logtape'
import type { Logger } from 'pino'

function bytesToBinary(bytes: Uint8Array): string {
    let binary = ''
    for (const byte of bytes) binary += String.fromCharCode(byte)
    return binary
}

function binaryToBytes(binary: string): Uint8Array {
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
}

export function encodeBase64(
    value: string | Uint8Array,
    encoding: 'base64' | 'base64url' = 'base64'
): string {
    const bytes =
        typeof value === 'string' ? new TextEncoder().encode(value) : value
    return encoding === 'base64'
        ? btoa(bytesToBinary(bytes))
        : base64url.encode(bytes)
}

export function decodeBase64(
    value: string,
    encoding: 'base64' | 'base64url' = 'base64'
): Uint8Array {
    if (encoding === 'base64url') {
        return base64url.decode(value)
    }
    const padded = value.padEnd(
        value.length + ((4 - (value.length % 4)) % 4),
        '='
    )
    return binaryToBytes(atob(padded))
}

export function createTestLogger(): Logger {
    const logger = {
        isLevelEnabled: vi.fn().mockReturnValue(false),
        trace: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        child: vi.fn(),
    }
    logger.child.mockReturnValue(logger)
    return logger as unknown as Logger
}

export async function initializeLogRecorder() {
    const recorder = createLogRecorder()

    await configure({
        sinks: { recorder: recorder.sink },
        loggers: [
            {
                category: ['core'],
                lowestLevel: 'trace',
                sinks: ['recorder'],
            },
            { category: ['logtape', 'meta'], sinks: [] },
        ],
    })

    return recorder
}
