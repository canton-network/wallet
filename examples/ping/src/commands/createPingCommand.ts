// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Corresponds to the built-in canton-builtin-admin-workflow-ping DAR every participant initializes with
import { Ping } from '@canton-network/core-splice-codegen'

export const createPingCommand = (party: string) => {
    return {
        commands: [Ping.commands.create.ping(party)],
    }
}

export const exercisePongCommand = (contractId: string) => {
    return {
        commands: [Ping.commands.exercise.pong(contractId)],
    }
}
