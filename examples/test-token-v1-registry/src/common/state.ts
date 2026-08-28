// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { SDKInterface } from '@canton-network/wallet-sdk'

export type RegistryState = {
    sdk: SDKInterface
    synchronizerIds: {
        transferInstruction: string
        allocationInstruction: string
    }
    operator: {
        party: string
        keys: ReturnType<SDKInterface['keys']['generate']>
    }
}
