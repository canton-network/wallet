// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const setLocationHref = (path: string) => {
    // Add a 10ms buffer to allow Chrome's storage IPC to fully flush
    // before we destroy the current JS context.
    window.location.href = path
}
