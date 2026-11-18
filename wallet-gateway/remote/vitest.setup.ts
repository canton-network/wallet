// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { config } from 'dotenv'

const root = fileURLToPath(new URL('.', import.meta.url))
config({ path: resolve(root, '.env.local') })
