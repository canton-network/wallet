// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ChildWindowOriginManager } from '@canton-network/core-origin-manager'
import { stateManager } from './state-manager'

// this needs IIFE in order to trigger event listener found inside constructor
export const originManager = (() =>
    new ChildWindowOriginManager({
        parentWindow: window.opener,
        userHandshakeCallback: (event) => {
            stateManager.currentOrigin.set(event.origin)
        },
    }))()
