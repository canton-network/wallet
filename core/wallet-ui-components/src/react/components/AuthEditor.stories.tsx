// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useState, type ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Auth } from '@canton-network/core-wallet-user-rpc-client'
import {
    deepQuerySelector,
    findByShadowRole,
    findByShadowText,
    queryByShadowRole,
    queryByShadowText,
} from 'shadow-dom-testing-library'
import { expect, fn, waitFor, type Mock } from 'storybook/test'
import { AuthEditor } from './AuthEditor'

const authorizationCode: Auth = {
    method: 'authorization_code',
    clientId: 'client-id',
    audience: 'aud',
    scope: 'scope',
}

const clientCredentials: Auth = {
    method: 'client_credentials',
    clientId: 'client-id',
    audience: 'aud',
    scope: 'scope',
    clientSecret: 'existing-secret',
}

// The labels aren't tied to their inputs, so the inputs are found by test id
const findInput = (canvasElement: HTMLElement, field: string) =>
    waitFor(() => {
        const input = deepQuerySelector(
            canvasElement,
            `[data-test-id="auth-editor-${field}-input"]`
        )
        expect(input).not.toBeNull()
        return input as HTMLInputElement
    })

const queryInput = (canvasElement: HTMLElement, field: string) =>
    deepQuerySelector(
        canvasElement,
        `[data-test-id="auth-editor-${field}-input"]`
    )

const findMethod = (canvasElement: HTMLElement) =>
    findByShadowRole(canvasElement, 'combobox')

// The auth reported by the most recent change event
const lastAuth = (onAuthChange: Mock | undefined) =>
    onAuthChange?.mock.lastCall?.[0].auth

// The editor is controlled: this keeps the auth it reports, like a parent form
const Harness = (props: ComponentProps<typeof AuthEditor>) => {
    const [auth, setAuth] = useState(props.auth)
    return (
        <AuthEditor
            {...props}
            auth={auth}
            onAuthChange={(event) => {
                props.onAuthChange?.(event)
                setAuth(event.auth)
            }}
        />
    )
}

const meta = {
    title: 'AuthEditor',
    component: AuthEditor,
    render: (args) => <Harness {...args} />,
    args: {
        onAuthChange: fn(),
    },
} satisfies Meta<typeof AuthEditor>

export default meta

type Story = StoryObj<typeof meta>

export const Required: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        // Without the optional flag the fields are shown straight away
        await expect(await findMethod(canvasElement)).toHaveValue(
            'authorization_code'
        )
        await expect(
            queryByShadowRole(canvasElement, 'button', { name: 'Add' })
        ).not.toBeInTheDocument()
        await expect(
            queryByShadowRole(canvasElement, 'button', { name: 'Cancel' })
        ).not.toBeInTheDocument()
        await expect(await findInput(canvasElement, 'client-id')).toBeRequired()
        await expect(
            queryInput(canvasElement, 'client-secret')
        ).not.toBeInTheDocument()
        await expect(
            queryInput(canvasElement, 'issuer')
        ).not.toBeInTheDocument()

        await userEvent.type(await findInput(canvasElement, 'client-id'), 'abc')
        await userEvent.tab()
        await expect(lastAuth(args.onAuthChange)).toEqual({
            method: 'authorization_code',
            clientId: 'abc',
            audience: '',
            scope: '',
        })
    },
}

export const Editing: Story = {
    args: { auth: authorizationCode },
    play: async ({ args, canvasElement, userEvent }) => {
        const audience = await findInput(canvasElement, 'audience')
        await expect(audience).toHaveValue('aud')

        await userEvent.clear(audience)
        await userEvent.type(audience, 'new-aud')
        await userEvent.tab()
        await expect(lastAuth(args.onAuthChange)).toEqual({
            ...authorizationCode,
            audience: 'new-aud',
        })

        const scope = await findInput(canvasElement, 'scope')
        await userEvent.clear(scope)
        await userEvent.type(scope, 'new-scope')
        await userEvent.tab()
        await expect(lastAuth(args.onAuthChange)).toEqual({
            ...authorizationCode,
            audience: 'new-aud',
            scope: 'new-scope',
        })
        // The edited values are what the controlled fields now show
        await expect(audience).toHaveValue('new-aud')
        await expect(scope).toHaveValue('new-scope')
    },
}

