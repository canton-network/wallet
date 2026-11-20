// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/// <reference types="vite/client" />

// `compilerOptions.types` is only `node`. Under that setting the Vite reference leaves
// `import.meta.glob` untyped, so the tests declare the call they use.
interface ImportMeta {
    glob: <T = unknown>(
        pattern: string,
        options?: { eager?: boolean; import?: string }
    ) => Record<string, T>
}
