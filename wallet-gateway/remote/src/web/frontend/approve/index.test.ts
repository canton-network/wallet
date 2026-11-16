// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fixture, waitUntil } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { PartyLevelRight } from '@canton-network/core-wallet-store'
import {
    TransactionApproveEvent,
    TransactionDeleteEvent,
} from '@canton-network/core-wallet-ui-components'
import {
    createMockUserClient,
    makeTransaction,
    makeWallet,
    mockRequest,
} from '../__tests__/test-helpers.js'
import { pingCreate, pingCreateHash } from '../__tests__/ping-transaction.js'

// The example Ping descriptor (core/tx-clear-signing/examples/descriptors/ping.json).
// Stored here so this project does not import a file outside its TypeScript program.
const pingDescriptor = {
    $schema: 'https://example.org/canton-clear-signing/v1/schema.json',
    context: {
        template: {
            packageId:
                'de2cc2f90eb523414ff54e899951dadd8789a4c07e0f71f6d6c9eaf57d412a54',
            moduleName: 'Canton.Internal.Ping',
            entityName: 'Ping',
        },
    },
    metadata: {
        version: '1.2.0',
        publisher: 'Blockdaemon',
        name: 'Canton ping',
    },
    display: {
        create: {
            intent: 'Ping',
            interpolatedIntent: 'Ping {id} from {initiator} to {responder}',
            fields: [
                { path: 'id', label: 'Ping ID', format: 'string' },
                { path: 'initiator', label: 'Initiator', format: 'party' },
                { path: 'responder', label: 'Responder', format: 'party' },
            ],
        },
        exercises: [
            {
                choice: 'Respond',
                intent: 'Respond to ping',
                interpolatedIntent:
                    'Respond to ping {@.contract.id} from {@.contract.initiator}',
                fields: [
                    {
                        path: '@.contract.id',
                        label: 'Ping ID',
                        format: 'string',
                    },
                    {
                        path: '@.contract.initiator',
                        label: 'Initiator',
                        format: 'party',
                    },
                ],
            },
            {
                choice: 'AbortPing',
                intent: 'Abort ping',
                interpolatedIntent:
                    'Abort ping {@.contract.id} from {@.contract.initiator}, as {anyone}',
                fields: [
                    {
                        path: '@.contract.id',
                        label: 'Ping ID',
                        format: 'string',
                    },
                    {
                        path: '@.contract.initiator',
                        label: 'Initiator',
                        format: 'party',
                    },
                    { path: 'anyone', label: 'Aborted by', format: 'party' },
                ],
            },
        ],
    },
    signatures: [],
}

// A fetch root decodes and hashes. clearSign reports it as undescribable, because only a create or
// an exercise root is described. An empty prepared transaction cannot be hashed, which would also
// disable approval.
const fetchRoot =
    'CtsDCgMyLjESATAa0AMKATDCPskDEsYDCgMyLjESQjAwODM2ZmE0NzAxNmQ4OWJmZWRlNjM5NzlhZDA0OTJkZWI3OGQ5Yzc4MDYzNWNiNDhlMTdhYWE5YjRlNGE2OTczOBoiY2FudG9uLWJ1aWx0aW4tYWRtaW4td29ya2Zsb3ctcGluZyJeCkBkZTJjYzJmOTBlYjUyMzQxNGZmNTRlODk5OTUxZGFkZDg3ODlhNGMwN2UwZjcxZjZkNmM5ZWFmNTdkNDEyYTU0EhRDYW50b24uSW50ZXJuYWwuUGluZxoEUGluZypRdjEtMDEtYWxpY2U6OjEyMjBlZTI2MjQxOTA4MzRkZGRmMjhmMTk0Njg1YWNlZThmMDBjYmRlOWVlMGQyMTFkYWUyNzdmNGQ3OTk4ODRmMjg5MlF2MS0wMS1hbGljZTo6MTIyMGVlMjYyNDE5MDgzNGRkZGYyOGYxOTQ2ODVhY2VlOGYwMGNiZGU5ZWUwZDIxMWRhZTI3N2Y0ZDc5OTg4NGYyODk6UXYxLTAxLWFsaWNlOjoxMjIwZWUyNjI0MTkwODM0ZGRkZjI4ZjE5NDY4NWFjZWU4ZjAwY2JkZTllZTBkMjExZGFlMjc3ZjRkNzk5ODg0ZjI4ORL/ARJ5ClF2MS0wMS1hbGljZTo6MTIyMGVlMjYyNDE5MDgzNGRkZGYyOGYxOTQ2ODVhY2VlOGYwMGNiZGU5ZWUwZDIxMWRhZTI3N2Y0ZDc5OTg4NGYyODkSJDUxMjFkMTIwLTNjNTMtNDEwMy04NmFhLTdhM2VhNjZlYzQ2NRpTZ2xvYmFsLWRvbWFpbjo6MTIyMGI5NTM5MWNkMDNlMTE4NzFkNTRlOTBjMjAyNTc1ZDI5ZTc2YzI2NWRkMzg4YjhhZmIwNWFhZDU0ZDY3MGRmYzYqJDhiOTBhNDQ4LTFmZmEtNDA0OS04NTNlLWY4YjRmZTg1M2RjMjCwqJjB5v+UAw=='
