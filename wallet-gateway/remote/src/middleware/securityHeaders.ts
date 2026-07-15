// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { NextFunction, Request, Response } from 'express'

export function securityHeaders() {
    return (_req: Request, res: Response, next: NextFunction) => {
        res.setHeader('X-Frame-Options', 'DENY')
        res.setHeader('Content-Security-Policy', "frame-ancestors 'none';")
        res.setHeader('X-Content-Type-Options', 'nosniff')
        next()
    }
}
