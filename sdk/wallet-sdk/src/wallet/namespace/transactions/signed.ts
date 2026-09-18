// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Ops } from '@canton-network/core-provider-ledger'
import type { SDKContext } from '../../init/types/context.js'
import type { ExecuteOptions } from '../ledger/types.js'
import type { LedgerNamespace } from '../ledger/index.js'

export class SignedTransaction {
    constructor(
        private readonly ctx: SDKContext,
        public readonly signedPromise: Promise<{
            response: Ops.PostV2InteractiveSubmissionPrepare['ledgerApi']['result']
            signature: string
        }>,
        private readonly _execute?: LedgerNamespace['execute'] //optional in case of offline signing
    ) {}

    async response() {
        return (await this.signedPromise).response
    }

    async signature() {
        return (await this.signedPromise).signature
    }

    execute(options: ExecuteOptions) {
        if (!this._execute) {
            this.ctx.error.throw({
                message:
                    'Cannot call execute() on a SignedTransaction offline. Used sdk.ledger.execute(signed, options) instead.',
                type: 'SDKOperationUnsupported',
            })
        }
        return this._execute(this, options)
    }
}
