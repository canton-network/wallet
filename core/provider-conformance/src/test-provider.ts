// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { DappClient } from '@canton-network/dapp-sdk'
import { z } from 'zod'

const REQUEST_SETTLEMENT_TIMEOUT_MS = 5000

const acknowledgementSchema = z.union([
    z.strictObject({ id: z.string(), completed: z.literal(true) }),
    z.strictObject({ id: z.string(), error: z.string() }),
])

type InteractionApi = Pick<
    DappClient,
    'connect' | 'signMessage' | 'prepareExecute'
>
export type InteractionMethod = keyof InteractionApi
export type Decision = 'approve' | 'reject'

export type Provider = ReturnType<DappClient['getProvider']>

/** Action-only hooks: resolve after approval/rejection, without starting an RPC. */
export type TestMethods = {
    [Method in InteractionMethod as `test_${Decision}${Capitalize<Method>}`]: (
        ...args: Parameters<InteractionApi[Method]>
    ) => Promise<void>
}

export type TestProvider = Provider & TestMethods

export const testMethodNames = [
    'test_approveConnect',
    'test_rejectConnect',
    'test_approveSignMessage',
    'test_rejectSignMessage',
    'test_approvePrepareExecute',
    'test_rejectPrepareExecute',
] as const satisfies readonly (keyof TestMethods)[]

export interface Interaction {
    id: string
    method: InteractionMethod
    decision: Decision
    params: unknown
}

/**
 * Performs the wallet action and resolves only when it is complete.
 * Must honor the signal, including an already-aborted signal, by cleaning up
 * pending interaction work and rejecting with signal.reason. The wrapper awaits
 * this handler directly; a handler that ignores cancellation can leave it pending.
 */
export type InteractionHandler = (
    interaction: Interaction,
    signal: AbortSignal
) => Promise<void>

export function abortable<T>(
    operation: Promise<T>,
    signal: AbortSignal
): Promise<T> {
    return new Promise((resolve, reject) => {
        const abort = () => reject(signal.reason)
        signal.addEventListener('abort', abort, { once: true })
        operation
            .then(resolve, reject)
            .finally(() => signal.removeEventListener('abort', abort))
        if (signal.aborted) {
            signal.removeEventListener('abort', abort)
            abort()
        }
    })
}

/** Starts the RPC, awaits its action hook, then awaits the real wallet outcome. */
export async function performInteraction<Method extends InteractionMethod>(
    provider: TestProvider,
    decision: Decision,
    signal: AbortSignal,
    ...args: Parameters<typeof provider.request<Method>>
) {
    signal.throwIfAborted()
    const outcome = provider.request<Method>(...args).then(
        (value) => ({ ok: true as const, value }),
        (error: unknown) => ({ ok: false as const, error })
    )
    const request = args[0]
    switch (request.method) {
        case 'connect':
            await (decision === 'approve'
                ? provider.test_approveConnect()
                : provider.test_rejectConnect())
            break
        case 'signMessage':
            await (decision === 'approve'
                ? provider.test_approveSignMessage(request.params)
                : provider.test_rejectSignMessage(request.params))
            break
        case 'prepareExecute':
            await (decision === 'approve'
                ? provider.test_approvePrepareExecute(request.params)
                : provider.test_rejectPrepareExecute(request.params))
            break
    }
    signal.throwIfAborted()
    const result = await abortable(
        outcome,
        AbortSignal.any([
            signal,
            AbortSignal.timeout(REQUEST_SETTLEMENT_TIMEOUT_MS),
        ])
    )
    if (!result.ok) throw result.error
    return result.value
}

export class WrappingTestProvider implements TestProvider {
    protected readonly provider: Provider
    readonly #handleInteraction: InteractionHandler
    readonly #signal: AbortSignal

    constructor(
        provider: Provider,
        handleInteraction: InteractionHandler,
        signal = new AbortController().signal
    ) {
        this.provider = provider
        this.#handleInteraction = handleInteraction
        this.#signal = signal
    }

    request: Provider['request'] = (args) => this.provider.request(args)
    on: Provider['on'] = (event, listener) => this.provider.on(event, listener)
    emit: Provider['emit'] = (event, ...args) =>
        this.provider.emit(event, ...args)
    removeListener: Provider['removeListener'] = (event, listener) =>
        this.provider.removeListener(event, listener)

