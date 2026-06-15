// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { SDKLogger } from '../logger/index.js'
import { EXTENDED_SDK_OPTION_KEYS, ExtendedSDKOptions } from './types/sdk.js'
import type { SDKContext } from './types/context.js'

export abstract class SDKPlugin {
    /**
     *
     * @deprecated use this.ctx.logger instead
     */
    protected readonly logger: ReturnType<SDKLogger['child']>
    protected readonly ctx: SDKContext

    constructor(
        public readonly name: string,
        protected readonly _ctx: SDKContext
    ) {
        if (EXTENDED_SDK_OPTION_KEYS.includes(name as keyof ExtendedSDKOptions))
            throw Error(
                `Name "${name}" is reserved and cannot be used to register the plugin. Reserved names: ${EXTENDED_SDK_OPTION_KEYS.join(', ')}.`
            )

        const logger = _ctx.logger.child({
            plugin: name,
        })

        /**
         * @deprecated
         */
        this.logger = logger

        this.ctx = {
            ..._ctx,
            logger,
        }
    }
}