export const SwitchingMethods: Story = {
    args: { auth: authorizationCode },
    play: async ({ args, canvasElement, userEvent }) => {
        const method = await findMethod(canvasElement)

        // Shared fields are carried over, and each method shows its own inputs
        await userEvent.selectOptions(method, 'client_credentials')
        await expect(lastAuth(args.onAuthChange)).toEqual({
            method: 'client_credentials',
            clientId: 'client-id',
            audience: 'aud',
            scope: 'scope',
            clientSecret: '',
        })
        await findInput(canvasElement, 'client-secret')
        await findInput(canvasElement, 'identity-provider-id')
        await expect(
            await findByShadowText(
                canvasElement,
                'Optional. Uses the network identity provider when empty.'
            )
        ).toBeInTheDocument()
        await expect(
            queryInput(canvasElement, 'issuer')
        ).not.toBeInTheDocument()

        await userEvent.selectOptions(method, 'self_signed')
        await expect(lastAuth(args.onAuthChange)).toEqual({
            method: 'self_signed',
            clientId: 'client-id',
            audience: 'aud',
            scope: 'scope',
            issuer: '',
            clientSecret: '',
        })
        await findInput(canvasElement, 'client-secret')
        const issuer = await findInput(canvasElement, 'issuer')
        await waitFor(() =>
            expect(
                queryInput(canvasElement, 'identity-provider-id')
            ).not.toBeInTheDocument()
        )

        await userEvent.type(issuer, 'https://issuer')
        await userEvent.tab()
        await expect(lastAuth(args.onAuthChange)).toMatchObject({
            method: 'self_signed',
            issuer: 'https://issuer',
        })

        await userEvent.type(
            await findInput(canvasElement, 'client-secret'),
            'signing-secret'
        )
        await userEvent.tab()
        await expect(lastAuth(args.onAuthChange)).toMatchObject({
            method: 'self_signed',
            clientSecret: 'signing-secret',
        })

        await userEvent.selectOptions(method, 'self_issued')
        await expect(lastAuth(args.onAuthChange)).toEqual({
            method: 'self_issued',
            audience: 'aud',
            scope: 'scope',
        })
        await waitFor(() =>
            expect(
                queryInput(canvasElement, 'client-id')
            ).not.toBeInTheDocument()
        )
        await expect(
            queryInput(canvasElement, 'client-secret')
        ).not.toBeInTheDocument()

        // Nothing to carry over from self_issued
        await userEvent.selectOptions(method, 'authorization_code')
        await expect(lastAuth(args.onAuthChange)).toEqual({
            method: 'authorization_code',
            clientId: '',
            audience: 'aud',
            scope: 'scope',
        })
        await findInput(canvasElement, 'client-id')
    },
}

export const SwitchingFromSelfIssued: Story = {
    args: { auth: { method: 'self_issued', audience: 'aud', scope: 'scope' } },
    play: async ({ args, canvasElement, userEvent }) => {
        const method = await findMethod(canvasElement)

        await userEvent.selectOptions(method, 'client_credentials')
        await expect(lastAuth(args.onAuthChange)).toEqual({
            method: 'client_credentials',
            clientId: '',
            audience: 'aud',
            scope: 'scope',
            clientSecret: '',
        })

        await userEvent.selectOptions(method, 'self_issued')
        await userEvent.selectOptions(method, 'self_signed')
        await expect(lastAuth(args.onAuthChange)).toEqual({
            method: 'self_signed',
            clientId: '',
            audience: 'aud',
            scope: 'scope',
            issuer: '',
            clientSecret: '',
        })
    },
}

