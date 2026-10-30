// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Network } from '@canton-network/core-wallet-user-rpc-client'
import {
    deepQuerySelector,
    findAllByShadowRole,
    findByShadowRole,
    findByShadowText,
    queryByShadowRole,
    queryByShadowText,
} from 'shadow-dom-testing-library'
import { expect, fn, waitFor, type Mock, type userEvent } from 'storybook/test'
import { fillField } from '../__tests__/fields'
import { NetworkForm } from './NetworkForm'

type User = ReturnType<typeof userEvent.setup>

// The element changes the network it is given in place, so every story gets
// its own copy
const makeNetwork = (overrides: Partial<Network> = {}): Network => ({
    id: 'canton:devnet',
    name: 'DevNet',
    description: 'Canton DevNet',
    identityProviderId: 'idp-1',
    ledgerApi: 'http://localhost:6865',
    auth: {
        method: 'authorization_code',
        audience: 'aud',
        scope: 'scope',
        clientId: 'client-id',
    },
    ...overrides,
})

const clientCredentialsAuth = () =>
    ({
        method: 'client_credentials',
        audience: 'admin-aud',
        scope: 'admin-scope',
        clientId: 'admin-client',
        clientSecret: 'admin-secret',
    }) as const

const meta = {
    title: 'NetworkForm',
    component: NetworkForm,
    args: {
        onNetworkEditSave: fn(),
        onNetworkEditCancel: fn(),
        onNetworkDelete: fn(),
    },
} satisfies Meta<typeof NetworkForm>

export default meta

type Story = StoryObj<typeof meta>

const INVALID =
    'Invalid network data, please ensure all fields are set correctly'

const SECRET_HIDDEN =
    'Current secret is hidden. Enter a new value to replace it.'

// The labels aren't associated with their inputs, so a field is found as the
// input next to its visible label
const field = async (container: HTMLElement, label: string) => {
    const element = await findByShadowText(container, label, {
        selector: 'label',
    })
    return element.parentElement!.querySelector<HTMLElement>('input, select')!
}

// Each auth editor follows its section heading
const authSection = async (canvasElement: HTMLElement, name: string) => {
    const heading = await findByShadowRole(canvasElement, 'heading', { name })
    return heading.nextElementSibling as HTMLElement
}

// Fills a field and moves on, like a user tabbing to the next one
const fill = async (user: User, input: HTMLElement, text: string) => {
    await fillField(user, input, text)
    await user.tab()
}

const addButton = (canvasElement: HTMLElement) =>
    deepQuerySelector<HTMLElement>(
        canvasElement,
        '[data-test-id="add-network-button"]'
    )!

const update = (canvasElement: HTMLElement) =>
    findByShadowRole(canvasElement, 'button', { name: 'Update' })

// The network reported by the most recent save
const savedNetwork = (onSave: Mock | undefined) =>
    onSave?.mock.lastCall?.[0].network

export const Add: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        await waitFor(() => expect(addButton(canvasElement)).toBeVisible())
        await expect(addButton(canvasElement)).toHaveTextContent('Add')
        await expect(
            queryByShadowRole(canvasElement, 'button', { name: 'Update' })
        ).not.toBeInTheDocument()
        await expect(
            queryByShadowRole(canvasElement, 'button', { name: 'Cancel' })
        ).not.toBeInTheDocument()
        await expect(
            queryByShadowRole(canvasElement, 'heading', {
                name: 'Delete network',
            })
        ).not.toBeInTheDocument()

        const text = async (label: string, value: string) =>
            fill(userEvent, await field(canvasElement, label), value)
        await text('Network Id', 'new-net')
        await text('Name', 'New Network')
        await text('Description', 'A new network')
        await text('Identity Provider Id', 'idp-1')
        await text('Ledger API Base Url', 'http://localhost:6865')
        // The user auth is required, so its fields are shown straight away
        const userAuth = await authSection(canvasElement, 'Configure user auth')
        await fill(userEvent, await field(userAuth, 'Audience'), 'aud')
        await fill(userEvent, await field(userAuth, 'Scope'), 'scope')
        await fill(userEvent, await field(userAuth, 'Client Id'), 'client')

        await userEvent.click(addButton(canvasElement))

        // No synchronizer ID, admin auth or service account auth were entered
        await expect(args.onNetworkEditSave).toHaveBeenCalledOnce()
        await expect(savedNetwork(args.onNetworkEditSave)).toEqual({
            id: 'new-net',
            name: 'New Network',
            description: 'A new network',
            identityProviderId: 'idp-1',
            ledgerApi: 'http://localhost:6865',
            auth: {
                method: 'authorization_code',
                clientId: 'client',
                audience: 'aud',
                scope: 'scope',
            },
        })
    },
}

