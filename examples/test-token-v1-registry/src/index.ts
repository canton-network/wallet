// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import router from './router'

const app = new Koa()

app.use(bodyParser())
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(3000, () => console.info('api listening on http://localhost:3000'))
