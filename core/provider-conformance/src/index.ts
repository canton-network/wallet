// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export { createProvider } from './create-provider.ts'

export {
    WrappingTestProvider,
    UserInteractionWrapper,
    WindowEventWrapper,
    WebhookWrapper,
    testMethodNames,
    abortable,
    performInteraction,
} from './test-provider.ts'
export type {
    Provider,
    TestMethods,
    TestProvider,
    InteractionMethod,
    Decision,
    Interaction,
    InteractionHandler,
} from './test-provider.ts'
