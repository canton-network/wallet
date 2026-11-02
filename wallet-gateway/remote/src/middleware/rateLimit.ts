// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import rateLimit, { ipKeyGenerator } from 'express-rate-limit'
import type { Request } from 'express'

export function ipRateLimitKeyGenerator(req: Request): string {
    return `ip:${ipKeyGenerator(req.ip || req.socket.remoteAddress || 'unknown')}`
}

export function rateLimitKeyGenerator(req: Request): string {
    // Prefer authenticated identity to avoid shared proxy IP buckets.
    if (req.authContext?.userId) {
        return `user:${req.authContext.userId}`
    }

    return ipRateLimitKeyGenerator(req)
}

export function rateLimiter(requestRateLimit: number) {
    return rateLimit({
        windowMs: 1 * 60 * 1000, // 1 minute
        max: requestRateLimit, // limit each IP to requestRateLimit requests per windowMs
        keyGenerator: rateLimitKeyGenerator,
        standardHeaders: true,
        legacyHeaders: false,
    })
}

export function preAuthIpRateLimiter(requestRateLimit: number) {
    return rateLimit({
        windowMs: 1 * 60 * 1000,
        max: requestRateLimit,
        keyGenerator: ipRateLimitKeyGenerator,
        // Apply only if JWT middleware has not attached an authenticated context at end of request.
        skipSuccessfulRequests: true,
        requestWasSuccessful: (req) => req.authContext?.userId !== undefined,
        standardHeaders: true,
        legacyHeaders: false,
    })
}

export function authenticatedRateLimiter(requestRateLimit: number) {
    return rateLimit({
        windowMs: 1 * 60 * 1000,
        max: requestRateLimit,
        keyGenerator: rateLimitKeyGenerator,
        // Apply only after JWT middleware has attached an authenticated context.
        skip: (req) => !req.authContext?.userId,
        standardHeaders: true,
        legacyHeaders: false,
    })
}
