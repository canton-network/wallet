// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useState, type ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Key } from '@canton-network/core-wallet-user-rpc-client'
import {
    findByShadowRole,
    findByShadowText,
    queryByShadowRole,
} from 'shadow-dom-testing-library'
import { expect, fn, waitFor } from 'storybook/test'
import { WalletEditForm } from './WalletEditForm'

const keys: Key[] = [
    { id: 'key1', name: 'Key 1', publicKey: 'pk1' },
    { id: 'key2', name: 'Key 2', publicKey: 'pk2' },
]

const meta = {
    title: 'WalletEditForm',
    component: WalletEditForm,
    args: {
        partyId: 'alice::1220abcd',
        signingProviders: ['participant', 'fireblocks'],
        publicKeys: keys,
        onWalletEdit: fn(),
        onSigningProviderChange: fn(),
    },
} satisfies Meta<typeof WalletEditForm>

export default meta

type Story = StoryObj<typeof meta>

const findSigningProvider = (canvasElement: HTMLElement) =>
    findByShadowRole(canvasElement, 'combobox', { name: /^Signing Provider/ })

const findPublicKey = (canvasElement: HTMLElement) =>
    findByShadowRole(canvasElement, 'combobox', { name: /^Public Key/ })

export const Default: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        // The party is shown read-only
        const party = await findByShadowRole(canvasElement, 'textbox', {
            name: /^Party ID/,
        })
        await expect(party).toHaveValue('alice::1220abcd')
        await expect(party).toBeDisabled()
        await expect(party).toHaveAttribute('readonly')

        // Nothing can be submitted before a signing provider is chosen
        const submit = await findByShadowRole(canvasElement, 'button', {
            name: 'Edit',
        })
        await expect(submit).toBeDisabled()

        // The signing providers passed in are offered
        await expect(
            await findByShadowRole(canvasElement, 'option', {
                name: 'participant',
            })
        ).toBeEnabled()
        await userEvent.selectOptions(
            await findSigningProvider(canvasElement),
            'fireblocks'
        )
        await expect(args.onSigningProviderChange).toHaveBeenCalledOnce()
        await expect(args.onSigningProviderChange).toHaveBeenCalledWith(
            expect.objectContaining({ signingProviderId: 'fireblocks' })
        )

        // Keys are listed with their public key
        await expect(
            await findByShadowRole(canvasElement, 'option', {
                name: 'Key 1 (pk1)',
            })
        ).toBeInTheDocument()
        await expect(
            await findByShadowRole(canvasElement, 'option', {
                name: 'Key 2 (pk2)',
            })
        ).toBeInTheDocument()
        await userEvent.selectOptions(await findPublicKey(canvasElement), 'pk1')
        await userEvent.click(submit)

        await expect(args.onWalletEdit).toHaveBeenCalledOnce()
        await expect(args.onWalletEdit).toHaveBeenCalledWith(
            expect.objectContaining({
                partyId: 'alice::1220abcd',
                signingProviderId: 'fireblocks',
                publicKey: 'pk1',
            })
        )
    },
}

export const Prefilled: Story = {
    args: { selectedSigningProvider: 'fireblocks', selectedPublicKey: 'pk2' },
    play: async ({ args, canvasElement, userEvent }) => {
        await expect(await findSigningProvider(canvasElement)).toHaveValue(
            'fireblocks'
        )
        const publicKey = await findPublicKey(canvasElement)
        await expect(publicKey).toHaveValue('pk2')

        // The key can be changed, and back again
        await userEvent.selectOptions(publicKey, 'pk1')
        await expect(publicKey).toHaveValue('pk1')
        await userEvent.selectOptions(publicKey, 'pk2')

        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', { name: 'Edit' })
        )
        await expect(args.onWalletEdit).toHaveBeenCalledOnce()
        await expect(args.onWalletEdit).toHaveBeenCalledWith(
            expect.objectContaining({
                signingProviderId: 'fireblocks',
                publicKey: 'pk2',
            })
        )
        await expect(args.onSigningProviderChange).not.toHaveBeenCalled()
    },
}

export const ChangingSigningProviderClearsPublicKey: Story = {
    args: { selectedSigningProvider: 'fireblocks', selectedPublicKey: 'pk1' },
    play: async ({ args, canvasElement, userEvent }) => {
        await expect(await findPublicKey(canvasElement)).toHaveValue('pk1')

        // The key belongs to the previous signing provider
        await userEvent.selectOptions(
            await findSigningProvider(canvasElement),
            'participant'
        )
        await waitFor(async () =>
            expect(await findPublicKey(canvasElement)).toHaveValue('')
        )
        await expect(args.onSigningProviderChange).toHaveBeenCalledWith(
            expect.objectContaining({ signingProviderId: 'participant' })
        )

        // The browser blocks submitting without a public key
        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', { name: 'Edit' })
        )
        await expect(args.onWalletEdit).not.toHaveBeenCalled()
        await expect(await findPublicKey(canvasElement)).toBeInvalid()
    },
}

