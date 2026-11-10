// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PAYMASTER_API_URL?: string
    readonly VITE_PAYMASTER_PARTY_ID?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
