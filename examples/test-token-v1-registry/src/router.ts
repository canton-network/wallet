// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Router from '@koa/router'

const router = new Router()

router.get('/', (ctx, next) => {
    console.log('TEST')
    return next()
})

export default router
