// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Key } from '@canton-network/core-wallet-user-rpc-client'
import {
    findByShadowRole,
    findByShadowText,
    queryByShadowLabelText,
    queryByShadowRole,
} from 'shadow-dom-testing-library'
import { expect, fn, waitFor } from 'storybook/test'
import { WalletCreateForm } from './WalletCreateForm'

const keys: Key[] = [
    { id: 'key-1', name: 'Vault A', publicKey: 'pk1' },
    { id: 'key-2', name: 'Vault B', publicKey: 'pk2' },
]

const partyHintInput = (canvasElement: HTMLElement) =>
    findByShadowRole(canvasElement, 'textbox', { name: /^Party ID Hint/ })

const signingProviderSelect = (canvasElement: HTMLElement) =>
    findByShadowRole(canvasElement, 'combobox', { name: /^Signing Provider/ })

const vaultSelect = (canvasElement: HTMLElement) =>
    findByShadowRole(canvasElement, 'combobox', { name: /^Vault name/ })

const submitButton = (canvasElement: HTMLElement, name = 'Add') =>
    findByShadowRole(canvasElement, 'button', { name })

const meta = {
    title: 'WalletCreateForm',
    component: WalletCreateForm,
    args: {
        signingProviders: ['participant', 'wallet-kernel', 'fireblocks'],
        onWalletCreate: fn(),
        onSigningProviderChange: fn(),
    },
} satisfies Meta<typeof WalletCreateForm>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        // Every signing provider is offered
        for (const provider of ['participant', 'wallet-kernel', 'fireblocks']) {
            await expect(
                await findByShadowRole(canvasElement, 'option', {
                    name: provider,
                })
            ).toBeInTheDocument()
        }
        await expect(
            await findByShadowRole(canvasElement, 'checkbox', {
                name: 'Set as primary wallet',
            })
        ).not.toBeChecked()
        await expect(
            queryByShadowLabelText(canvasElement, /^Vault name/)
        ).not.toBeInTheDocument()

        await userEvent.type(await partyHintInput(canvasElement), 'alice')
        await userEvent.selectOptions(
            await signingProviderSelect(canvasElement),
            'wallet-kernel'
        )
        await userEvent.click(await submitButton(canvasElement))

        await expect(args.onWalletCreate).toHaveBeenCalledOnce()
        await expect(args.onWalletCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                partyHint: 'alice',
                signingProviderId: 'wallet-kernel',
                primary: false,
                keyName: undefined,
            })
        )
    },
}

export const AsPrimary: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        await userEvent.type(await partyHintInput(canvasElement), 'bob')
        await userEvent.selectOptions(
            await signingProviderSelect(canvasElement),
            'participant'
        )
        await userEvent.click(
            await findByShadowRole(canvasElement, 'checkbox', {
                name: 'Set as primary wallet',
            })
        )
        await userEvent.click(await submitButton(canvasElement))

        await expect(args.onWalletCreate).toHaveBeenCalledOnce()
        await expect(args.onWalletCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                partyHint: 'bob',
                signingProviderId: 'participant',
                primary: true,
            })
        )
    },
}

export const WithoutPrimaryOption: Story = {
    args: { showPrimary: false },
    play: async ({ canvasElement }) => {
        await partyHintInput(canvasElement)
        await expect(
            queryByShadowRole(canvasElement, 'checkbox', {
                name: 'Set as primary wallet',
            })
        ).not.toBeInTheDocument()
    },
}

export const SubmitsWithEnter: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        await userEvent.selectOptions(
            await signingProviderSelect(canvasElement),
            'participant'
        )
        await userEvent.type(
            await partyHintInput(canvasElement),
            'carol{Enter}'
        )

        await expect(args.onWalletCreate).toHaveBeenCalledOnce()
        await expect(args.onWalletCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                partyHint: 'carol',
                signingProviderId: 'participant',
            })
        )
    },
}

export const RequiresFields: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        // The browser blocks submitting empty required fields
        await userEvent.click(await submitButton(canvasElement))

        await expect(args.onWalletCreate).not.toHaveBeenCalled()
        await expect(await partyHintInput(canvasElement)).toBeInvalid()
        await expect(await signingProviderSelect(canvasElement)).toBeInvalid()
    },
}