const fetchRootHash = 'E5qahj0hgHMh/gvQzwrmZpXv4BmXbewRLujEFbabegM='

const {
    mockCreateUserClient,
    showToast,
    handleErrorToast,
    setLocationHref,
    parsePreparedTransaction,
    detectCurrentOrigin,
} = vi.hoisted(() => ({
    mockCreateUserClient: vi.fn(),
    showToast: vi.fn(),
    handleErrorToast: vi.fn(),
    setLocationHref: vi.fn(),
    parsePreparedTransaction: vi.fn(() => ({ summary: 'parsed' })),
    detectCurrentOrigin: vi.fn().mockResolvedValue('http://localhost'),
}))

vi.mock('../index.js', () => ({}))
vi.mock('../navigation.js', () => ({ setLocationHref }))
vi.mock('../listeners.js', () => ({ detectCurrentOrigin }))
vi.mock('../rpc-client.js', () => ({
    createUserClient: mockCreateUserClient,
}))
vi.mock('../state-manager.js', () => ({
    VERSION_PREFIX: 'com.splice.wallet.v1',
    stateManager: {
        accessToken: { get: () => 'test-token' },
        currentOrigin: {
            get: vi.fn().mockReturnValue('http://localhost'),
            set: vi.fn(),
            clear: vi.fn(),
        },
    },
}))
vi.mock('../utils.js', () => ({ showToast }))
vi.mock('@canton-network/core-tx-visualizer', async (importOriginal) => ({
    ...(await importOriginal<
        typeof import('@canton-network/core-tx-visualizer')
    >()),
    parsePreparedTransaction,
}))
vi.mock('@canton-network/core-wallet-ui-components', async (importOriginal) => {
    const actual =
        await importOriginal<
            typeof import('@canton-network/core-wallet-ui-components')
        >()
    return {
        ...actual,
        handleErrorToast,
    }
})

import './index.js'
import type { ApproveUi } from './index.js'

const POLL_INTERVAL_MS = 3000

function mockApproveState(
    transaction = makeTransaction(),
    wallet = makeWallet({
        primary: true,
        partyId: 'party::ns',
        rights: [PartyLevelRight.CanActAs],
    })
) {
    mockRequest.mockImplementation(async ({ method }) => {
        if (method === 'getTransaction') {
            return transaction
        }
        if (method === 'listWallets') {
            return [wallet]
        }
        if (method === 'sign') {
            return {
                status: 'signed',
                signature: 'sig',
                signedBy: 'key',
                partyId: wallet.partyId,
            }
        }
        if (method === 'execute') {
            return {}
        }
        if (method === 'deleteTransaction') {
            return undefined
        }
        if (method === 'listClearSigningDescriptors') {
            return { descriptors: [pingDescriptor] }
        }
        return undefined
    })
}