export const OnlyAllowedMethods: Story = {
    args: { allowedMethods: ['client_credentials'] },
    play: async ({ canvasElement }) => {
        // The first allowed method is the default
        await expect(await findMethod(canvasElement)).toHaveValue(
            'client_credentials'
        )
        await expect(
            await findByShadowRole(canvasElement, 'option')
        ).toHaveTextContent('client_credentials')
        await expect(
            await findInput(canvasElement, 'client-secret')
        ).toBeRequired()
    },
}

export const DefaultsToSelfSigned: Story = {
    args: { allowedMethods: ['self_signed', 'self_issued'] },
    play: async ({ canvasElement }) => {
        await expect(await findMethod(canvasElement)).toHaveValue('self_signed')
        await expect(await findInput(canvasElement, 'issuer')).toHaveValue('')
        await findInput(canvasElement, 'client-secret')
    },
}

export const DefaultsToSelfIssued: Story = {
    args: { allowedMethods: ['self_issued'] },
    play: async ({ canvasElement }) => {
        await expect(await findMethod(canvasElement)).toHaveValue('self_issued')
        await findInput(canvasElement, 'audience')
        await expect(
            queryInput(canvasElement, 'client-id')
        ).not.toBeInTheDocument()
    },
}

export const UnsupportedMethod: Story = {
    args: {
        auth: {
            method: 'unexpected_method',
            clientId: 'client-id',
            audience: 'aud',
            scope: 'scope',
        } as unknown as Auth,
    },
    play: async ({ args, canvasElement, userEvent }) => {
        // The method select stays usable, with a warning, so it can be fixed
        await expect(
            await findByShadowText(
                canvasElement,
                /Unsupported auth method "unexpected_method"/
            )
        ).toBeInTheDocument()

        await userEvent.selectOptions(
            await findMethod(canvasElement),
            'authorization_code'
        )
        await expect(lastAuth(args.onAuthChange)).toEqual(authorizationCode)
        await waitFor(() =>
            expect(
                queryByShadowText(canvasElement, /Unsupported auth method/)
            ).not.toBeInTheDocument()
        )
    },
}

export const OptionalEmpty: Story = {
    args: { optional: true },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowText(canvasElement, 'No auth configured.')
        ).toBeInTheDocument()
        await expect(
            await findByShadowRole(canvasElement, 'button', { name: 'Add' })
        ).toBeEnabled()
        await expect(
            queryByShadowRole(canvasElement, 'combobox')
        ).not.toBeInTheDocument()
    },
}

export const CustomTexts: Story = {
    args: {
        optional: true,
        emptyText: 'No admin auth configured.',
    },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowText(canvasElement, 'No admin auth configured.')
        ).toBeInTheDocument()
    },
}

export const AddAndCancel: Story = {
    args: { optional: true, allowedMethods: ['client_credentials'] },
    play: async ({ args, canvasElement, userEvent }) => {
        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', { name: 'Add' })
        )

        // Adding starts from the defaults of the first allowed method
        await expect(await findMethod(canvasElement)).toHaveValue(
            'client_credentials'
        )
        await findInput(canvasElement, 'client-secret')
        await expect(args.onAuthChange).not.toHaveBeenCalled()

        await userEvent.type(await findInput(canvasElement, 'client-id'), 'abc')
        await userEvent.tab()
        await expect(lastAuth(args.onAuthChange)).toMatchObject({
            clientId: 'abc',
        })

        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', { name: 'Cancel' })
        )
        await expect(lastAuth(args.onAuthChange)).toBeUndefined()
        await expect(
            await findByShadowText(canvasElement, 'No auth configured.')
        ).toBeInTheDocument()
    },
}

