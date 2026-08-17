// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { jsonRpcHandler } from './json-rpc-handler'

export default defineBackground(() => {
    console.log('Hello background!', { id: browser.runtime.id })
    jsonRpcHandler()
})
