// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Koa from 'koa'

const app = new Koa()

app.use((ctx) => {
    console.log(ctx)
}).listen(3000)
