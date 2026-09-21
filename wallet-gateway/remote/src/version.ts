// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const pkg = JSON.parse(
    readFileSync(join(import.meta.dirname, '../package.json'), 'utf8')
)

export const GATEWAY_VERSION = pkg.version