export const Summary: Story = {
    args: {
        optional: true,
        auth: { ...clientCredentials, identityProviderId: 'machine-idp' },
    },
    play: async ({ canvasElement }) => {
        await findByShadowText(canvasElement, 'Method')
        await findByShadowText(canvasElement, 'client_credentials')
        await findByShadowText(canvasElement, 'Client Id')
        await findByShadowText(canvasElement, 'client-id')
        await findByShadowText(canvasElement, 'Audience')
        await findByShadowText(canvasElement, 'aud')
        await findByShadowText(canvasElement, 'Scope')
        await findByShadowText(canvasElement, 'scope')
        await findByShadowText(canvasElement, 'Identity Provider Id')
        await findByShadowText(canvasElement, 'machine-idp')
        // The secret is never shown
        await findByShadowText(canvasElement, 'Client Secret')
        await findByShadowText(canvasElement, '********')
        await expect(
            queryByShadowText(canvasElement, 'existing-secret')
        ).not.toBeInTheDocument()

        await expect(
            await findByShadowRole(canvasElement, 'button', { name: 'Edit' })
        ).toBeEnabled()
        await expect(
            await findByShadowRole(canvasElement, 'button', { name: 'Remove' })
        ).toBeEnabled()
        await expect(
            queryByShadowRole(canvasElement, 'combobox')
        ).not.toBeInTheDocument()
        await expect(
            queryByShadowText(canvasElement, 'No auth configured.')
        ).not.toBeInTheDocument()
    },
}

export const SummaryWithoutSecret: Story = {
    args: {
        optional: true,
        auth: {
            method: 'self_signed',
            clientId: 'client-id',
            audience: 'aud',
            scope: 'scope',
            issuer: 'https://issuer',
            clientSecret: '',
        },
    },
    play: async ({ canvasElement }) => {
        await findByShadowText(canvasElement, 'Issuer')
        await findByShadowText(canvasElement, 'https://issuer')
        await expect(
            await findByShadowText(canvasElement, '(not set)')
        ).toBeInTheDocument()
    },
}

export const EditAndCancelRestores: Story = {
    args: { optional: true, auth: authorizationCode },
    play: async ({ args, canvasElement, userEvent }) => {
        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', { name: 'Edit' })
        )

        // Editing starts from the current values
        await expect(await findMethod(canvasElement)).toHaveValue(
            'authorization_code'
        )
        const clientId = await findInput(canvasElement, 'client-id')
        await expect(clientId).toHaveValue('client-id')

        await userEvent.clear(clientId)
        await userEvent.type(clientId, 'changed')
        await userEvent.tab()
        await expect(lastAuth(args.onAuthChange)).toEqual({
            ...authorizationCode,
            clientId: 'changed',
        })

        // Cancelling reports the original again and goes back to the summary
        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', { name: 'Cancel' })
        )
        await expect(lastAuth(args.onAuthChange)).toEqual(authorizationCode)
        await expect(
            await findByShadowRole(canvasElement, 'button', { name: 'Edit' })
        ).toBeEnabled()
        await findByShadowText(canvasElement, 'client-id')
    },
}

export const RemoveAndRestore: Story = {
    args: { optional: true, auth: clientCredentials },
    play: async ({ args, canvasElement, userEvent }) => {
        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', { name: 'Remove' })
        )

        await expect(args.onAuthChange).toHaveBeenCalledOnce()
        await expect(lastAuth(args.onAuthChange)).toBeUndefined()
        await expect(
            await findByShadowText(
                canvasElement,
                'Auth will be removed after submitting this form.'
            )
        ).toBeInTheDocument()

        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', { name: 'Cancel' })
        )
        await expect(lastAuth(args.onAuthChange)).toEqual(clientCredentials)
        await expect(
            await findByShadowRole(canvasElement, 'button', { name: 'Edit' })
        ).toBeEnabled()
    },
}

