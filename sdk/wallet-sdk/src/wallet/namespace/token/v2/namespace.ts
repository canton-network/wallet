// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { TokenNamespaceConfig } from '../namespace.ts'
import { AllocationNamespace } from './allocation/namespace.ts'
import { TransferNamespace } from './transfer/namespace.ts'
import { UtxoNamespace } from './utxos/namespace.ts'

export class TokenV2Namespace {
    public readonly transfer: TransferNamespace
    public readonly allocation: AllocationNamespace
    public readonly utxos: UtxoNamespace

    constructor(ctx: TokenNamespaceConfig) {
        this.transfer = new TransferNamespace(ctx)
        this.allocation = new AllocationNamespace(ctx)
        this.utxos = new UtxoNamespace(ctx)
    }
}