    test_approveConnect: TestMethods['test_approveConnect'] = () =>
        this.#perform('approve', { method: 'connect' })
    test_rejectConnect: TestMethods['test_rejectConnect'] = () =>
        this.#perform('reject', { method: 'connect' })

    test_approveSignMessage: TestMethods['test_approveSignMessage'] = (
        params
    ) => this.#perform('approve', { method: 'signMessage', params })
    test_rejectSignMessage: TestMethods['test_rejectSignMessage'] = (params) =>
        this.#perform('reject', { method: 'signMessage', params })

    test_approvePrepareExecute: TestMethods['test_approvePrepareExecute'] = (
        params
    ) => this.#perform('approve', { method: 'prepareExecute', params })
    test_rejectPrepareExecute: TestMethods['test_rejectPrepareExecute'] = (
        params
    ) => this.#perform('reject', { method: 'prepareExecute', params })

    async #perform<Method extends InteractionMethod>(
        decision: Decision,
        ...args: Parameters<typeof this.request<Method>>
    ) {
        const { method } = args[0]
        const params = 'params' in args[0] ? args[0].params : undefined
        this.#signal.throwIfAborted()
        try {
            await this.#handleInteraction(
                { id: crypto.randomUUID(), method, decision, params },
                this.#signal
            )
        } catch (error) {
            if (
                this.#signal.aborted ||
                !(error && typeof error === 'object' && 'code' in error)
            )
                throw error
            throw new Error('Wallet action failed', { cause: error })
        }
        this.#signal.throwIfAborted()
    }
}

export class UserInteractionWrapper extends WrappingTestProvider {}

export class WindowEventWrapper extends WrappingTestProvider {
    constructor(
        provider: Provider,
        target: EventTarget = window,
        signal = new AbortController().signal
    ) {
        super(
            provider,
            async (interaction, signal) => {
                signal.throwIfAborted()
                const { promise, resolve, reject } =
                    Promise.withResolvers<void>()
                const abort = () => reject(signal.reason)
                const acknowledge = (event: Event) => {
                    const detail = (event as CustomEvent).detail as {
                        id?: unknown
                    } | null
                    if (detail?.id !== interaction.id) return
                    const acknowledgement =
                        acknowledgementSchema.safeParse(detail)
                    if (!acknowledgement.success) {
                        reject(
                            new Error(
                                `Window event listener sent a malformed acknowledgement for this interaction: ${z.prettifyError(acknowledgement.error)}`
                            )
                        )
                        return
                    }
                    if ('error' in acknowledgement.data)
                        reject(new Error(acknowledgement.data.error))
                    else resolve()
                }
                signal.addEventListener('abort', abort, { once: true })
                target.addEventListener('cip103:test:ack', acknowledge)
                try {
                    target.dispatchEvent(
                        new CustomEvent('cip103:test:interaction', {
                            detail: interaction,
                        })
                    )
                    await promise
                } finally {
                    target.removeEventListener('cip103:test:ack', acknowledge)
                    signal.removeEventListener('abort', abort)
                }
            },
            signal
        )
    }
}

export class WebhookWrapper extends WrappingTestProvider {
    constructor(
        provider: Provider,
        endpoint: string,
        signal = new AbortController().signal
    ) {
        super(
            provider,
            async (interaction, signal) => {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(interaction),
                    signal,
                    credentials: 'omit',
                    redirect: 'error',
                })
                if (!response.ok)
                    throw new Error(`Webhook returned HTTP ${response.status}`)
                const acknowledgement = acknowledgementSchema.safeParse(
                    await response.json()
                )
                if (!acknowledgement.success) {
                    throw new Error(
                        `Webhook responded with a malformed acknowledgement for this interaction: ${z.prettifyError(acknowledgement.error)}`
                    )
                }
                if (acknowledgement.data.id !== interaction.id)
                    throw new Error(
                        `Webhook responded with an acknowledgement for a different interaction`
                    )
                if ('error' in acknowledgement.data)
                    throw new Error(acknowledgement.data.error)
            },
            signal
        )
    }
}
