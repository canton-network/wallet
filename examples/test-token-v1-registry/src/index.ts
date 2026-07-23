// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import { initOperatorParty } from './common/operator'
import vetDaml from './common/vetDaml'
import { router } from './router'

const app = new Koa()

await initOperatorParty()

/**
 * @customize see {@link ./common/vetDaml.ts}
 */
if (process.env.NODE_ENV === 'development') await vetDaml()

app.use(bodyParser())
    .use(router)
    .listen(5634, () => console.info('api listening on http://localhost:5634'))
