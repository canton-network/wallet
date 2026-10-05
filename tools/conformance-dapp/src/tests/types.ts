// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
    Decision,
    InteractionMethod,
    TestProvider,
} from '@canton-network/core-provider-conformance'
import type { RequestArgs as ProviderRequestArgs } from '@canton-network/core-types'
import type { dappAPI } from '@canton-network/dapp-sdk'
import type { Observation } from '../report.ts'

export type RequestArgs<
    Method extends keyof dappAPI.RpcTypes = keyof dappAPI.RpcTypes,
> = ProviderRequestArgs<dappAPI.RpcTypes, Method>

export type TestRuntime = {
    signal: AbortSignal
    request: TestProvider['request']
    runInteraction: <Method extends InteractionMethod>(
        decision: Decision,
        args: RequestArgs<Method>
    ) => Promise<dappAPI.RpcTypes[Method]['result']>
    observe: (observation: Omit<Observation, 'testId' | 'timestamp'>) => void
    ensureConnected: () => Promise<void>
    ensureDisconnected: () => Promise<void>
    onEvent: (event: string, listener: (value: unknown) => void) => void
}

export type Case = {
    id: string
    name: string
    category: string
    run: (runtime: TestRuntime) => Promise<void>
}
