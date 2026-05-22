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
} from '../test-helpers.js'

const {
    mockCreateUserClient,
    showToast,
    handleErrorToast,
    setLocationHref,
    parsePreparedTransaction,
} = vi.hoisted(() => ({
    mockCreateUserClient: vi.fn(),
    showToast: vi.fn(),
    handleErrorToast: vi.fn(),
    setLocationHref: vi.fn(),
    parsePreparedTransaction: vi.fn(() => ({ summary: 'parsed' })),
}))

vi.mock('../index.js', () => ({}))
vi.mock('../navigation.js', () => ({ setLocationHref }))
vi.mock('../rpc-client.js', () => ({
    createUserClient: mockCreateUserClient,
}))
vi.mock('../state-manager.js', () => ({
    stateManager: {
        accessToken: { get: () => 'test-token' },
    },
}))
vi.mock('../utils.js', () => ({ showToast }))
vi.mock('@canton-network/core-tx-visualizer', () => ({
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
import { ApproveUi } from './index.js'

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
        parsePreparedTransaction.mockClear()
        mockCreateUserClient.mockResolvedValue(createMockUserClient())
        vi.stubGlobal(
            'confirm',
            vi.fn(() => true)
        )
        history.replaceState({}, '', '?transactionId=tx-1')
    })

    afterEach(() => {
        // make sure toast is gone from DOM
        document.body.innerHTML = ''
        vi.unstubAllGlobals()
        vi.useRealTimers()
    })

    describe('with default approve state', () => {
        beforeEach(async () => {
            mockApproveState()
            el = await fixture<ApproveUi>(componentFixture)
            await waitUntil(
                () => el.commandId === 'cmd-1',
                'transaction loaded'
            )
        })

        it('loads transaction details from the URL and renders the detail view', () => {
            expect(el.transactionId).toBe('tx-1')
            expect(el.txHash).toBe('hash-abc')
            expect(parsePreparedTransaction).toHaveBeenCalledWith(
                'prepared-tx-blob'
            )
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

    describe('with closeafteraction in the URL', () => {
        beforeEach(async () => {
            history.replaceState({}, '', '?transactionId=tx-1&closeafteraction')
            mockApproveState()
            el = await fixture<ApproveUi>(componentFixture)
            await waitUntil(() => el.commandId === 'cmd-1')
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

    it('shows info toast when sign returns pending', async () => {
        mockApproveState()
        mockRequest.mockImplementation(async ({ method }) => {
            if (method === 'getTransaction') {
                return makeTransaction()
            }
            if (method === 'listWallets') {
                return [
                    makeWallet({
                        primary: true,
                        rights: [PartyLevelRight.CanActAs],
                    }),
                ]
            }
            if (method === 'sign') {
                return {
                    status: 'pending',
                    partyId: 'alice::1220abc',
                    externalTxId: 'ext-1',
                }
            }
            return undefined
        })
        el = await fixture<ApproveUi>(componentFixture)
        await waitUntil(() => el.commandId === 'cmd-1')

        el.shadowRoot
            ?.querySelector('wg-transaction-detail')
            ?.dispatchEvent(new TransactionApproveEvent('cmd-1'))

        await waitUntil(() => showToast.mock.calls.some((c) => c[2] === 'info'))

        expect(showToast).toHaveBeenCalledWith(
            'Activity pending',
            expect.stringContaining('external provider'),
            'info'
        )
        expect(setLocationHref).not.toHaveBeenCalled()
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
})