export const ReportsSigningProviderChange: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        await userEvent.selectOptions(
            await signingProviderSelect(canvasElement),
            'fireblocks'
        )

        await expect(args.onSigningProviderChange).toHaveBeenCalledOnce()
        await expect(args.onSigningProviderChange).toHaveBeenCalledWith(
            expect.objectContaining({ signingProviderId: 'fireblocks' })
        )
    },
}

export const SigningProvidersLoading: Story = {
    args: { signingProviders: [], signingProvidersLoading: true },
    play: async ({ canvasElement }) => {
        await expect(await signingProviderSelect(canvasElement)).toBeDisabled()
        await expect(
            await findByShadowRole(canvasElement, 'option', {
                name: 'Loading signing providers...',
            })
        ).toBeInTheDocument()
        await expect(await submitButton(canvasElement)).toBeDisabled()
    },
}

export const NoSigningProviders: Story = {
    args: { signingProviders: [] },
    play: async ({ canvasElement, userEvent }) => {
        await expect(
            await findByShadowRole(canvasElement, 'option', {
                name: 'No signing providers available',
            })
        ).toBeInTheDocument()
        await expect(await signingProviderSelect(canvasElement)).toBeDisabled()

        // A party hint alone isn't enough to submit
        await userEvent.type(await partyHintInput(canvasElement), 'alice')
        await expect(await submitButton(canvasElement)).toBeDisabled()
    },
}

export const Submitting: Story = {
    args: { submitting: true },
    play: async ({ canvasElement }) => {
        // Every field is locked, and progress is shown
        await expect(await partyHintInput(canvasElement)).toBeDisabled()
        await expect(await signingProviderSelect(canvasElement)).toBeDisabled()
        await expect(
            await findByShadowRole(canvasElement, 'checkbox', {
                name: 'Set as primary wallet',
            })
        ).toBeDisabled()
        await expect(
            await submitButton(canvasElement, 'Adding...')
        ).toBeDisabled()
        await expect(
            await findByShadowRole(canvasElement, 'status')
        ).toHaveTextContent('Creating party, please wait...')
    },
}

export const VaultSelect: Story = {
    args: { keySigningProviders: ['fireblocks'], publicKeys: keys },
    play: async ({ args, canvasElement, userEvent }) => {
        const provider = await signingProviderSelect(canvasElement)

        // Only the signing providers that have keys offer a vault
        await userEvent.selectOptions(provider, 'participant')
        await expect(
            queryByShadowLabelText(canvasElement, /^Vault name/)
        ).not.toBeInTheDocument()

        await userEvent.selectOptions(provider, 'fireblocks')
        const vault = await vaultSelect(canvasElement)
        await expect(vault).toBeRequired()
        await expect(vault).toBeEnabled()
        await expect(
            await findByShadowRole(canvasElement, 'option', {
                name: 'Select vault name',
            })
        ).toBeDisabled()
        await expect(
            await findByShadowRole(canvasElement, 'option', { name: 'Vault A' })
        ).toBeInTheDocument()

        await userEvent.type(await partyHintInput(canvasElement), 'alice')
        await userEvent.selectOptions(
            vault,
            await findByShadowRole(canvasElement, 'option', { name: 'Vault B' })
        )
        await userEvent.click(await submitButton(canvasElement))

        // The key's name is reported, not its id
        await expect(args.onWalletCreate).toHaveBeenCalledOnce()
        await expect(args.onWalletCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                partyHint: 'alice',
                signingProviderId: 'fireblocks',
                keyName: 'Vault B',
            })
        )
    },
}

export const VaultResetsWhenSigningProviderChanges: Story = {
    args: {
        keySigningProviders: ['fireblocks', 'dfns'],
        publicKeys: keys,
        signingProviders: ['fireblocks', 'dfns'],
    },
    play: async ({ canvasElement, userEvent }) => {
        const provider = await signingProviderSelect(canvasElement)
        await userEvent.selectOptions(provider, 'fireblocks')
        await userEvent.selectOptions(
            await vaultSelect(canvasElement),
            await findByShadowRole(canvasElement, 'option', { name: 'Vault A' })
        )
        await expect(await vaultSelect(canvasElement)).toHaveValue('key-1')

        // The chosen key belongs to the previous provider
        await userEvent.selectOptions(provider, 'dfns')
        await waitFor(async () =>
            expect(await vaultSelect(canvasElement)).toHaveValue('')
        )
    },
}