export const DisabledSigningProvider: Story = {
    args: {
        disabledSigningProviders: ['participant'],
        selectedSigningProvider: 'participant',
        selectedPublicKey: 'pk1',
    },
    play: async ({ canvasElement }) => {
        // Listed but not selectable, and a wallet on it can't be submitted as is
        await expect(
            await findByShadowRole(canvasElement, 'option', {
                name: 'participant',
            })
        ).toBeDisabled()
        await expect(
            await findByShadowRole(canvasElement, 'option', {
                name: 'fireblocks',
            })
        ).toBeEnabled()
        await expect(
            await findByShadowRole(canvasElement, 'option', {
                name: 'Select different signing provider',
            })
        ).toBeInTheDocument()
        await expect(await findPublicKey(canvasElement)).toHaveValue('')
        await expect(
            await findByShadowRole(canvasElement, 'button', { name: 'Edit' })
        ).toBeDisabled()
    },
}

export const SigningProvidersLoading: Story = {
    args: { signingProvidersLoading: true },
    play: async ({ canvasElement }) => {
        await expect(await findSigningProvider(canvasElement)).toBeDisabled()
        await expect(
            await findByShadowRole(canvasElement, 'option', {
                name: 'Loading signing providers...',
            })
        ).toBeInTheDocument()
        await expect(
            await findByShadowRole(canvasElement, 'button', { name: 'Edit' })
        ).toBeDisabled()
    },
}

export const NoSigningProviders: Story = {
    args: { signingProviders: [] },
    play: async ({ canvasElement }) => {
        await expect(await findSigningProvider(canvasElement)).toBeDisabled()
        await expect(
            await findByShadowRole(canvasElement, 'option', {
                name: 'No signing providers available',
            })
        ).toBeInTheDocument()
        await expect(
            await findByShadowRole(canvasElement, 'button', { name: 'Edit' })
        ).toBeDisabled()
    },
}

export const PublicKeysLoading: Story = {
    args: {
        selectedSigningProvider: 'fireblocks',
        publicKeys: [],
        publicKeysLoading: true,
    },
    play: async ({ canvasElement }) => {
        // The key select stays usable, but the form can't be submitted yet
        await expect(await findPublicKey(canvasElement)).toBeEnabled()
        await expect(
            queryByShadowRole(canvasElement, 'option', {
                name: 'Select public key',
            })
        ).not.toBeInTheDocument()
        await expect(
            await findByShadowRole(canvasElement, 'button', { name: 'Edit' })
        ).toBeDisabled()
    },
}

export const Submitting: Story = {
    args: {
        selectedSigningProvider: 'fireblocks',
        selectedPublicKey: 'pk1',
        submitting: true,
    },
    play: async ({ canvasElement }) => {
        await expect(await findSigningProvider(canvasElement)).toBeDisabled()
        await expect(await findPublicKey(canvasElement)).toBeDisabled()
        const submit = await findByShadowRole(canvasElement, 'button', {
            name: 'Editing...',
        })
        await expect(submit).toBeDisabled()
        await expect(
            await findByShadowText(
                canvasElement,
                'Editing party, please wait...'
            )
        ).toBeVisible()
    },
}

// The page loads the wallet after the form is shown, then passes its values in
const LoadingContainer = ({
    onWalletEdit,
}: {
    onWalletEdit: ComponentProps<typeof WalletEditForm>['onWalletEdit']
}) => {
    const [wallet, setWallet] = useState<{ provider: string; key: string }>()
    return (
        <>
            <button
                type="button"
                onClick={() =>
                    setWallet({ provider: 'fireblocks', key: 'pk2' })
                }
            >
                Load wallet
            </button>
            <WalletEditForm
                partyId="alice::1220abcd"
                signingProviders={['participant', 'fireblocks']}
                publicKeys={keys}
                selectedSigningProvider={wallet?.provider ?? ''}
                selectedPublicKey={wallet?.key ?? ''}
                {...(onWalletEdit && { onWalletEdit })}
            />
        </>
    )
}

export const FollowsTheSelectionPassedIn: Story = {
    render: (args) => <LoadingContainer onWalletEdit={args.onWalletEdit} />,
    play: async ({ args, canvasElement, userEvent }) => {
        await expect(await findSigningProvider(canvasElement)).toHaveValue('')

        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Load wallet',
            })
        )

        // The loaded wallet shows up, and can then be changed by the user
        await waitFor(async () =>
            expect(await findSigningProvider(canvasElement)).toHaveValue(
                'fireblocks'
            )
        )
        const publicKey = await findPublicKey(canvasElement)
        await expect(publicKey).toHaveValue('pk2')

        await userEvent.selectOptions(publicKey, 'pk1')
        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', { name: 'Edit' })
        )
        await expect(args.onWalletEdit).toHaveBeenCalledOnce()
        await expect(args.onWalletEdit).toHaveBeenCalledWith(
            expect.objectContaining({
                signingProviderId: 'fireblocks',
                publicKey: 'pk1',
            })
        )
    },
}
