// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Idp } from '@canton-network/core-wallet-user-rpc-client'

/** How the UI names each identity provider type of the config */
export const IDP_TYPE_LABELS: Record<Idp['type'], string> = {
    oauth: 'OIDC',
    self_signed: 'Self-signed',
    self_issued: 'Self-issued',
}