export const AddPrefilled: Story = {
    args: {
        network: makeNetwork({
            id: 'new-net',
            name: 'New Network',
            description: 'A new network',
        }),
    },
    play: async ({ args, canvasElement, userEvent }) => {
        await expect(await field(canvasElement, 'Network Id')).toHaveValue(
            'new-net'
        )

        await userEvent.click(addButton(canvasElement))
        await expect(args.onNetworkEditSave).toHaveBeenCalledOnce()
        await expect(savedNetwork(args.onNetworkEditSave)).toEqual(
            makeNetwork({
                id: 'new-net',
                name: 'New Network',
                description: 'A new network',
            })
        )
    },
}

export const RequiresFields: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        // The browser blocks submitting empty required fields
        await waitFor(() => expect(addButton(canvasElement)).toBeVisible())
        await userEvent.click(addButton(canvasElement))

        await expect(args.onNetworkEditSave).not.toHaveBeenCalled()
        await expect(await field(canvasElement, 'Network Id')).toBeInvalid()
        await expect(
            await field(canvasElement, 'Synchronizer Id')
        ).not.toBeRequired()
    },
}

export const Review: Story = {
    args: { mode: 'review', network: makeNetwork() },
    play: async ({ args, canvasElement, userEvent }) => {
        await expect(await field(canvasElement, 'Network Id')).toHaveValue(
            'canton:devnet'
        )
        await expect(
            await findByShadowRole(canvasElement, 'heading', {
                name: 'Configure user auth',
            })
        ).toBeVisible()
        await expect(
            await findByShadowRole(canvasElement, 'heading', {
                name: 'Delete network',
            })
        ).toBeVisible()
        await expect(
            deepQuerySelector(
                canvasElement,
                '[data-test-id="add-network-button"]'
            )
        ).toBeNull()

        await fill(userEvent, await field(canvasElement, 'Name'), 'New Name')
        await userEvent.click(await update(canvasElement))
        await expect(args.onNetworkEditSave).toHaveBeenCalledOnce()
        await expect(savedNetwork(args.onNetworkEditSave)).toEqual(
            makeNetwork({ name: 'New Name' })
        )
    },
}

export const Cancel: Story = {
    args: { mode: 'review', network: makeNetwork() },
    play: async ({ args, canvasElement, userEvent }) => {
        // The auth editors have Cancel buttons of their own only while editing
        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', { name: 'Cancel' })
        )
        await expect(args.onNetworkEditCancel).toHaveBeenCalledOnce()
        await expect(args.onNetworkEditSave).not.toHaveBeenCalled()
    },
}

export const Delete: Story = {
    args: { mode: 'review', network: makeNetwork({ id: 'delete-me' }) },
    play: async ({ args, canvasElement, userEvent }) => {
        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Delete Network',
            })
        )
        await expect(args.onNetworkDelete).toHaveBeenCalledOnce()
        await expect(args.onNetworkDelete?.mock.calls[0]?.[0].network).toEqual(
            makeNetwork({ id: 'delete-me' })
        )
        await expect(args.onNetworkEditSave).not.toHaveBeenCalled()
    },
}

