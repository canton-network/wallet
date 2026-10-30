// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fixture, waitUntil } from '@open-wc/testing-helpers'
import { html } from 'lit'
import {
    SigningProviderChangeEvent,
    WalletCardSelectEvent,
    WalletCreateEvent,
    type WgWalletCreateForm,
} from '@canton-network/core-wallet-ui-components'
import type {
    AllocateSelfIssuedWalletResult,
    SignSelfIssuedAccessTokenResult,
} from '@canton-network/core-wallet-user-rpc-client'
import {
    createMockUserClient,
    makeWallet,
    mockRequest,
} from '../__tests__/test-helpers.js'

const {
    mockCreateUserClient,
    handleErrorToast,
    showToast,
    shareUserSession,
    redirectToIntendedOrDefault,
    accessTokenSet,
    selfIssuedLoginSessionIdGet,
    selfIssuedLoginSessionIdClear,
    selfIssuedAccessTokenMessageIdGet,
    selfIssuedAccessTokenMessageIdSet,
    selfIssuedAccessTokenMessageIdClear,
    setLocationHref,
} = vi.hoisted(() => ({
    mockCreateUserClient: vi.fn(),
    handleErrorToast: vi.fn(),
    showToast: vi.fn(),
    shareUserSession: vi.fn(),
    redirectToIntendedOrDefault: vi.fn(),
    accessTokenSet: vi.fn(),
    selfIssuedLoginSessionIdGet: vi.fn(),
    selfIssuedLoginSessionIdClear: vi.fn(),
    selfIssuedAccessTokenMessageIdGet: vi.fn(),
    selfIssuedAccessTokenMessageIdSet: vi.fn(),
    selfIssuedAccessTokenMessageIdClear: vi.fn(),
    setLocationHref: vi.fn(),
}))

