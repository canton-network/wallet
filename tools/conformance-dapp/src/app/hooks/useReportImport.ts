// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'
import { validateReport } from '../../validation.ts'
import {
    redact,
    DiagnosticsSchema,
    type Report,
    type Signature,
    type TestResult,
    type Observation,
} from '../../report.ts'

/**
 * Never connects to a wallet. Signatures are detached, so an imported report
 * always starts out unsigned here; check it with the CLI's `verify` instead.
 */
export function useReportImport(options: {
    runActiveRef: RefObject<AbortController | null>
    signingActiveRef: RefObject<boolean>
    importingActiveRef: RefObject<boolean>
    setResults: Dispatch<SetStateAction<TestResult[]>>
    setObservations: Dispatch<SetStateAction<Observation[]>>
    setReport: Dispatch<SetStateAction<Report | undefined>>
    setSignature: Dispatch<SetStateAction<Signature | undefined>>
    setError: Dispatch<SetStateAction<string>>
    setDiagnosticsError: Dispatch<SetStateAction<string>>
}) {
    const { runActiveRef, signingActiveRef, importingActiveRef } = options
    const [importing, setImporting] = useState(false)

    async function importReport(file: File) {
        if (
            runActiveRef.current ||
            signingActiveRef.current ||
            importingActiveRef.current
        )
            return
        importingActiveRef.current = true
        setImporting(true)
        options.setError('')
        try {
            const next: unknown = JSON.parse(await file.text())
            validateReport(next)
            let importedObservations: Observation[] = []
            let warning = ''
            if (next.extra?.diagnostics !== undefined) {
                const parsed = DiagnosticsSchema.safeParse(
                    next.extra.diagnostics
                )
                if (parsed.success) {
                    try {
                        importedObservations = redact(parsed.data.observations)
                    } catch {
                        warning = 'Diagnostics could not be safely displayed'
                    }
                } else warning = 'Invalid diagnostic log data'
            }
            options.setReport(next)
            options.setSignature(undefined)
            options.setResults(next.results.tests)
            options.setObservations(importedObservations)
            options.setDiagnosticsError(warning)
        } catch (caught) {
            options.setError(
                caught instanceof Error ? caught.message : String(caught)
            )
        } finally {
            importingActiveRef.current = false
            setImporting(false)
        }
    }

    return { importing, importReport }
}