export const InvalidLedgerApi: Story = {
    args: { mode: 'review', network: makeNetwork() },
    play: async ({ args, canvasElement, userEvent }) => {
        await expect(queryByShadowText(canvasElement, INVALID)).toBeNull()

        // Filled in, so the browser lets it through, but not a URL
        const ledgerApi = await field(canvasElement, 'Ledger API Base Url')
        await fill(userEvent, ledgerApi, 'not a url')
        await userEvent.click(await update(canvasElement))

        await expect(
            await findByShadowText(canvasElement, INVALID)
        ).toBeVisible()
        await expect(args.onNetworkEditSave).not.toHaveBeenCalled()

        await fill(userEvent, ledgerApi, 'https://ledger.example')
        await userEvent.click(await update(canvasElement))
        await expect(savedNetwork(args.onNetworkEditSave)).toEqual(
            makeNetwork({ ledgerApi: 'https://ledger.example' })
        )
    },
}

export const SynchronizerId: Story = {
    args: { mode: 'review', network: makeNetwork() },
    play: async ({ args, canvasElement, userEvent }) => {
        const synchronizerId = await field(canvasElement, 'Synchronizer Id')

        // It has to look like a synchronizer ID when it is set
        await fill(userEvent, synchronizerId, 'short')
        await userEvent.click(await update(canvasElement))
        await expect(
            await findByShadowText(canvasElement, INVALID)
        ).toBeVisible()
        await expect(args.onNetworkEditSave).not.toHaveBeenCalled()

        await fill(userEvent, synchronizerId, 'global-domain::1220abcd')
        await userEvent.click(await update(canvasElement))
        await expect(savedNetwork(args.onNetworkEditSave)).toEqual(
            makeNetwork({ synchronizerId: 'global-domain::1220abcd' })
        )

        // Emptying it leaves it out of the network again
        await fill(userEvent, synchronizerId, '')
        await userEvent.click(await update(canvasElement))
        await expect(args.onNetworkEditSave).toHaveBeenCalledTimes(2)
        await expect(savedNetwork(args.onNetworkEditSave)).toEqual(
            makeNetwork()
        )
    },
}

export const ClientCredentialsUserAuth: Story = {
    args: {
        mode: 'review',
        network: makeNetwork({
            ledgerApi: 'http://localhost:9999',
            auth: clientCredentialsAuth(),
        }),
    },
    play: async ({ args, canvasElement, userEvent }) => {
        await expect(
            await field(canvasElement, 'Ledger API Base Url')
        ).toHaveValue('http://localhost:9999')

        // The ledger API is validated as a URL but saved as entered
        await userEvent.click(await update(canvasElement))
        await expect(args.onNetworkEditSave).toHaveBeenCalledOnce()
        await expect(savedNetwork(args.onNetworkEditSave).ledgerApi).toBe(
            'http://localhost:9999'
        )

        const userAuth = await authSection(canvasElement, 'Configure user auth')
        // The current secret isn't shown, and leaving the field empty keeps it
        const secret = await field(userAuth, 'Client Secret')
        await expect(secret).toHaveValue('')
        await expect(secret).toHaveAttribute('placeholder', '********')
        await expect(secret).not.toBeRequired()
        await expect(
            await findByShadowText(userAuth, SECRET_HIDDEN)
        ).toBeVisible()
        await expect(savedNetwork(args.onNetworkEditSave).auth).toEqual(
            clientCredentialsAuth()
        )
        await fill(userEvent, secret, '')
        await userEvent.click(await update(canvasElement))
        await expect(savedNetwork(args.onNetworkEditSave).auth).toEqual(
            clientCredentialsAuth()
        )

        // Typing a new one replaces it
        await fill(userEvent, secret, 'new-secret')
        await waitFor(() =>
            expect(queryByShadowText(userAuth, SECRET_HIDDEN)).toBeNull()
        )
        await userEvent.click(await update(canvasElement))
        await expect(savedNetwork(args.onNetworkEditSave).auth).toEqual({
            ...clientCredentialsAuth(),
            clientSecret: 'new-secret',
        })

        // The identity provider can be overridden for this auth only
        const override = await field(userAuth, 'Identity Provider Id Override')
        await fill(userEvent, override, 'machine-idp')
        await userEvent.click(await update(canvasElement))
        await expect(savedNetwork(args.onNetworkEditSave).auth).toEqual({
            ...clientCredentialsAuth(),
            clientSecret: 'new-secret',
            identityProviderId: 'machine-idp',
        })

        // Switching methods away and back drops the method's own fields
        const method = await field(userAuth, 'Method')
        await userEvent.selectOptions(method, 'authorization_code')
        await waitFor(() =>
            expect(queryByShadowText(userAuth, 'Client Secret')).toBeNull()
        )
        await userEvent.selectOptions(method, 'client_credentials')
        await expect(
            await findByShadowText(userAuth, 'Client Secret')
        ).toBeVisible()
        await expect(
            await field(userAuth, 'Identity Provider Id Override')
        ).toHaveValue('')
    },
}