vi.mock('../rpc-client.js', () => ({
    createUserClient: mockCreateUserClient,
}))
vi.mock('../utils.js', () => ({ showToast }))
vi.mock('../index.js', () => ({
    shareUserSession,
    redirectToIntendedOrDefault,
}))
vi.mock('../state-manager.js', () => ({
    stateManager: {
        accessToken: { set: accessTokenSet },
        expirationDate: { set: vi.fn() },
        selfIssuedLoginSessionId: {
            get: selfIssuedLoginSessionIdGet,
            clear: selfIssuedLoginSessionIdClear,
        },
        selfIssuedAccessTokenMessageId: {
            get: selfIssuedAccessTokenMessageIdGet,
            set: selfIssuedAccessTokenMessageIdSet,
            clear: selfIssuedAccessTokenMessageIdClear,
        },
    },
}))
vi.mock('../navigation.js', () => ({ setLocationHref }))
vi.mock('../listeners.js', () => ({
    detectCurrentOrigin: vi.fn().mockResolvedValue('https://app.example'),
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
import type { UserUiSelfIssuedLogin } from './index.js'

const accessToken = `header.${btoa(JSON.stringify({ exp: 2_000_000_000 }))}.sig`
const listSigningProvidersRequest = vi.fn()
const getLoginModeRequest = vi.fn()
const listSigningProviderKeysRequest = vi.fn()
const createWalletRequest = vi.fn()
const allocateWalletRequest = vi.fn()
const signAccessTokenRequest = vi.fn()
const getAccessTokenStatusRequest = vi.fn()
const removeLoginSessionRequest = vi.fn()
const selfIssuedApiRequests = [
    listSigningProvidersRequest,
    getLoginModeRequest,
    listSigningProviderKeysRequest,
    createWalletRequest,
    allocateWalletRequest,
    signAccessTokenRequest,
    getAccessTokenStatusRequest,
    removeLoginSessionRequest,
]

async function advanceTimersByTime(ms: number) {
    vi.useFakeTimers()
    try {
        await vi.advanceTimersByTimeAsync(ms)
    } finally {
        vi.useRealTimers()
    }
}

function routeSelfIssuedApiRequest({
    method,
    params,
}: {
    method: string
    params?: unknown
}) {
    switch (method) {
        case 'listSigningProviders':
            return listSigningProvidersRequest(params)
        case 'getSelfIssuedLoginMode':
            return getLoginModeRequest(params)
        case 'listSelfIssuedSigningProviderKeys':
            return listSigningProviderKeysRequest(params)
        case 'createSelfIssuedWallet':
            return createWalletRequest(params)
        case 'allocateSelfIssuedWallet':
            return allocateWalletRequest(params)
        case 'signSelfIssuedAccessToken':
            return signAccessTokenRequest(params)
        case 'getSignSelfIssuedAccessTokenStatus':
            return getAccessTokenStatusRequest(params)
        case 'removeSelfIssuedLoginSession':
            return removeLoginSessionRequest(params)
        default:
            throw new Error(`Unexpected user API method: ${method}`)
    }
}

describe('UserUiSelfIssuedLogin', () => {
    beforeEach(() => {
        selfIssuedLoginSessionIdGet.mockReturnValue('onboarding-session-1')
        selfIssuedAccessTokenMessageIdGet.mockReturnValue(undefined)
        mockRequest.mockReset()
        selfIssuedApiRequests.forEach((request) => request.mockReset())
        mockRequest.mockImplementation(routeSelfIssuedApiRequest)
        mockCreateUserClient.mockReset()
        handleErrorToast.mockReset()
        showToast.mockReset()
        listSigningProvidersRequest.mockResolvedValue({
            signingProviders: ['participant', 'wallet-kernel', 'fireblocks'],
        })
        mockCreateUserClient.mockResolvedValue(createMockUserClient())
    })

    afterEach(() => {
        document.body.innerHTML = ''
        vi.clearAllMocks()
    })

    async function renderCreateForm() {
        const element = await fixture<UserUiSelfIssuedLogin>(
            html`<user-ui-self-issued-login></user-ui-self-issued-login>`
        )
        await waitUntil(
            () =>
                element.shadowRoot?.querySelector('wg-wallet-create-form') !==
                null
        )
        return element.shadowRoot!.querySelector<WgWalletCreateForm>(
            'wg-wallet-create-form'
        )!
    }

    describe('signing provider list', () => {
        it('offers only the configured signing providers that can sign messages', async () => {
            getLoginModeRequest.mockResolvedValue({ mode: 'create' })
            const form = await renderCreateForm()

            await waitUntil(() => form.signingProviders.length > 0)
            expect(listSigningProvidersRequest).toHaveBeenCalledOnce()
            expect(form.signingProviders).toEqual([
                'wallet-kernel',
                'fireblocks',
            ])
            expect(form.signingProvidersLoading).toBe(false)
        })

        it('shows an error and no signing providers when listing them fails', async () => {
            const error = new Error('listing failed')
            listSigningProvidersRequest.mockRejectedValue(error)
            getLoginModeRequest.mockResolvedValue({ mode: 'create' })
            const form = await renderCreateForm()

            await vi.waitFor(() =>
                expect(handleErrorToast).toHaveBeenCalledWith(error)
            )
            expect(form.signingProviders).toEqual([])
        })

        it('does not list signing providers when selecting an existing party', async () => {
            getLoginModeRequest.mockResolvedValue({
                mode: 'select',
                wallet: makeWallet({ status: 'allocated' }),
            })
            const element = await fixture<UserUiSelfIssuedLogin>(
                html`<user-ui-self-issued-login></user-ui-self-issued-login>`
            )
            await waitUntil(
                () =>
                    element.shadowRoot?.querySelector('wg-wallet-card') !== null
            )

            expect(listSigningProvidersRequest).not.toHaveBeenCalled()
        })
    })

    it('shows the create-party form, without a primary-wallet option, when login mode is create', async () => {
        getLoginModeRequest.mockResolvedValue({ mode: 'create' })
        const element = await fixture<UserUiSelfIssuedLogin>(
            html`<user-ui-self-issued-login></user-ui-self-issued-login>`
        )

        await waitUntil(
            () =>
                element.shadowRoot?.querySelector('wg-wallet-create-form') !==
                null
        )
        const form = element.shadowRoot?.querySelector('wg-wallet-create-form')
        expect(form).not.toBeNull()
        expect(form?.shadowRoot?.querySelector('#primary')).toBeNull()
    })

    describe('signing provider key selection', () => {
        it('lists the keys of a vault-based signing provider and creates the wallet with the selected key', async () => {
            getLoginModeRequest.mockResolvedValue({ mode: 'create' })
            listSigningProviderKeysRequest.mockResolvedValue({
                keys: [
                    { id: 'key-2', name: 'Vault B', publicKey: 'pk2' },
                    { id: 'key-1', name: 'Vault A', publicKey: 'pk1' },
                ],
            })
            createWalletRequest.mockResolvedValue({
                wallet: makeWallet({ status: 'initialized' }),
            })
            const form = await renderCreateForm()

            form.dispatchEvent(new SigningProviderChangeEvent('fireblocks'))
            await waitUntil(() => form.publicKeys.length === 2)

            expect(listSigningProviderKeysRequest).toHaveBeenCalledWith({
                sessionId: 'onboarding-session-1',
                signingProviderId: 'fireblocks',
            })
            expect(form.keySigningProviders).toEqual(['fireblocks'])
            expect(form.selectedSigningProvider).toBe('fireblocks')
            expect(form.publicKeys.map((key) => key.name)).toEqual([
                'Vault A',
                'Vault B',
            ])

            form.dispatchEvent(
                new WalletCreateEvent(
                    'auth-party',
                    'fireblocks',
                    false,
                    'Vault A'
                )
            )
            await vi.waitFor(() =>
                expect(createWalletRequest).toHaveBeenCalledWith({
                    sessionId: 'onboarding-session-1',
                    partyHint: 'auth-party',
                    signingProviderId: 'fireblocks',
                    keyName: 'Vault A',
                })
            )
        })

        it('does not list keys for a signing provider that generates its own key', async () => {
            getLoginModeRequest.mockResolvedValue({ mode: 'create' })
            const form = await renderCreateForm()

            form.dispatchEvent(new SigningProviderChangeEvent('wallet-kernel'))
            await form.updateComplete

            expect(form.selectedSigningProvider).toBe('wallet-kernel')
            expect(listSigningProviderKeysRequest).not.toHaveBeenCalled()
        })

        it('tells the user when the signing provider has no keys', async () => {
            getLoginModeRequest.mockResolvedValue({ mode: 'create' })
            listSigningProviderKeysRequest.mockResolvedValue({ keys: [] })
            const form = await renderCreateForm()

            form.dispatchEvent(new SigningProviderChangeEvent('fireblocks'))
            await vi.waitFor(() =>
                expect(showToast).toHaveBeenCalledWith(
                    'No public keys found',
                    'No public keys are available for the selected signing provider.',
                    'info'
                )
            )
        })
    })

    it('completes login immediately when party creation returns an allocated wallet', async () => {
        const initializedWallet = makeWallet({
            partyId: 'alice::namespace',
            status: 'allocated',
        })
        getLoginModeRequest.mockResolvedValue({ mode: 'create' })
        createWalletRequest.mockResolvedValue({ wallet: initializedWallet })
        signAccessTokenRequest.mockResolvedValue({
            status: 'connected',
            wallet: { ...initializedWallet, isAuthParty: true },
            accessToken,
            sessionId: 'onboarding-session-1',
        })

        const element = await fixture<UserUiSelfIssuedLogin>(
            html`<user-ui-self-issued-login></user-ui-self-issued-login>`
        )
        await waitUntil(
            () =>
                element.shadowRoot?.querySelector('wg-wallet-create-form') !==
                null
        )
        element.shadowRoot
            ?.querySelector('wg-wallet-create-form')
            ?.dispatchEvent(
                new WalletCreateEvent('auth-party', 'wallet-kernel', false)
            )

        await vi.waitFor(() =>
            expect(signAccessTokenRequest).toHaveBeenCalled()
        )

        expect(getLoginModeRequest).toHaveBeenCalledWith({
            sessionId: 'onboarding-session-1',
        })
        expect(createWalletRequest).toHaveBeenCalledWith({
            sessionId: 'onboarding-session-1',
            partyHint: 'auth-party',
            signingProviderId: 'wallet-kernel',
        })
        expect(signAccessTokenRequest).toHaveBeenCalledWith({
            sessionId: 'onboarding-session-1',
            partyId: 'alice::namespace',
        })
        await vi.waitFor(() =>
            expect(redirectToIntendedOrDefault).toHaveBeenCalledOnce()
        )
        expect(accessTokenSet).toHaveBeenCalledWith(
            accessToken,
            'https://app.example'
        )
        expect(selfIssuedLoginSessionIdClear).toHaveBeenCalledWith(
            'https://app.example'
        )
        expect(shareUserSession).toHaveBeenCalledWith(
            accessToken,
            'onboarding-session-1',
            'https://app.example'
        )
    })

    describe('party awaiting signing provider approval', () => {
        const POLL_MS = 20
        const pendingWallet = makeWallet({
            partyId: 'alice::namespace',
            status: 'initialized',
        })
        const allocatedWallet = makeWallet({
            partyId: 'alice::namespace',
            status: 'allocated',
        })
        const connected = {
            status: 'connected',
            wallet: { ...allocatedWallet, isAuthParty: true },
            accessToken,
            sessionId: 'onboarding-session-1',
        } satisfies SignSelfIssuedAccessTokenResult

        let el: UserUiSelfIssuedLogin | undefined
        let allocationResult: AllocateSelfIssuedWalletResult
        let loginResult: SignSelfIssuedAccessTokenResult

        beforeEach(() => {
            allocationResult = { wallet: pendingWallet }
            loginResult = connected
            getLoginModeRequest.mockResolvedValue({ mode: 'create' })
            createWalletRequest.mockResolvedValue({ wallet: pendingWallet })
            allocateWalletRequest.mockImplementation(
                async () => allocationResult
            )
            signAccessTokenRequest.mockImplementation(async () => loginResult)
        })

        afterEach(() => {
            el?.remove()
            el = undefined
        })

        async function createPendingParty() {
            el = await fixture<UserUiSelfIssuedLogin>(
                html`<user-ui-self-issued-login
                    .pollIntervalMs=${POLL_MS}
                ></user-ui-self-issued-login>`
            )
            await waitUntil(
                () =>
                    el?.shadowRoot?.querySelector('wg-wallet-create-form') !==
                    null
            )
            el.shadowRoot
                ?.querySelector('wg-wallet-create-form')
                ?.dispatchEvent(
                    new WalletCreateEvent('auth-party', 'dfns', false)
                )
            await vi.waitFor(() =>
                expect(allocateWalletRequest).toHaveBeenCalled()
            )
        }

        it('polls the party allocation and completes the login once allocated', async () => {
            await createPendingParty()

            expect(el?.shadowRoot?.textContent).toContain(
                'Waiting for approval'
            )
            expect(
                el?.shadowRoot?.querySelector(
                    '[data-testid="self-issued-login-retry"]'
                )
            ).toBeNull()
            expect(allocateWalletRequest).toHaveBeenCalledWith({
                sessionId: 'onboarding-session-1',
                partyId: 'alice::namespace',
            })

            allocationResult = { wallet: allocatedWallet }
            await vi.waitFor(() =>
                expect(redirectToIntendedOrDefault).toHaveBeenCalledOnce()
            )
            expect(signAccessTokenRequest).toHaveBeenCalledWith({
                sessionId: 'onboarding-session-1',
                partyId: 'alice::namespace',
            })
            expect(el?.shadowRoot?.querySelector('wg-wallet-card')).toBeNull()
            expect(el?.shadowRoot?.textContent).toContain('Logging in...')
            const pollsAfterAllocation = allocateWalletRequest.mock.calls.length
            await advanceTimersByTime(POLL_MS * 5)
            expect(allocateWalletRequest).toHaveBeenCalledTimes(
                pollsAfterAllocation
            )
        })

        it('switches to polling the login status when the login needs approval too', async () => {
            loginResult = {
                status: 'awaiting-signature',
                messageId: 'login-message-1',
            }
            allocationResult = { wallet: allocatedWallet }

            await createPendingParty()

            await vi.waitFor(() =>
                expect(getAccessTokenStatusRequest).toHaveBeenCalled()
            )
            expect(allocateWalletRequest).toHaveBeenCalledOnce()
        })

        it('lets the user retry the login when it fails after the party is allocated', async () => {
            const error = new Error('login failed')
            signAccessTokenRequest.mockRejectedValueOnce(error)
            allocationResult = { wallet: allocatedWallet }

            await createPendingParty()

            await vi.waitFor(() =>
                expect(handleErrorToast).toHaveBeenCalledWith(error)
            )
            await waitUntil(
                () => el?.shadowRoot?.querySelector('wg-wallet-card') !== null
            )
            el?.shadowRoot
                ?.querySelector('wg-wallet-card')
                ?.dispatchEvent(new WalletCardSelectEvent(allocatedWallet))
            await vi.waitFor(() =>
                expect(redirectToIntendedOrDefault).toHaveBeenCalledOnce()
            )
            expect(signAccessTokenRequest).toHaveBeenCalledTimes(2)
        })

        it('returns to the create form with an error when the allocation is rejected', async () => {
            await createPendingParty()

            allocationResult = {
                wallet: { ...pendingWallet, status: 'removed' },
            }
            await vi.waitFor(() =>
                expect(handleErrorToast).toHaveBeenCalledWith(
                    new Error('Party allocation was rejected')
                )
            )
            await waitUntil(
                () =>
                    el?.shadowRoot?.querySelector('wg-wallet-create-form') !==
                    null
            )
            const pollsAfterRejection = allocateWalletRequest.mock.calls.length
            await advanceTimersByTime(POLL_MS * 5)
            expect(allocateWalletRequest).toHaveBeenCalledTimes(
                pollsAfterRejection
            )
        })

        it('stops polling when the element is removed', async () => {
            await createPendingParty()

            el?.remove()
            const pollsAfterRemoval = allocateWalletRequest.mock.calls.length
            await advanceTimersByTime(POLL_MS * 5)

            expect(allocateWalletRequest).toHaveBeenCalledTimes(
                pollsAfterRemoval
            )
        })
    })

    it('shows the primary-party wallet when login mode is select', async () => {
        getLoginModeRequest.mockResolvedValue({
            mode: 'select',
            wallet: makeWallet(),
        })

        const element = await fixture<UserUiSelfIssuedLogin>(
            html`<user-ui-self-issued-login></user-ui-self-issued-login>`
        )

        await waitUntil(
            () => element.shadowRoot?.querySelector('wg-wallet-card') !== null
        )
        expect(
            element.shadowRoot?.querySelector('wg-wallet-create-form')
        ).toBeNull()
    })

    it('shows an error when there is no onboarding session', async () => {
        selfIssuedLoginSessionIdGet.mockReturnValue(undefined)

        const element = await fixture<UserUiSelfIssuedLogin>(
            html`<user-ui-self-issued-login></user-ui-self-issued-login>`
        )

        await waitUntil(
            () => element.shadowRoot?.querySelector('[role="alert"]') !== null
        )
        expect(
            element.shadowRoot?.querySelector('[role="alert"]')?.textContent
        ).toContain('No self-issued login session found')
        expect(
            element.shadowRoot?.querySelector('wg-wallet-create-form')
        ).toBeNull()
        expect(mockCreateUserClient).not.toHaveBeenCalled()
    })

    it('shows the select view with an error when select mode has no wallet', async () => {
        getLoginModeRequest.mockResolvedValue({ mode: 'select' })

        const element = await fixture<UserUiSelfIssuedLogin>(
            html`<user-ui-self-issued-login></user-ui-self-issued-login>`
        )

        await waitUntil(
            () => element.shadowRoot?.querySelector('[role="alert"]') !== null
        )
        expect(element.shadowRoot?.querySelector('h1')?.textContent).toContain(
            'Select authentication party'
        )
        expect(
            element.shadowRoot
                ?.querySelector('[role="alert"]')
                ?.textContent?.replace(/\s+/g, ' ')
        ).toContain('No wallet was found for the authentication party.')
        expect(element.shadowRoot?.querySelector('wg-wallet-card')).toBeNull()
        expect(
            element.shadowRoot?.querySelector('wg-wallet-create-form')
        ).toBeNull()
        expect(
            element.shadowRoot?.querySelector(
                '[data-testid="self-issued-login-back"]'
            )
        ).not.toBeNull()
    })

    it('removes the tokenless session and returns to login when Back is clicked', async () => {
        getLoginModeRequest.mockResolvedValue({ mode: 'create' })
        removeLoginSessionRequest.mockResolvedValue(undefined)
        const element = await fixture<UserUiSelfIssuedLogin>(
            html`<user-ui-self-issued-login></user-ui-self-issued-login>`
        )

        await waitUntil(
            () =>
                element.shadowRoot?.querySelector(
                    '[data-testid="self-issued-login-back"]'
                ) !== null
        )
        element.shadowRoot
            ?.querySelector<HTMLButtonElement>(
                '[data-testid="self-issued-login-back"]'
            )
            ?.click()

        await vi.waitFor(() => expect(setLocationHref).toHaveBeenCalledOnce())
        expect(removeLoginSessionRequest).toHaveBeenCalledWith({
            sessionId: 'onboarding-session-1',
        })
        expect(selfIssuedLoginSessionIdClear).toHaveBeenCalledWith(
            'https://app.example'
        )
        expect(setLocationHref).toHaveBeenCalledWith(
            expect.stringContaining('/login')
        )
    })

    describe('access token awaiting signing provider approval', () => {
        const POLL_MS = 20
        const pollingFixture = html`<user-ui-self-issued-login
            .pollIntervalMs=${POLL_MS}
        ></user-ui-self-issued-login>`
        const authWallet = makeWallet({
            partyId: 'alice::namespace',
            status: 'allocated',
            isAuthParty: true,
        })
        const connected = {
            status: 'connected',
            wallet: authWallet,
            accessToken,
            sessionId: 'onboarding-session-1',
        } satisfies SignSelfIssuedAccessTokenResult
        const awaitingSignature = {
            status: 'awaiting-signature',
            messageId: 'login-message-1',
        } satisfies SignSelfIssuedAccessTokenResult
        const failed = {
            status: 'failed',
            messageId: 'login-message-1',
            failureReason: 'Signing provider returned status: rejected',
        } satisfies SignSelfIssuedAccessTokenResult

        let el: UserUiSelfIssuedLogin | undefined
        let loginResult:
            | SignSelfIssuedAccessTokenResult
            | Promise<SignSelfIssuedAccessTokenResult>
        let statusResult: SignSelfIssuedAccessTokenResult

        beforeEach(() => {
            loginResult = awaitingSignature
            statusResult = awaitingSignature
            getLoginModeRequest.mockResolvedValue({
                mode: 'select',
                wallet: authWallet,
            })
            signAccessTokenRequest.mockImplementation(() => loginResult)
            getAccessTokenStatusRequest.mockImplementation(
                async () => statusResult
            )
        })

        afterEach(() => {
            el?.remove()
            el = undefined
        })

        async function selectAuthParty() {
            el = await fixture<UserUiSelfIssuedLogin>(pollingFixture)
            await waitUntil(
                () => el?.shadowRoot?.querySelector('wg-wallet-card') !== null
            )
            el.shadowRoot
                ?.querySelector('wg-wallet-card')
                ?.dispatchEvent(new WalletCardSelectEvent(authWallet))
        }

        it('polls the access token signature status and completes the login once signed', async () => {
            await selectAuthParty()

            await vi.waitFor(() =>
                expect(getAccessTokenStatusRequest).toHaveBeenCalled()
            )
            expect(selfIssuedAccessTokenMessageIdSet).toHaveBeenCalledWith(
                'login-message-1',
                'https://app.example'
            )
            expect(el?.shadowRoot?.textContent).toContain(
                'Waiting for approval'
            )
            expect(getAccessTokenStatusRequest).toHaveBeenCalledWith({
                sessionId: 'onboarding-session-1',
                messageId: 'login-message-1',
            })

            statusResult = connected
            await vi.waitFor(() =>
                expect(redirectToIntendedOrDefault).toHaveBeenCalledOnce()
            )
            expect(accessTokenSet).toHaveBeenCalledWith(
                accessToken,
                'https://app.example'
            )
            expect(selfIssuedAccessTokenMessageIdClear).toHaveBeenCalledWith(
                'https://app.example'
            )
            expect(el?.shadowRoot?.querySelector('wg-wallet-card')).toBeNull()
            expect(el?.shadowRoot?.textContent).toContain('Logging in...')
        })

        it('shows the failure reason, stops polling and lets the user try again', async () => {
            await selectAuthParty()
            await vi.waitFor(() =>
                expect(getAccessTokenStatusRequest).toHaveBeenCalled()
            )

            statusResult = failed
            await waitUntil(
                () => el?.shadowRoot?.querySelector('[role="alert"]') !== null
            )
            expect(
                el?.shadowRoot?.querySelector('[role="alert"]')?.textContent
            ).toContain('Signing provider returned status: rejected')
            const pollsAfterFailure =
                getAccessTokenStatusRequest.mock.calls.length
            await advanceTimersByTime(POLL_MS * 5)
            expect(getAccessTokenStatusRequest).toHaveBeenCalledTimes(
                pollsAfterFailure
            )

            let resolveRetry!: (result: SignSelfIssuedAccessTokenResult) => void
            loginResult = new Promise((resolve) => {
                resolveRetry = resolve
            })
            const tryAgain = el?.shadowRoot?.querySelector<HTMLButtonElement>(
                '[data-testid="self-issued-login-retry"]'
            )
            tryAgain?.click()
            await vi.waitFor(() =>
                expect(signAccessTokenRequest).toHaveBeenCalledTimes(2)
            )
            await el?.updateComplete

            expect(el?.shadowRoot?.querySelector('wg-wallet-card')).toBeNull()
            expect(
                el?.shadowRoot?.querySelector('[role="alert"]')
            ).not.toBeNull()
            expect(tryAgain?.disabled).toBe(true)
            expect(
                tryAgain?.querySelector(
                    '[data-testid="self-issued-login-retry-spinner"]'
                )
            ).not.toBeNull()

            resolveRetry(connected)
            await vi.waitFor(() =>
                expect(redirectToIntendedOrDefault).toHaveBeenCalledOnce()
            )
            expect(signAccessTokenRequest).toHaveBeenCalledTimes(2)
        })

        it('shows the failure reason without polling when signing fails immediately', async () => {
            loginResult = failed

            await selectAuthParty()

            await waitUntil(
                () => el?.shadowRoot?.querySelector('[role="alert"]') !== null
            )
            expect(
                el?.shadowRoot?.querySelector('[role="alert"]')?.textContent
            ).toContain('Signing provider returned status: rejected')
            await advanceTimersByTime(POLL_MS * 5)
            expect(getAccessTokenStatusRequest).not.toHaveBeenCalled()
        })

        it('resumes polling a stored login request after a reload', async () => {
            selfIssuedAccessTokenMessageIdGet.mockReturnValue('login-message-1')

            el = await fixture<UserUiSelfIssuedLogin>(pollingFixture)

            await vi.waitFor(() =>
                expect(getAccessTokenStatusRequest).toHaveBeenCalled()
            )
            expect(signAccessTokenRequest).not.toHaveBeenCalled()
            await waitUntil(() =>
                el?.shadowRoot?.textContent?.includes('Waiting for approval')
            )
        })

        it('shows a notice while checking the login status fails and hides it once it succeeds', async () => {
            await selectAuthParty()
            await vi.waitFor(() =>
                expect(getAccessTokenStatusRequest).toHaveBeenCalled()
            )
            const notice = () =>
                el?.shadowRoot?.querySelector(
                    '[data-testid="self-issued-login-poll-warning"]'
                ) ?? null
            expect(notice()).toBeNull()

            let statusError: Error | undefined = new Error('ledger down')
            getAccessTokenStatusRequest.mockImplementation(async () => {
                if (statusError) throw statusError
                return statusResult
            })
            await waitUntil(() => notice() !== null)
            expect(notice()?.textContent).toContain(
                'An error occurred while checking the approval'
            )
            expect(el?.shadowRoot?.textContent).toContain(
                'Waiting for approval'
            )

            statusError = undefined
            await waitUntil(() => notice() === null, undefined, {
                timeout: POLL_MS * 30,
            })
            expect(el?.shadowRoot?.textContent).toContain(
                'Waiting for approval'
            )
        })

        describe('while the page is hidden', () => {
            let hidden = false

            beforeEach(() => {
                hidden = false
                Object.defineProperty(document, 'hidden', {
                    configurable: true,
                    get: () => hidden,
                })
            })

            afterEach(() => {
                delete (document as { hidden?: boolean }).hidden
            })

            function setHidden(value: boolean) {
                hidden = value
                document.dispatchEvent(new Event('visibilitychange'))
            }

            it('stops polling and resumes once the page is visible again', async () => {
                await selectAuthParty()
                await vi.waitFor(() =>
                    expect(getAccessTokenStatusRequest).toHaveBeenCalled()
                )

                setHidden(true)
                const pollsWhileHidden =
                    getAccessTokenStatusRequest.mock.calls.length
                await advanceTimersByTime(POLL_MS * 5)
                expect(getAccessTokenStatusRequest).toHaveBeenCalledTimes(
                    pollsWhileHidden
                )

                setHidden(false)
                await vi.waitFor(() =>
                    expect(
                        getAccessTokenStatusRequest.mock.calls.length
                    ).toBeGreaterThan(pollsWhileHidden)
                )

                statusResult = connected
                await vi.waitFor(() =>
                    expect(redirectToIntendedOrDefault).toHaveBeenCalledOnce()
                )
            })
        })

        it('stops polling when the element is removed', async () => {
            await selectAuthParty()
            await vi.waitFor(() =>
                expect(getAccessTokenStatusRequest).toHaveBeenCalled()
            )

            el?.remove()
            const pollsAfterRemoval =
                getAccessTokenStatusRequest.mock.calls.length
            await advanceTimersByTime(POLL_MS * 5)

            expect(getAccessTokenStatusRequest).toHaveBeenCalledTimes(
                pollsAfterRemoval
            )
        })
    })
})
