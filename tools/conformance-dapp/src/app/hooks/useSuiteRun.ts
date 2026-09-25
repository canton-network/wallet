// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef, useState } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'
import { ConfigSchema, type Config } from '../../config.ts'
import { createSession } from '../../session.ts'
import { runSuite } from '../../suite.ts'
import { cases } from '../../tests/index.ts'
import type {
    Report,
    Signature,
    TestResult,
    Observation,
} from '../../report.ts'
import type {
    Interaction,
    InteractionHandler,
} from '@canton-network/core-provider-conformance'

type Prompt = {
    interaction: Interaction
    finish: () => void
    fail: () => void
    cancel: () => void
}

export type PendingRequest = {
    testId: string
    method: string
    fail: () => void
}

/**
 * A wallet that answers promptly should never flash a dialog, so only a
 * request still outstanding after this long opens one.
 */
const WAITING_DIALOG_DELAY_MS = 3000

/**
 * `runActiveRef`/`signingActiveRef`/`importingActiveRef` are shared with the
 * signing and import hooks so only one activity runs at a time.
 */
export function useSuiteRun(options: {
    runActiveRef: RefObject<AbortController | null>
    signingActiveRef: RefObject<boolean>
    importingActiveRef: RefObject<boolean>
    setResults: Dispatch<SetStateAction<TestResult[]>>
    setObservations: Dispatch<SetStateAction<Observation[]>>
    setReport: Dispatch<SetStateAction<Report | undefined>>
    setSignature: Dispatch<SetStateAction<Signature | undefined>>
    setError: Dispatch<SetStateAction<string>>
    setDiagnosticsError: Dispatch<SetStateAction<string>>
    setConfigText: Dispatch<SetStateAction<string>>
    signIfConfigured: (report: Report) => Promise<void>
}) {
    const { runActiveRef, signingActiveRef, importingActiveRef } = options
    const [running, setRunning] = useState(false)
    const [phase, setPhase] = useState<'connecting' | 'testing' | 'finalizing'>(
        'connecting'
    )
    const [prompt, setPrompt] = useState<Prompt>()
    const [pending, setPending] = useState<PendingRequest>()
    const [waiting, setWaiting] = useState<PendingRequest>()
    const pendingRef = useRef<PendingRequest>(undefined)
    const promptRef = useRef(false)
    const waitTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

    /**
     * Restarts the countdown that opens the waiting dialog, run whenever the
     * outstanding request or the prompt changes. A prompt already says what is
     * awaited, so nothing opens while one is up, and acknowledging an action
     * starts the wait over rather than landing the tester in the dialog.
     */
    const restartWaiting = () => {
        clearTimeout(waitTimerRef.current)
        setWaiting(undefined)
        const current = pendingRef.current
        if (!current || promptRef.current) return
        waitTimerRef.current = setTimeout(
            () => setWaiting(current),
            WAITING_DIALOG_DELAY_MS
        )
    }
    useEffect(() => () => clearTimeout(waitTimerRef.current), [])

    const cancel = () =>
        runActiveRef.current?.abort(new Error('Run cancelled by tester'))

    /**
     * Ends the running case as failed instead of waiting for its timeout.
     * Rejecting an open prompt unwinds the wrapper that is waiting on the
     * tester, and aborting the case covers a request the wallet never answers;
     * the abort wins the race for the message the report records either way.
     */
    const failTest = () => {
        prompt?.fail()
        pending?.fail()
    }

    const manual: InteractionHandler = (interaction, signal) =>
        new Promise<void>((resolve, reject) => {
            const cleanup = () => {
                signal.removeEventListener('abort', abort)
                setPrompt(undefined)
                promptRef.current = false
                restartWaiting()
            }
            const abort = () => {
                cleanup()
                reject(signal.reason)
            }
            signal.addEventListener('abort', abort, { once: true })
            if (signal.aborted) return abort()
            promptRef.current = true
            restartWaiting()
            setPrompt({
                interaction,
                finish: () => {
                    cleanup()
                    resolve()
                },
                fail: () => {
                    cleanup()
                    reject(
                        new Error(
                            `Wallet did not ${interaction.decision} ${interaction.method}`
                        )
                    )
                },
                cancel,
            })
        })

    /**
     * `only`, if given, runs just those test cases; every other case is
     * skipped for this run without touching the caller's own `disabledTests`
     * selection, which is what gets persisted back via `setConfigText` below.
     */
    async function run(input: unknown, only?: string[]): Promise<Report> {
        if (runActiveRef.current) throw new Error('A run is already active')
        if (importingActiveRef.current)
            throw new Error('Report import is in progress')
        if (signingActiveRef.current)
            throw new Error('Wallet signing is in progress')
        const config = ConfigSchema.parse(input)
        const runConfig: Config = only
            ? {
                  ...config,
                  disabledTests: cases
                      .filter((testCase) => !only.includes(testCase.id))
                      .map((testCase) => testCase.id),
              }
            : config
        const controller = new AbortController()
        runActiveRef.current = controller
        setRunning(true)
        setPhase('connecting')
        options.setError('')
        options.setResults([])
        options.setObservations([])
        options.setDiagnosticsError('')
        options.setReport(undefined)
        options.setSignature(undefined)
        options.setConfigText(JSON.stringify(config, null, 2))
        try {
            const provider = await createSession(
                runConfig,
                manual,
                controller.signal
            )
            controller.signal.throwIfAborted()
            setPhase('testing')
            const next = await runSuite({
                config: runConfig,
                provider,
                signal: controller.signal,
                onResult: (result) =>
                    options.setResults((previous) => [...previous, result]),
                onObservation: (observation) =>
                    options.setObservations((previous) => [
                        ...previous,
                        observation,
                    ]),
                onPendingRequest: (outstanding) => {
                    pendingRef.current = outstanding
                    setPending(outstanding)
                    restartWaiting()
                },
                reconnect: async () => {
                    setPhase('connecting')
                    try {
                        return await createSession(
                            runConfig,
                            manual,
                            controller.signal
                        )
                    } finally {
                        setPhase('testing')
                    }
                },
            })
            setPhase('finalizing')
            options.setReport(next)
            await options.signIfConfigured(next)
            return next
        } catch (caught) {
            options.setError(
                caught instanceof Error ? caught.message : String(caught)
            )
            throw caught
        } finally {
            controller.abort(new Error('Run finished'))
            runActiveRef.current = null
            setRunning(false)
            setPrompt(undefined)
            setPending(undefined)
            promptRef.current = false
            pendingRef.current = undefined
            restartWaiting()
        }
    }

    return {
        running,
        phase,
        prompt,
        run,
        cancel,
        failTest,
        /** The prompt takes precedence: it already says what is awaited. */
        waiting: prompt ? undefined : waiting,
    }
}