export const IdentityProviderOverride: Story = {
    args: {
        mode: 'review',
        network: makeNetwork({
            auth: { ...clientCredentialsAuth(), identityProviderId: 'idp-2' },
        }),
    },
    play: async ({ args, canvasElement, userEvent }) => {
        const userAuth = await authSection(canvasElement, 'Configure user auth')
        const override = await field(userAuth, 'Identity Provider Id Override')
        await expect(override).toHaveValue('idp-2')
        await expect(
            await findByShadowText(
                userAuth,
                'Optional. Uses the network identity provider when empty.'
            )
        ).toBeVisible()

        // Re-selecting the method keeps the override
        await userEvent.selectOptions(
            await field(userAuth, 'Method'),
            'client_credentials'
        )
        await userEvent.click(await update(canvasElement))
        await expect(savedNetwork(args.onNetworkEditSave).auth).toEqual({
            ...clientCredentialsAuth(),
            identityProviderId: 'idp-2',
        })

        // Clearing it leaves it out, so the network's provider is used
        await fill(userEvent, override, '')
        await userEvent.click(await update(canvasElement))
        await expect(savedNetwork(args.onNetworkEditSave).auth).toEqual(
            clientCredentialsAuth()
        )
    },
}

export const SwitchingUserAuthMethods: Story = {
    args: { mode: 'review', network: makeNetwork() },
    play: async ({ args, canvasElement, userEvent }) => {
        const userAuth = await authSection(canvasElement, 'Configure user auth')
        const method = await field(userAuth, 'Method')
        await expect(method).toHaveValue('authorization_code')
        await expect(
            queryByShadowRole(userAuth, 'button', { name: 'Cancel' })
        ).toBeNull()
        await expect(queryByShadowText(userAuth, 'Client Secret')).toBeNull()

        // Shared fields are carried over, and each method shows its own inputs
        await userEvent.selectOptions(method, 'client_credentials')
        const secret = await field(userAuth, 'Client Secret')
        await expect(secret).toBeRequired()
        await expect(secret).toHaveAttribute('placeholder', '')
        await expect(
            await findByShadowText(userAuth, 'Identity Provider Id Override')
        ).toBeVisible()
        await expect(queryByShadowText(userAuth, 'Issuer')).toBeNull()

        await userEvent.selectOptions(method, 'self_signed')
        await expect(await field(userAuth, 'Issuer')).toHaveValue('')
        await waitFor(() =>
            expect(
                queryByShadowText(userAuth, 'Identity Provider Id Override')
            ).toBeNull()
        )
        await fill(userEvent, await field(userAuth, 'Issuer'), 'https://iss')
        await fill(
            userEvent,
            await field(userAuth, 'Client Secret'),
            'signing-secret'
        )
        await userEvent.click(await update(canvasElement))
        await expect(savedNetwork(args.onNetworkEditSave).auth).toEqual({
            method: 'self_signed',
            clientId: 'client-id',
            audience: 'aud',
            scope: 'scope',
            issuer: 'https://iss',
            clientSecret: 'signing-secret',
        })

        await userEvent.selectOptions(method, 'self_issued')
        await waitFor(() =>
            expect(queryByShadowText(userAuth, 'Client Id')).toBeNull()
        )
        await expect(queryByShadowText(userAuth, 'Client Secret')).toBeNull()
        await userEvent.click(await update(canvasElement))
        await expect(savedNetwork(args.onNetworkEditSave).auth).toEqual({
            method: 'self_issued',
            audience: 'aud',
            scope: 'scope',
        })

        // Nothing to carry over from self_issued
        await userEvent.selectOptions(method, 'authorization_code')
        const clientId = await field(userAuth, 'Client Id')
        await expect(clientId).toHaveValue('')
        await fill(userEvent, clientId, 'new-client')
        await userEvent.click(await update(canvasElement))
        await expect(savedNetwork(args.onNetworkEditSave).auth).toEqual({
            method: 'authorization_code',
            clientId: 'new-client',
            audience: 'aud',
            scope: 'scope',
        })
    },
}

