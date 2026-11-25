// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SDKErrorContext } from './types.ts'

export class SDKError<OriginalErrorContext = undefined> extends Error {
    constructor(public context: SDKErrorContext<OriginalErrorContext>) {
        const { message, ...rest } = context
        super(message, rest)
    }

    public toJSON() {
        return {
            timestamp: this.timestamp,
            ...this.context,
        }
    }

    protected get timestamp() {
        return new Date().toISOString()
    }
}
