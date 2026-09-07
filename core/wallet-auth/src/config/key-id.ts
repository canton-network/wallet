// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuidv4 } from 'uuid'

// TODO there is a tiny chance of generating same uuid again, make sure you can't set keyId to a value already in use
export function generateKeyId(): string {
    return uuidv4()
}