export const SwitchingFromSelfIssuedUserAuth: Story = {
    args: {
        mode: 'review',
        network: makeNetwork({
            auth: { method: 'self_issued', audience: 'aud', scope: 'scope' },
        }),
    },
    play: async ({ args, canvasElement, userEvent }) => {
        const userAuth = await authSection(canvasElement, 'Configure user auth')
        await expect(queryByShadowText(userAuth, 'Client Id')).toBeNull()

        await userEvent.selectOptions(
            await field(userAuth, 'Method'),
            'client_credentials'
        )
        await expect(await field(userAuth, 'Client Id')).toHaveValue('')
        await fill(userEvent, await field(userAuth, 'Client Id'), 'client')
        await fill(userEvent, await field(userAuth, 'Client Secret'), 'secret')
        await userEvent.click(await update(canvasElement))
        await expect(savedNetwork(args.onNetworkEditSave).auth).toEqual({
            method: 'client_credentials',
            clientId: 'client',
            audience: 'aud',
            scope: 'scope',
            clientSecret: 'secret',
        })
    },
}

export const UnsupportedUserAuthMethod: Story = {
    args: {
        mode: 'review',
        network: makeNetwork({
            auth: {
                method: 'unexpected_method',
                clientId: 'client-id',
                audience: 'aud',
                scope: 'scope',
            } as unknown as Network['auth'],
        }),
    },
    play: async ({ args, canvasElement, userEvent }) => {
        // The method select stays usable, with a warning, so it can be fixed
        const userAuth = await authSection(canvasElement, 'Configure user auth')
        await expect(
            await findByShadowText(
                userAuth,
                /Unsupported auth method "unexpected_method"/
            )
        ).toBeVisible()

        await userEvent.selectOptions(
            await field(userAuth, 'Method'),
            'authorization_code'
        )
        await waitFor(() =>
            expect(
                queryByShadowText(userAuth, /Unsupported auth method/)
            ).toBeNull()
        )
        await userEvent.click(await update(canvasElement))
        await expect(savedNetwork(args.onNetworkEditSave)).toEqual(
            makeNetwork()
        )
    },
}

export const AddingAdminAuth: Story = {
    args: { mode: 'review', network: makeNetwork() },
    play: async ({ args, canvasElement, userEvent }) => {
        const admin = await authSection(canvasElement, 'Configure admin auth')
        await expect(
            await findByShadowText(admin, 'No admin auth configured.')
        ).toBeVisible()

        await userEvent.click(
            await findByShadowRole(admin, 'button', { name: 'Add' })
        )
        await userEvent.selectOptions(
            await field(admin, 'Method'),
            'client_credentials'
        )
        await fill(userEvent, await field(admin, 'Audience'), 'admin-aud')
        await fill(userEvent, await field(admin, 'Scope'), 'admin-scope')
        await fill(userEvent, await field(admin, 'Client Id'), 'admin-client')
        await fill(
            userEvent,
            await field(admin, 'Client Secret'),
            'admin-secret'
        )

        await userEvent.click(await update(canvasElement))
        await expect(savedNetwork(args.onNetworkEditSave)).toEqual(
            makeNetwork({ adminAuth: clientCredentialsAuth() })
        )
    },
}

