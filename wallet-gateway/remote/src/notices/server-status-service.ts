// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { GetServerStatusResult } from '../user-api/rpc-gen/typings.js'
import { GATEWAY_VERSION } from '../version.js'
import type { ServerNotices } from './server-notices.js'

/**
 * Provides the information shown to server administrators.
 */
export class ServerStatusService {
    constructor(
        private readonly notices: ServerNotices,
        // The config as loaded at startup, with secrets redacted
        private readonly displayConfig: Record<string, unknown>
    ) {}

    getStatus(): GetServerStatusResult {
        return {
            version: GATEWAY_VERSION,
            notices: this.notices.list(),
            config: this.displayConfig,
        }
    }
}
