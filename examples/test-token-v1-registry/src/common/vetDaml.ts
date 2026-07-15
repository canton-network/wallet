// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sdk from './sdk'
import { readFileSync } from 'node:fs'
import { TestTokenV1 } from '@canton-network/core-token-standard'

/**
 * @customize The registry shouldn't be responsible for vetting daml files. We're doing this for development purposes only. Feel free to remove this when constructing your own token.
 */
const vetDaml = async () => {
    const darFile = path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        '../../../../.localnet/dars/splice-test-token-v1-1.0.0.dar'
    )
    const darBytes = readFileSync(darFile)

    await sdk.ledger.dar.upload(darBytes, TestTokenV1.packageId)
}

export default vetDaml
