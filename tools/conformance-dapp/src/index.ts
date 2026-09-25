// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Browser-safe exports for web-based conformance runners.
 *
 * This entrypoint must not import Node-only modules (fs, path, playwright, etc.).
 */

export { ConfigSchema, defaultConfig } from './config.ts'
export type { Config } from './config.ts'
export { runSuite, TEST_CASE_COUNT } from './suite.ts'
export { groups, cases } from './tests/index.ts'
export type { Case } from './tests/index.ts'
export type { Observation } from './report.ts'
export {
    signReport,
    signReportWithWallet,
    serializeReport,
    reportHash,
    runPassed,
    SignatureSchema,
} from './report.ts'
export type { Report, TestResult, Signature } from './report.ts'
export { exportReport, DiagnosticsSchema } from './report.ts'
export { validateReport, verifyReportSignature } from './validation.ts'
