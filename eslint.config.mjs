// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createConfig } from '@canton-network/core-eslint-config'

const rootDir = dirname(fileURLToPath(import.meta.url))

export default createConfig({ rootDir })
