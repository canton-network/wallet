// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    ChildWindowOriginManager,
    ParentWindowOriginManager,
} from '@canton-network/core-origin-manager'
import { stateManager } from './state-manager'

export const childOriginManager = (() =>
    new ChildWindowOriginManager({
        parentWindow: window.opener,
        userHandshakeCallback: async (event) => {
            await stateManager.currentOrigin.set(event.data.origin)
        },
    }))()

export const parentOriginManager = (() => new ParentWindowOriginManager())()

export const detectCurrentOrigin = () => 'browserext'