export const RemovingAdminAuth: Story = {
    args: {
        mode: 'review',
        network: makeNetwork({ adminAuth: clientCredentialsAuth() }),
    },
    play: async ({ args, canvasElement, userEvent }) => {
        const admin = await authSection(canvasElement, 'Configure admin auth')
        await expect(
            await findByShadowText(admin, 'admin-client')
        ).toBeVisible()

        await userEvent.click(
            await findByShadowRole(admin, 'button', { name: 'Remove' })
        )
        await expect(
            await findByShadowText(
                admin,
                'Admin auth will be removed after submitting this form.'
            )
        ).toBeVisible()

        // Removed from the saved network, not just hidden
        await userEvent.click(await update(canvasElement))
        await expect(savedNetwork(args.onNetworkEditSave)).toEqual(
            makeNetwork()
        )

        // Taking it back restores it
        await userEvent.click(
            await findByShadowRole(admin, 'button', { name: 'Cancel' })
        )
        await expect(
            await findByShadowText(admin, 'admin-client')
        ).toBeVisible()
        await userEvent.click(await update(canvasElement))
        await expect(savedNetwork(args.onNetworkEditSave)).toEqual(
            makeNetwork({ adminAuth: clientCredentialsAuth() })
        )
    },
}

export const AddingServiceAccountAuth: Story = {
    args: { mode: 'review', network: makeNetwork() },
    play: async ({ args, canvasElement, userEvent }) => {
        const serviceAccount = await authSection(
            canvasElement,
            'Configure service account auth'
        )
        await expect(
            await findByShadowText(
                serviceAccount,
                'No service account auth configured.'
            )
        ).toBeVisible()

        await userEvent.click(
            await findByShadowRole(serviceAccount, 'button', { name: 'Add' })
        )
        // Only client credentials are offered
        await expect(await field(serviceAccount, 'Method')).toHaveValue(
            'client_credentials'
        )
        await expect(
            await findAllByShadowRole(serviceAccount, 'option')
        ).toHaveLength(1)

        // A new secret is required, even once one was typed and cleared again
        const secret = await field(serviceAccount, 'Client Secret')
        await expect(secret).toBeRequired()
        await fill(userEvent, secret, 'abc')
        await fill(userEvent, secret, '')
        await expect(secret).toBeRequired()
        await expect(secret).toHaveAttribute('placeholder', '')
        await expect(
            queryByShadowText(serviceAccount, SECRET_HIDDEN)
        ).toBeNull()

        await fill(userEvent, await field(serviceAccount, 'Audience'), 'sa')
        await fill(userEvent, await field(serviceAccount, 'Scope'), 'sa')
        await fill(userEvent, await field(serviceAccount, 'Client Id'), 'sa')
        await userEvent.click(await update(canvasElement))
        await expect(args.onNetworkEditSave).not.toHaveBeenCalled()
        await expect(secret).toBeInvalid()

        await fill(userEvent, secret, 'sa-secret')
        await userEvent.click(await update(canvasElement))
        await expect(savedNetwork(args.onNetworkEditSave)).toEqual(
            makeNetwork({
                serviceAccountAuth: {
                    method: 'client_credentials',
                    audience: 'sa',
                    scope: 'sa',
                    clientId: 'sa',
                    clientSecret: 'sa-secret',
                },
            })
        )

        // Cancelling the new auth leaves it out again
        await userEvent.click(
            await findByShadowRole(serviceAccount, 'button', { name: 'Cancel' })
        )
        await userEvent.click(await update(canvasElement))
        await expect(savedNetwork(args.onNetworkEditSave)).toEqual(
            makeNetwork()
        )
    },
}

