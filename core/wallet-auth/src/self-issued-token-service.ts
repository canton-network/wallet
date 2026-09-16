// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { CompactJWSHeaderParameters, JWTPayload } from 'jose'
import { base64url } from 'jose'

// const header = {
//     "alg": "EdDSA",
//     "typ": "JWT"
// }

// TODO maybe a different type, or hardcode for header, based on what canton needs
export function prepareJwsForSigning(
    header: CompactJWSHeaderParameters,
    payload: JWTPayload
) {
    const encoder = new TextEncoder()

    const encodedHeader = base64url.encode(
        encoder.encode(JSON.stringify(header))
    )

    const encodedPayload = base64url.encode(
        encoder.encode(JSON.stringify(payload))
    )

    return `${encodedHeader}.${encodedPayload}`
}
