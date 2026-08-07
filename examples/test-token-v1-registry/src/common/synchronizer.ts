// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const synchronizerId = {
    transferInstruction: '',
    allocationInstruction: '',
}

export const assignSynchronizerIds = (sync: typeof synchronizerId) => {
    Object.assign(synchronizerId, sync)
}