export const AddingSelfSignedAdminAuth: Story = {
    args: { mode: 'review', network: makeNetwork() },
    play: async ({ args, canvasElement, userEvent }) => {
        const admin = await authSection(canvasElement, 'Configure admin auth')
        const add = () =>
            findByShadowRole(admin, 'button', { name: 'Add' }).then((button) =>
                userEvent.click(button)
            )

        // Adding starts from the first method, with nothing filled in
        await add()
        await expect(await field(admin, 'Method')).toHaveValue(
            'authorization_code'
        )
        await expect(await field(admin, 'Client Id')).toHaveValue('')
        await userEvent.selectOptions(
            await field(admin, 'Method'),
            'self_issued'
        )
        await waitFor(() =>
            expect(queryByShadowText(admin, 'Client Id')).toBeNull()
        )
        await userEvent.click(
            await findByShadowRole(admin, 'button', { name: 'Cancel' })
        )
        await expect(
            await findByShadowText(admin, 'No admin auth configured.')
        ).toBeVisible()

        await add()
        await userEvent.selectOptions(
            await field(admin, 'Method'),
            'self_signed'
        )
        await expect(await field(admin, 'Issuer')).toHaveValue('')
        await fill(userEvent, await field(admin, 'Audience'), 'admin-aud')
        await fill(userEvent, await field(admin, 'Scope'), 'admin-scope')
        await fill(userEvent, await field(admin, 'Client Id'), 'admin-client')
        await fill(userEvent, await field(admin, 'Issuer'), 'https://iss')
        await fill(userEvent, await field(admin, 'Client Secret'), 'secret')
        await userEvent.click(await update(canvasElement))
        await expect(savedNetwork(args.onNetworkEditSave)).toEqual(
            makeNetwork({
                adminAuth: {
                    method: 'self_signed',
                    audience: 'admin-aud',
                    scope: 'admin-scope',
                    clientId: 'admin-client',
                    issuer: 'https://iss',
                    clientSecret: 'secret',
                },
            })
        )
    },
}

export const OptionalAuthSummaries: Story = {
    args: {
        mode: 'review',
        network: makeNetwork({
            adminAuth: {
                method: 'self_signed',
                audience: 'admin-aud',
                scope: 'admin-scope',
                clientId: 'admin-client',
                issuer: 'https://iss',
                clientSecret: '',
            },
            serviceAccountAuth: {
                method: 'client_credentials',
                audience: 'sa-aud',
                scope: 'sa-scope',
                clientId: 'sa-client',
                clientSecret: 'sa-secret',
                identityProviderId: 'machine-idp',
            },
        }),
    },
    play: async ({ canvasElement }) => {
        const admin = await authSection(canvasElement, 'Configure admin auth')
        for (const text of [
            'Method',
            'self_signed',
            'Client Id',
            'admin-client',
            'Audience',
            'admin-aud',
            'Scope',
            'admin-scope',
            'Issuer',
            'https://iss',
            'Client Secret',
            '(not set)',
        ]) {
            await expect(await findByShadowText(admin, text)).toBeVisible()
        }
        await expect(
            queryByShadowText(admin, 'No admin auth configured.')
        ).toBeNull()
        await expect(queryByShadowRole(admin, 'combobox')).toBeNull()

        const serviceAccount = await authSection(
            canvasElement,
            'Configure service account auth'
        )
        for (const text of [
            'client_credentials',
            'sa-client',
            'Identity Provider Id',
            'machine-idp',
            '********',
        ]) {
            await expect(
                await findByShadowText(serviceAccount, text)
            ).toBeVisible()
        }
        // The secret is never shown
        await expect(queryByShadowText(serviceAccount, 'sa-secret')).toBeNull()
        await expect(
            await findByShadowRole(serviceAccount, 'button', { name: 'Edit' })
        ).toBeEnabled()
        await expect(
            await findByShadowRole(serviceAccount, 'button', { name: 'Remove' })
        ).toBeEnabled()
    },
}

