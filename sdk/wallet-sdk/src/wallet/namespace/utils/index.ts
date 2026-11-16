// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { HashNamespace } from './hash/service.ts'
import { PingService } from './ping/index.ts'

import type { OfflineSDKContext } from '../../init/types/context.ts'

export class SDKUtilsNamespace {
    public readonly ping: PingService
    public readonly hash: HashNamespace
    constructor(ctx: OfflineSDKContext) {
        this.ping = new PingService()
        this.hash = new HashNamespace(ctx)
    }
}
