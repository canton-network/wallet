// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { SDKLogger } from '../logger/index.js'
import {
    EXTENDED_SDK_OPTION_KEYS,
    ExtendedFullSDKInterface,
    ExtendedSDKOptions,
    SDKInterface,
} from './types/sdk.js'
import type { SDKContext } from './types/context.js'

export type SDKPluginContext<
    ExtendedItems extends keyof ExtendedFullSDKInterface = never,
> = SDKContext & {
    namespace: Omit<SDKInterface<ExtendedItems>, 'extend' | 'registerPlugins'>
}

export abstract class SDKPlugin<
    ExtendedNamespaceItems extends keyof ExtendedFullSDKInterface = never,
> {
    /**
     *
     * @deprecated use this.ctx.logger instead
     */
    protected readonly logger: ReturnType<SDKLogger['child']>
    protected readonly ctx: SDKPluginContext<ExtendedNamespaceItems>

    constructor(
        public readonly name: string,
        protected readonly _ctx: SDKPluginContext<ExtendedNamespaceItems>
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