export const EditingServiceAccountAuth: Story = {
    args: {
        mode: 'review',
        network: makeNetwork({ serviceAccountAuth: clientCredentialsAuth() }),
    },
    play: async ({ args, canvasElement, userEvent }) => {
        const serviceAccount = await authSection(
            canvasElement,
            'Configure service account auth'
        )
        await userEvent.click(
            await findByShadowRole(serviceAccount, 'button', { name: 'Edit' })
        )

        // Editing starts from the current values, with the secret hidden
        const clientId = await field(serviceAccount, 'Client Id')
        await expect(clientId).toHaveValue('admin-client')
        const secret = await field(serviceAccount, 'Client Secret')
        await expect(secret).toHaveValue('')
        await expect(secret).toHaveAttribute('placeholder', '********')
        await expect(secret).not.toBeRequired()
        await expect(
            await findByShadowText(serviceAccount, SECRET_HIDDEN)
        ).toBeVisible()

        await fill(userEvent, secret, 'new-secret')
        await userEvent.click(await update(canvasElement))
        await expect(savedNetwork(args.onNetworkEditSave)).toEqual(
            makeNetwork({
                serviceAccountAuth: {
                    ...clientCredentialsAuth(),
                    clientSecret: 'new-secret',
                },
            })
        )

        // Clearing the replacement goes back to the secret from before editing
        await fill(userEvent, secret, '')
        await expect(secret).toHaveAttribute('placeholder', '********')
        await userEvent.click(await update(canvasElement))
        await expect(savedNetwork(args.onNetworkEditSave)).toEqual(
            makeNetwork({ serviceAccountAuth: clientCredentialsAuth() })
        )

        await fill(userEvent, clientId, 'changed')
        await userEvent.click(await update(canvasElement))
        await expect(
            savedNetwork(args.onNetworkEditSave).serviceAccountAuth.clientId
        ).toBe('changed')

        // Cancelling restores the original and goes back to the summary
        await userEvent.click(
            await findByShadowRole(serviceAccount, 'button', { name: 'Cancel' })
        )
        await expect(
            await findByShadowText(serviceAccount, 'admin-client')
        ).toBeVisible()
        await userEvent.click(await update(canvasElement))
        await expect(savedNetwork(args.onNetworkEditSave)).toEqual(
            makeNetwork({ serviceAccountAuth: clientCredentialsAuth() })
        )
    },
}

export const EditingAdminAuthMethod: Story = {
    args: {
        mode: 'review',
        network: makeNetwork({ adminAuth: makeNetwork().auth }),
    },
    play: async ({ args, canvasElement, userEvent }) => {
        const admin = await authSection(canvasElement, 'Configure admin auth')
        await userEvent.click(
            await findByShadowRole(admin, 'button', { name: 'Edit' })
        )
        await userEvent.selectOptions(
            await field(admin, 'Method'),
            'client_credentials'
        )

        // There was no secret before editing, so one has to be entered
        const secret = await field(admin, 'Client Secret')
        await fill(userEvent, secret, '')
        await expect(secret).toBeRequired()
        await expect(secret).toHaveAttribute('placeholder', '')
        await expect(queryByShadowText(admin, SECRET_HIDDEN)).toBeNull()
        await userEvent.click(await update(canvasElement))
        await expect(args.onNetworkEditSave).not.toHaveBeenCalled()

        await fill(userEvent, secret, 'admin-secret')
        await userEvent.click(await update(canvasElement))
        await expect(savedNetwork(args.onNetworkEditSave)).toEqual(
            makeNetwork({
                adminAuth: {
                    method: 'client_credentials',
                    audience: 'aud',
                    scope: 'scope',
                    clientId: 'client-id',
                    clientSecret: 'admin-secret',
                },
            })
        )
    },
}

export const ExposesE2eHooks: Story = {
    args: { mode: 'review', network: makeNetwork() },
    play: async ({ canvasElement }) => {
        // Used by the helpers in wallet-test-utils
        await waitFor(() =>
            expect(
                deepQuerySelector(
                    canvasElement,
                    '[data-test-id="update-network-button"]'
                )
            ).toHaveTextContent('Update')
        )
        await expect(
            deepQuerySelector(
                canvasElement,
                '[data-test-id="auth-editor-client-id-input"]'
            )
        ).toHaveValue('client-id')
    },
}
