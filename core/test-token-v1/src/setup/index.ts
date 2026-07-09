// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * TestToken setup helpers.
 *
 * Locates and reads the compiled `splice-test-token-v1` DAR so callers can vet
 * it on their synchronizers without hard-coding the DAR's location relative to
 * their own source tree.
 */

import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

// This module is bundled to `dist/setup/index.{js,cjs}`; the DAR lives at
// `damljs/splice-test-token-v1/.daml/dist/` at the repo root, four levels up.
const HERE = path.dirname(fileURLToPath(import.meta.url))

/** Absolute path to the compiled `splice-test-token-v1-1.0.0.dar`. */
export const TEST_TOKEN_V1_DAR_PATH = path.resolve(
    HERE,
    '../../../../damljs/splice-test-token-v1/.daml/dist/splice-test-token-v1-1.0.0.dar'
)

/** Reads the compiled `splice-test-token-v1` DAR and returns its bytes. */
export function readTestTokenV1Dar(): Promise<Buffer> {
    return readFile(TEST_TOKEN_V1_DAR_PATH)
}