export const VaultsLoading: Story = {
    args: {
        signingProviders: ['fireblocks'],
        keySigningProviders: ['fireblocks'],
        publicKeysLoading: true,
    },
    play: async ({ canvasElement, userEvent }) => {
        await userEvent.type(await partyHintInput(canvasElement), 'alice')
        await userEvent.selectOptions(
            await signingProviderSelect(canvasElement),
            'fireblocks'
        )

        await expect(await vaultSelect(canvasElement)).toBeDisabled()
        await expect(
            await findByShadowRole(canvasElement, 'option', {
                name: 'Loading vaults...',
            })
        ).toBeInTheDocument()
        await expect(await submitButton(canvasElement)).toBeDisabled()
    },
}

export const VaultsLoadingForOtherProvidersIsIgnored: Story = {
    args: { keySigningProviders: ['fireblocks'], publicKeysLoading: true },
    play: async ({ canvasElement, userEvent }) => {
        // Vaults only matter for the providers that use them
        await userEvent.selectOptions(
            await signingProviderSelect(canvasElement),
            'participant'
        )
        await expect(await submitButton(canvasElement)).toBeEnabled()
    },
}

export const ControlledSigningProvider: Story = {
    render: (args) => {
        const [provider, setProvider] = useState('fireblocks')
        return (
            <>
                <WalletCreateForm
                    {...args}
                    keySigningProviders={['fireblocks']}
                    publicKeys={keys}
                    selectedSigningProvider={provider}
                    onSigningProviderChange={(event) => {
                        args.onSigningProviderChange?.(event)
                        setProvider(event.signingProviderId)
                    }}
                />
                <p>Selected: {provider}</p>
            </>
        )
    },
    play: async ({ args, canvasElement, userEvent }) => {
        // The parent's selection is what the form shows
        const select = await signingProviderSelect(canvasElement)
        await waitFor(() => expect(select).toHaveValue('fireblocks'))
        await expect(await vaultSelect(canvasElement)).toBeInTheDocument()

        await userEvent.selectOptions(select, 'participant')
        await expect(args.onSigningProviderChange).toHaveBeenCalledWith(
            expect.objectContaining({ signingProviderId: 'participant' })
        )
        await expect(
            await findByShadowText(canvasElement, 'Selected: participant')
        ).toBeInTheDocument()
        await waitFor(() =>
            expect(
                queryByShadowLabelText(canvasElement, /^Vault name/)
            ).not.toBeInTheDocument()
        )
    },
}

// What an app does with the form: create the party, and show it is working
const AppContainer = () => {
    const [submitting, setSubmitting] = useState(false)
    const [created, setCreated] = useState('')

    return (
        <>
            <WalletCreateForm
                signingProviders={['participant', 'wallet-kernel']}
                submitting={submitting}
                onWalletCreate={({ partyHint, signingProviderId, primary }) => {
                    setSubmitting(true)
                    setTimeout(() => {
                        setCreated(
                            `Created ${partyHint} with ${signingProviderId}${primary ? ' as primary' : ''}`
                        )
                        setSubmitting(false)
                    }, 100)
                }}
            />
            {created && <p role="status">{created}</p>}
        </>
    )
}

export const AppFlow: Story = {
    render: () => <AppContainer />,
    play: async ({ canvasElement, userEvent }) => {
        await userEvent.type(await partyHintInput(canvasElement), 'alice')
        await userEvent.selectOptions(
            await signingProviderSelect(canvasElement),
            'wallet-kernel'
        )
        await userEvent.click(
            await findByShadowRole(canvasElement, 'checkbox', {
                name: 'Set as primary wallet',
            })
        )
        await userEvent.click(await submitButton(canvasElement))

        await expect(
            await submitButton(canvasElement, 'Adding...')
        ).toBeDisabled()
        await expect(
            await findByShadowText(
                canvasElement,
                'Created alice with wallet-kernel as primary'
            )
        ).toBeInTheDocument()
        await expect(await submitButton(canvasElement)).toBeEnabled()
    },
}
