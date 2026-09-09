// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { WrappedCommand } from '@canton-network/core-ledger-client-types'
import { SDKInterface } from '@canton-network/wallet-sdk'
import { readFileSync } from 'fs'
import path from 'path'

export const vetDarFactory =
    (pathToDar: string, packageId: string) =>
    async (
        sdk: SDKInterface,
        synchronizerId?: Parameters<SDKInterface['ledger']['dar']['upload']>[2]
    ) => {
        const darFile = path.join(import.meta.dirname, pathToDar)
        const darBytes = readFileSync(darFile)

        await sdk.ledger.dar.upload(darBytes, packageId, synchronizerId, true)
    }

export const generateCommand = {
    create<CreateArgs>(templateId: string) {
        return (
            createArguments: CreateArgs
        ): WrappedCommand<'CreateCommand'> => ({
            CreateCommand: {
                templateId,
                createArguments,
            },
        })
    },
    exercise(templateId: string, choice: string) {
        return (
            args: Pick<
                WrappedCommand<'ExerciseCommand'>['ExerciseCommand'],
                'contractId' | 'choiceArgument'
            >
        ): WrappedCommand<'ExerciseCommand'> => ({
            ExerciseCommand: {
                templateId,
                contractId: args.contractId,
                choice,
                choiceArgument: args.choiceArgument,
            },
        })
    },
}
