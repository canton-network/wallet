// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { WrappedCommand } from '@canton-network/core-ledger-client-types'
import { vetDarFactory } from './common'

export type SpliceWrappedCommand = WrappedCommand<
    'CreateCommand' | 'ExerciseCommand'
>

export type SpliceCommandHandler = (...args: never[]) => SpliceWrappedCommand

export interface SpliceCommandTree {
    [key: string]: SpliceCommandHandler | SpliceCommandTree
}

export interface SpliceCommands {
    create: SpliceCommandTree
    exercise: SpliceCommandTree
}

export interface SpliceCodegen<
    DARType extends { packageId: string },
    Commands extends SpliceCommands = SpliceCommands,
> {
    DAR: DARType
    utils: {
        vetDar: ReturnType<typeof vetDarFactory>
    }
    commands: Commands
}
