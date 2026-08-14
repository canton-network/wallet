// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { SDKInterface } from '@canton-network/wallet-sdk'
import { packageId } from './token'

export const vetDaml = async (sdk: SDKInterface) => {
    const darFile = path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        '../../../../.localnet/dars/splice-test-token-v1-1.0.0.dar'
    )
    const darBytes = readFileSync(darFile)

    await sdk.ledger.dar.upload(darBytes, packageId)
}
