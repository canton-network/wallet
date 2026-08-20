// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const initialValue = () => ({
    transferInstruction: '',
    allocationInstruction: '',
})

export const synchronizerId = initialValue()

export const assignSynchronizerIds = (sync: typeof synchronizerId) => {
    Object.assign(synchronizerId, sync)
}

export const resetSynchronizerIds = () => {
    Object.assign(synchronizerId, initialValue())
}