export const CustomPendingRemoveText: Story = {
    args: {
        optional: true,
        auth: clientCredentials,
        pendingRemoveText: 'Admin auth will be removed on save.',
    },
    play: async ({ canvasElement, userEvent }) => {
        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', { name: 'Remove' })
        )
        await expect(
            await findByShadowText(
                canvasElement,
                'Admin auth will be removed on save.'
            )
        ).toBeInTheDocument()
    },
}

export const ExistingSecretIsHidden: Story = {
    args: { auth: clientCredentials },
    play: async ({ args, canvasElement, userEvent }) => {
        const secret = await findInput(canvasElement, 'client-secret')
        // The current secret isn't shown, and leaving the field empty keeps it
        await expect(secret).toHaveValue('')
        await expect(secret).toHaveAttribute('placeholder', '********')
        await expect(secret).not.toBeRequired()
        await expect(
            await findByShadowText(
                canvasElement,
                'Current secret is hidden. Enter a new value to replace it.'
            )
        ).toBeInTheDocument()

        await userEvent.type(secret, 'new-secret')
        await userEvent.tab()
        await expect(lastAuth(args.onAuthChange)).toEqual({
            ...clientCredentials,
            clientSecret: 'new-secret',
        })
        await waitFor(() =>
            expect(
                queryByShadowText(canvasElement, /Current secret is hidden/)
            ).not.toBeInTheDocument()
        )
    },
}

export const ClearingReplacementKeepsExistingSecret: Story = {
    args: { optional: true, auth: clientCredentials },
    play: async ({ args, canvasElement, userEvent }) => {
        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', { name: 'Edit' })
        )
        const secret = await findInput(canvasElement, 'client-secret')

        await userEvent.type(secret, 'new-secret')
        await userEvent.tab()
        await expect(lastAuth(args.onAuthChange)).toMatchObject({
            clientSecret: 'new-secret',
        })

        await userEvent.clear(secret)
        await userEvent.tab()
        // Back to the secret from before editing
        await expect(lastAuth(args.onAuthChange)).toEqual(clientCredentials)
        await expect(secret).toHaveAttribute('placeholder', '********')
    },
}

export const NewSecretIsRequired: Story = {
    args: { optional: true, allowedMethods: ['client_credentials'] },
    play: async ({ args, canvasElement, userEvent }) => {
        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', { name: 'Add' })
        )
        const secret = await findInput(canvasElement, 'client-secret')
        await expect(secret).toBeRequired()

        // A secret that was typed and cleared again isn't mistaken for a hidden one
        await userEvent.type(secret, 'abc')
        await userEvent.tab()
        await userEvent.clear(secret)
        await userEvent.tab()
        await expect(secret).toHaveAttribute('placeholder', '')
        await expect(secret).toBeRequired()
        await expect(
            queryByShadowText(canvasElement, /Current secret is hidden/)
        ).not.toBeInTheDocument()
        await expect(lastAuth(args.onAuthChange)).toMatchObject({
            method: 'client_credentials',
            clientSecret: '',
        })
    },
}

export const IdentityProviderOverride: Story = {
    args: { auth: clientCredentials },
    play: async ({ args, canvasElement, userEvent }) => {
        const override = await findInput(canvasElement, 'identity-provider-id')
        await userEvent.type(override, 'machine-idp')
        await userEvent.tab()
        await expect(lastAuth(args.onAuthChange)).toEqual({
            ...clientCredentials,
            identityProviderId: 'machine-idp',
        })

        // Re-selecting the method keeps the override
        await userEvent.selectOptions(
            await findMethod(canvasElement),
            'client_credentials'
        )
        await expect(lastAuth(args.onAuthChange)).toEqual({
            ...clientCredentials,
            identityProviderId: 'machine-idp',
        })

        // Clearing it removes the override, so the network's provider is used
        await userEvent.clear(override)
        await userEvent.tab()
        await expect(lastAuth(args.onAuthChange)).toEqual(clientCredentials)
    },
}
