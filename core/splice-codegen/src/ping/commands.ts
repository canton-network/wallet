// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PartyId } from '@canton-network/core-types'
import { generateCommand } from '../common'
import { packageId } from './dar'

const commands = {
    create: {
        ping: (partyId: PartyId) =>
            generateCommand.create(packageId)({
                id: `my-test-${new Date().getTime()}`,
                initiator: partyId,
                responder: partyId,
            }),
    },
    exercise: {
        pong: (contractId: string) =>
            generateCommand.exercise(
                packageId,
                'Respond'
            )({
                contractId,
                choiceArgument: {},
            }),
    },
}

export default commands
