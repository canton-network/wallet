// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { GetServerStatusResult } from '../user-api/rpc-gen/typings.ts'
import { GATEWAY_VERSION } from '../version.ts'
import type { ServerNotices } from './server-notices.ts'

/**
 * Provides the information shown to server administrators.
 */
export class ServerStatusService {
    constructor(private readonly notices: ServerNotices) {}

    getStatus(): GetServerStatusResult {
        return {
            version: GATEWAY_VERSION,
            notices: this.notices.list(),
        }
    }
}