describe('UserUiApprove', () => {
    let el: ApproveUi
    const componentFixture = html`<user-ui-approve></user-ui-approve>`

    beforeEach(() => {
        mockCreateUserClient.mockReset()
        mockRequest.mockReset()
        showToast.mockReset()
        handleErrorToast.mockReset()
        setLocationHref.mockReset()
        detectCurrentOrigin.mockClear()
        parsePreparedTransaction.mockClear()
        mockCreateUserClient.mockResolvedValue(createMockUserClient())
        vi.stubGlobal(
            'confirm',
            vi.fn(() => true)
        )
        history.replaceState({}, '', '?transactionId=tx-1')
    })

    afterEach(() => {
        document.body.innerHTML = ''
        vi.unstubAllGlobals()
        vi.useRealTimers()
    })

    describe('with default approve state', () => {
        beforeEach(async () => {
            mockApproveState()
            el = await fixture<ApproveUi>(componentFixture)
            await waitUntil(
                () => el.reviewedHash === pingCreateHash,
                'hash reviewed'
            )
        })

        it('loads transaction details from the URL and renders the detail view', () => {
            expect(el.transactionId).toBe('tx-1')
            expect(el.txHash).toBe(pingCreateHash)
            expect(el.reviewedHash).toBe(pingCreateHash)
            expect(parsePreparedTransaction).toHaveBeenCalledWith(pingCreate)
            expect(
                el.shadowRoot?.querySelector('wg-transaction-detail')
            ).not.toBeNull()
        })

        it('redirects to activities after approve when closeafteraction is not set', async () => {
            const closeSpy = vi
                .spyOn(window, 'close')
                .mockImplementation(() => {})

            el.shadowRoot
                ?.querySelector('wg-transaction-detail')
                ?.dispatchEvent(new TransactionApproveEvent('cmd-1'))

            await waitUntil(() =>
                mockRequest.mock.calls.some((c) => c[0]?.method === 'execute')
            )
            await waitUntil(
                () => setLocationHref.mock.calls.length > 0,
                'redirect after approve',
                { timeout: 3000 }
            )

            // The approval carries the hash computed here from the transaction on screen.
            expect(mockRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    method: 'sign',
                    params: expect.objectContaining({
                        preparedTransactionHash: pingCreateHash,
                    }),
                })
            )
            expect(showToast).toHaveBeenCalledWith(
                '',
                'Activity executed successfully',
                'success'
            )
            expect(closeSpy).not.toHaveBeenCalled()
            expect(setLocationHref).toHaveBeenCalledWith(
                expect.stringContaining('/activities')
            )
            expect(el.disabled).toBe(true)
            closeSpy.mockRestore()
        })

        it('deletes transaction when reject is confirmed', async () => {
            el.shadowRoot
                ?.querySelector('wg-transaction-detail')
                ?.dispatchEvent(new TransactionDeleteEvent('cmd-1'))

            await waitUntil(() =>
                mockRequest.mock.calls.some(
                    (c) => c[0]?.method === 'deleteTransaction'
                )
            )
            await waitUntil(
                () => setLocationHref.mock.calls.length > 0,
                'redirect after reject',
                { timeout: 3000 }
            )

            expect(mockRequest).toHaveBeenCalledWith(
                expect.objectContaining({ method: 'deleteTransaction' })
            )
            expect(showToast).toHaveBeenCalledWith(
                '',
                'Activity rejected successfully',
                'success'
            )
            expect(setLocationHref).toHaveBeenCalledWith(
                expect.stringContaining('/activities')
            )
        })
    })

    describe('hash binding', () => {
        it('disables approval when the transaction does not match its hash', async () => {
            mockApproveState(
                makeTransaction({
                    preparedTransactionHash: btoa('x'.repeat(32)),
                })
            )
            el = await fixture<ApproveUi>(componentFixture)
            await waitUntil(() => el.hashMismatch, 'hash checked')

            expect(el.reviewedHash).toBeNull()
            expect(
                el.shadowRoot?.querySelector('.alert-danger')?.textContent
            ).toContain('does not match the hash')
            const detail = el.shadowRoot?.querySelector(
                'wg-transaction-detail'
            ) as (HTMLElement & { updateComplete: Promise<unknown> }) | null
            await detail?.updateComplete
            expect(
                detail?.shadowRoot?.querySelector('button.btn-primary')
            ).toHaveProperty('disabled', true)
        })
    })

    describe('clear signing', () => {
        it('describes the transaction with the stored descriptors', async () => {
            mockApproveState(
                makeTransaction({ preparedTransaction: pingCreate })
            )
            el = await fixture<ApproveUi>(componentFixture)
            await waitUntil(
                () => el.clearSigning !== null,
                'transaction described'
            )

            expect(el.clearSigning?.complete).toBe(true)
            expect(el.clearSigning?.operations[0]?.intent).toMatch(
                /^Ping "[^"]+" from /
            )
            expect(el.clearSigning?.operations[0]).toMatchObject({
                kind: 'create',
                template: {
                    packageId:
                        'de2cc2f90eb523414ff54e899951dadd8789a4c07e0f71f6d6c9eaf57d412a54',
                },
                descriptor: {
                    name: 'Canton ping',
                },
            })
            const detail = el.shadowRoot?.querySelector(
                'wg-transaction-detail'
            ) as
                | (HTMLElement & {
                      updateComplete: Promise<unknown>
                      clearSigning: unknown
                  })
                | null
            await el.updateComplete
            await detail?.updateComplete
            expect(detail?.clearSigning).toBe(el.clearSigning)
            expect(detail?.shadowRoot?.textContent).toContain(
                'de2cc2f90eb523414ff54e899951dadd8789a4c07e0f71f6d6c9eaf57d412a54'
            )
            expect(
                detail?.shadowRoot?.querySelector('button.btn-primary')
            ).toHaveProperty('disabled', false)
        })

        it('shows the intent and fields as clearSign words them', async () => {
            mockApproveState(
                makeTransaction({ preparedTransaction: pingCreate })
            )
            el = await fixture<ApproveUi>(componentFixture)
            await waitUntil(
                () => el.clearSigning !== null,
                'transaction described'
            )
            const detail = el.shadowRoot?.querySelector(
                'wg-transaction-detail'
            ) as
                | (HTMLElement & {
                      updateComplete: Promise<unknown>
                      clearSigning: unknown
                  })
                | null
            const template = el.clearSigning?.operations[0]?.template
            if (!detail || !template) throw new Error('nothing rendered')
            detail.clearSigning = {
                complete: true,
                operations: [
                    {
                        kind: 'create',
                        template,
                        status: 'described',
                        intent: 'Memo "" was set',
                        fields: [{ label: 'Memo', value: '""' }],
                    },
                ],
            }
            await detail.updateComplete

            const root = detail.shadowRoot
            expect(root?.querySelector('.intent')?.textContent).toContain(
                'Memo "" was set'
            )
            expect(
                root?.querySelector('.operation-fields dd')?.textContent?.trim()
            ).toBe('""')
        })

        it('shows why a transaction cannot be described', async () => {
            mockApproveState(
                makeTransaction({
                    preparedTransaction: fetchRoot,
                    preparedTransactionHash: fetchRootHash,
                })
            )
            el = await fixture<ApproveUi>(componentFixture)
            await waitUntil(
                () => el.clearSigning !== null,
                'transaction described'
            )

            expect(el.clearSigning?.complete).toBe(false)
            expect(el.clearSigning?.operations[0]).toMatchObject({
                kind: 'other',
                status: 'undescribable',
            })
            const detail = el.shadowRoot?.querySelector(
                'wg-transaction-detail'
            ) as HTMLElement | null
            await (detail as { updateComplete?: Promise<unknown> } | null)
                ?.updateComplete
            expect(
                detail?.shadowRoot?.querySelector('.alert-warning')?.textContent
            ).toContain('not described')
            const approve =
                detail?.shadowRoot?.querySelector('button.btn-primary')
            expect(approve).toHaveProperty('disabled', false)
        })
    })

    describe('preview', () => {
        afterEach(() => {
            history.replaceState({}, '', window.location.pathname)
        })

        it('hashes the transaction itself and describes it', async () => {
            mockRequest.mockImplementation(async ({ method }) => {
                if (method === 'listClearSigningDescriptors') {
                    return { descriptors: [pingDescriptor] }
                }
                return undefined
            })
            history.replaceState(
                {},
                '',
                `#preview=${encodeURIComponent(pingCreate)}`
            )
            el = await fixture<ApproveUi>(componentFixture)
            await waitUntil(() => el.clearSigning !== null, 'preview described')

            expect(el.status).toBe('preview')
            expect(el.disabled).toBe(true)
            expect(el.txHash).toBe(pingCreateHash)
            expect(el.reviewedHash).toBe(pingCreateHash)
            expect(el.clearSigning?.complete).toBe(true)
            expect(mockRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    method: 'listClearSigningDescriptors',
                })
            )
            expect(mockRequest).not.toHaveBeenCalledWith(
                expect.objectContaining({ method: 'getTransaction' })
            )
            expect(
                el.shadowRoot?.querySelector('.alert-warning')?.textContent
            ).toContain('not a transaction to sign')
        })

        it('describes from the transaction when the fragment also carries a hash', async () => {
            history.replaceState(
                {},
                '',
                `#preview=${encodeURIComponent(pingCreate)}&hash=${encodeURIComponent(btoa('x'.repeat(32)))}`
            )
            el = await fixture<ApproveUi>(componentFixture)
            await waitUntil(() => el.clearSigning !== null, 'preview described')

            expect(el.txHash).toBe(pingCreateHash)
            expect(el.hashMismatch).toBe(false)
        })
    })

    describe('with closeafteraction in the URL', () => {
        beforeEach(async () => {
            history.replaceState({}, '', '?transactionId=tx-1&closeafteraction')
            mockApproveState()
            el = await fixture<ApproveUi>(componentFixture)
            await waitUntil(
                () => el.reviewedHash === pingCreateHash,
                'hash reviewed'
            )
        })

        it('closes the window after approve when opened from a dApp', async () => {
            setLocationHref.mockClear()
            const openerGet = vi
                .spyOn(window, 'opener', 'get')
                .mockReturnValue({} as Window)
            const closeSpy = vi
                .spyOn(window, 'close')
                .mockImplementation(() => {})

            el.shadowRoot
                ?.querySelector('wg-transaction-detail')
                ?.dispatchEvent(new TransactionApproveEvent('cmd-1'))

            await waitUntil(() =>
                mockRequest.mock.calls.some((c) => c[0]?.method === 'execute')
            )
            await waitUntil(
                () => closeSpy.mock.calls.length > 0,
                'close popup after approve',
                { timeout: 3000 }
            )

            openerGet.mockRestore()
            closeSpy.mockRestore()

            expect(setLocationHref).not.toHaveBeenCalled()
            expect(el.disabled).toBe(true)
        })
    })

    describe('with read-only wallet', () => {
        beforeEach(async () => {
            mockApproveState(
                makeTransaction(),
                makeWallet({
                    primary: true,
                    rights: [PartyLevelRight.CanReadAs],
                })
            )
            el = await fixture<ApproveUi>(componentFixture)
            await waitUntil(() => el.canSubmit === false)
        })

        it('shows read-only warning when primary wallet cannot submit', () => {
            expect(el.walletCapabilityMessage).toContain('read-only')
            expect(
                el.shadowRoot?.querySelector('.alert-warning')
            ).not.toBeNull()
        })

        it('does not sign when wallet is read-only', async () => {
            el.shadowRoot
                ?.querySelector('wg-transaction-detail')
                ?.dispatchEvent(new TransactionApproveEvent('cmd-1'))

            await waitUntil(() => showToast.mock.calls.length > 0)

            expect(mockRequest).not.toHaveBeenCalledWith(
                expect.objectContaining({ method: 'sign' })
            )
            expect(showToast).toHaveBeenCalledWith(
                'Read-only wallet',
                expect.any(String),
                'error'
            )
        })
    })

    it('starts polling when sign returns pending', async () => {
        vi.useFakeTimers()
        let txStatus = 'pending'

        // mockApproveState()
        mockRequest.mockImplementation(async ({ method }) => {
            if (method === 'getTransaction') {
                return makeTransaction({
                    status: txStatus,
                    ...(txStatus !== 'pending' && { externalTxId: 'ext-1' }),
                })
            }
            if (method === 'listWallets') {
                return [
                    makeWallet({
                        primary: true,
                        rights: [PartyLevelRight.CanActAs],
                        partyId: 'alice::1220abc',
                    }),
                ]
            }
            if (method === 'sign') {
                txStatus = 'awaiting-signature'
                return {
                    status: txStatus,
                    partyId: 'alice::1220abc',
                    externalTxId: 'ext-1',
                }
            }
            if (method === 'getTransactionStatus') {
                return { status: 'awaiting-signature', externalTxId: 'ext-1' }
            }
            return undefined
        })

        const element = document.createElement('user-ui-approve') as ApproveUi
        document.body.appendChild(element)
        el = element

        await vi.waitFor(() => expect(el.commandId).toBe('cmd-1'))

        el.shadowRoot
            ?.querySelector('wg-transaction-detail')
            ?.dispatchEvent(new TransactionApproveEvent('cmd-1'))

        await vi.waitFor(() => expect(el.status).toBe('awaiting-signature'))
        await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS)

        await vi.waitFor(() =>
            expect(
                mockRequest.mock.calls.some(
                    (c) => c[0]?.method === 'getTransactionStatus'
                )
            ).toBe(true)
        )
        expect(mockRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'getTransactionStatus',
                params: expect.objectContaining({ partyId: 'alice::1220abc' }),
            })
        )
    })

    it('ignores an in-flight transaction status response after the element is removed', async () => {
        vi.useFakeTimers()
        let resolveStatus!: (result: { status: 'signed' }) => void
        const statusResponse = new Promise<{ status: 'signed' }>((resolve) => {
            resolveStatus = resolve
        })
        mockRequest.mockImplementation(async ({ method }) => {
            if (method === 'getTransaction') {
                return makeTransaction({
                    status: 'awaiting-signature',
                    externalTxId: 'ext-1',
                })
            }
            if (method === 'listWallets') {
                return [
                    makeWallet({
                        primary: true,
                        partyId: 'alice::1220abc',
                        rights: [PartyLevelRight.CanActAs],
                    }),
                ]
            }
            if (method === 'getTransactionStatus') {
                return statusResponse
            }
            return undefined
        })

        const element = document.createElement('user-ui-approve') as ApproveUi
        document.body.appendChild(element)
        el = element

        await vi.waitFor(() => expect(el.status).toBe('awaiting-signature'))
        await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS)
        await vi.waitFor(() =>
            expect(
                mockRequest.mock.calls.some(
                    (call) => call[0]?.method === 'getTransactionStatus'
                )
            ).toBe(true)
        )
        const transactionLoadsBeforeRemoval = mockRequest.mock.calls.filter(
            (call) => call[0]?.method === 'getTransaction'
        ).length

        el.remove()
        resolveStatus({ status: 'signed' })
        await statusResponse
        await Promise.resolve()

        expect(el.status).toBe('awaiting-signature')
        expect(
            mockRequest.mock.calls.filter(
                (call) => call[0]?.method === 'getTransaction'
            )
        ).toHaveLength(transactionLoadsBeforeRemoval)
    })

    it('does not delete when reject confirmation is cancelled', async () => {
        vi.stubGlobal(
            'confirm',
            vi.fn(() => false)
        )
        mockApproveState()
        el = await fixture<ApproveUi>(componentFixture)
        await waitUntil(() => el.commandId === 'cmd-1')

        el.shadowRoot
            ?.querySelector('wg-transaction-detail')
            ?.dispatchEvent(new TransactionDeleteEvent('cmd-1'))

        await new Promise((r) => setTimeout(r, 50))

        expect(mockRequest).not.toHaveBeenCalledWith(
            expect.objectContaining({ method: 'deleteTransaction' })
        )
    })

    describe('failure reasons and error handling', () => {
        it('renders an alert warning when a failure reason exists', async () => {
            const txWithFailure = makeTransaction({
                failureReason: 'Insufficient funds or ledger rejection',
            })
            mockApproveState(txWithFailure)
            el = await fixture<ApproveUi>(componentFixture)
            await vi.waitFor(() => expect(el.commandId).toBe('cmd-1'))

            const warnings = el.shadowRoot?.querySelectorAll('.alert-warning')
            const hasFailureText = Array.from(warnings || []).some((node) =>
                node.textContent?.includes('Insufficient funds')
            )
            expect(hasFailureText).toBe(true)
        })

        it('refreshes state after a failed execute', async () => {
            let txStatus = 'signed'

            mockRequest.mockImplementation(async ({ method }) => {
                if (method === 'getTransaction') {
                    return makeTransaction({
                        status: txStatus,
                        ...(txStatus === 'failed' && {
                            failureReason: 'Ledger rejected submission',
                        }),
                    })
                }

                if (method === 'listWallets') {
                    return [
                        makeWallet({
                            primary: true,
                            partyId: 'alice::abc',
                            rights: [PartyLevelRight.CanActAs],
                        }),
                    ]
                }

                if (method === 'execute') {
                    txStatus = 'failed'
                    throw new Error('Ledger rejected submission')
                }

                return undefined
            })

            el = await fixture<ApproveUi>(componentFixture)
            await waitUntil(() => el.commandId === 'cmd-1')
            expect(el.status).toBe('signed')

            el.shadowRoot
                ?.querySelector('wg-transaction-detail')
                ?.dispatchEvent(new TransactionApproveEvent('cmd-1'))

            await waitUntil(
                () => el.status === 'failed',
                'state refreshed after failure'
            )

            expect(handleErrorToast).toHaveBeenCalled()
            expect(el.failureReason).toContain('Ledger rejected')
            expect(setLocationHref).not.toHaveBeenCalled()

            expect(mockRequest).not.toHaveBeenCalledWith(
                expect.objectContaining({ method: 'sign' })
            )
        })

        it('offers a retry only after a submit was not confirmed', async () => {
            let failureReason: string | undefined

            mockRequest.mockImplementation(async ({ method }) => {
                if (method === 'getTransaction') {
                    return makeTransaction({
                        status: 'signed',
                        ...(failureReason && { failureReason }),
                    })
                }
                if (method === 'listWallets') {
                    return [
                        makeWallet({
                            primary: true,
                            rights: [PartyLevelRight.CanActAs],
                        }),
                    ]
                }
                if (method === 'execute') {
                    failureReason = 'Ledger did not confirm the submission'
                    throw new Error(failureReason)
                }
                return undefined
            })

            el = await fixture<ApproveUi>(componentFixture)
            await waitUntil(() => el.commandId === 'cmd-1')
            const detail = el.shadowRoot?.querySelector(
                'wg-transaction-detail'
            ) as HTMLElement & { submitFailed: boolean }
            expect(detail.submitFailed).toBe(false)

            detail.dispatchEvent(new TransactionApproveEvent('cmd-1'))

            await waitUntil(
                () => el.failureReason !== null,
                'state refreshed after unconfirmed submit'
            )
            await el.updateComplete
            expect(el.status).toBe('signed')
            expect(detail.submitFailed).toBe(true)
        })
    })

    describe('visibility change polling synchronization', () => {
        let hidden = false
        beforeEach(() => {
            hidden = false
            Object.defineProperty(document, 'hidden', {
                configurable: true,
                get: () => hidden,
            })
        })

        afterEach(
            () => delete (document as unknown as { hidden?: boolean }).hidden
        )

        it('pauses polling while doc is hidden and resumes when visible', async () => {
            mockRequest.mockImplementation(async ({ method }) => {
                if (method === 'getTransaction') {
                    return makeTransaction({
                        status: 'awaiting-signature',
                        externalTxId: 'ext-1',
                    })
                }

                if (method === 'listWallets') {
                    return [
                        makeWallet({
                            primary: true,
                            partyId: 'alice::abc',
                            rights: [PartyLevelRight.CanActAs],
                        }),
                    ]
                }

                if (method === 'getTransactionStatus') {
                    return {
                        status: 'awaiting-signature',
                        externalTxId: 'ext-1',
                    }
                }

                return undefined
            })

            const element = document.createElement(
                'user-ui-approve'
            ) as ApproveUi
            document.body.appendChild(element)
            el = element

            await waitUntil(() => el.commandId === 'cmd-1')

            const pollCount = () =>
                mockRequest.mock.calls.filter(
                    (c) => c[0]?.method === 'getTransactionStatus'
                ).length

            hidden = true
            document.dispatchEvent(new Event('visibilitychange'))
            vi.useFakeTimers()
            hidden = false
            document.dispatchEvent(new Event('visibilitychange'))

            await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS)
            await vi.waitFor(() => expect(pollCount()).toBeGreaterThan(0))

            hidden = true
            document.dispatchEvent(new Event('visibilitychange'))

            await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 2)
            const whileHidden = pollCount()

            await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 5)
            expect(pollCount()).toBe(whileHidden)

            hidden = false
            document.dispatchEvent(new Event('visibilitychange'))

            await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS)
            await vi.waitFor(() =>
                expect(pollCount()).toBeGreaterThan(whileHidden)
            )
        })
    })
})
