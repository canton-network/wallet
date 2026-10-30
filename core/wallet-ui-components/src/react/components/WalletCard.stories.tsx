// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
    deepQuerySelector,
    findByShadowRole,
    findByShadowText,
    queryByShadowRole,
    queryByShadowText,
} from 'shadow-dom-testing-library'
import { expect, fn, waitFor } from 'storybook/test'
import { WalletCard } from './WalletCard'

const partyId =
    'alice::1220be58c29e65de40bf273be1dc2b266d43a9a002ea5b18955aeef7aac881bb471a'

// The card takes the store's wallet, which also carries the user
type Wallet = NonNullable<ComponentProps<typeof WalletCard>['wallet']>
type Rights = Wallet['rights']

const wallet: Wallet = {
    primary: false,
    status: 'allocated',
    partyId,
    hint: 'alice',
    publicKey: 'public-key',
    namespace: '1220be58',
    networkId: 'canton:devnet',
    signingProviderId: 'wallet-kernel',
    rights: [],
    userId: 'user-id',
}

const meta = {
    title: 'WalletCard',
    component: WalletCard,
    args: {
        wallet,
        onWalletAllocate: fn(),
        onWalletSetPrimary: fn(),
        onWalletEdit: fn(),
        onWalletSelect: fn(),
    },
} satisfies Meta<typeof WalletCard>

export default meta

type Story = StoryObj<typeof meta>

export const Unallocated: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        await expect(
            await findByShadowText(canvasElement, 'alice')
        ).toBeVisible()
        await expect(
            await findByShadowText(canvasElement, 'wallet-kernel')
        ).toBeVisible()
        await expect(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Copy party hint',
            })
        ).toBeVisible()
        await expect(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Copy party ID',
            })
        ).toBeVisible()

        // Verified-only actions are hidden
        await expect(
            queryByShadowRole(canvasElement, 'button', {
                name: 'Set as primary',
            })
        ).not.toBeInTheDocument()
        await expect(
            queryByShadowRole(canvasElement, 'button', { name: 'Edit' })
        ).not.toBeInTheDocument()

        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Allocate party',
            })
        )
        await expect(args.onWalletAllocate).toHaveBeenCalledOnce()
        await expect(args.onWalletAllocate).toHaveBeenCalledWith(
            expect.objectContaining({ wallet: wallet })
        )
    },
}

export const ExposesE2eHooks: Story = {
    args: {
        wallet: { ...wallet, externalTxId: 'tx-123' },
    },
    play: async ({ canvasElement }) => {
        // Used by the e2e helpers to find a card and read its party
        await waitFor(() =>
            expect(
                deepQuerySelector(canvasElement, `[party-id="${partyId}"]`)
            ).toBeInTheDocument()
        )
        await expect(
            deepQuerySelector(canvasElement, '[data-test-external-tx-id]')
        ).toHaveAttribute('data-test-external-tx-id', 'tx-123')
    },
}

export const NoWallet: Story = {
    args: { wallet: null },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowText(canvasElement, 'No party supplied')
        ).toBeVisible()
        await expect(
            deepQuerySelector(canvasElement, '[party-id]')
        ).not.toBeInTheDocument()
        await expect(
            queryByShadowRole(canvasElement, 'button')
        ).not.toBeInTheDocument()
    },
}

export const UnallocatedLoading: Story = {
    args: { loading: true },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Allocate party',
            })
        ).toBeDisabled()
    },
}

export const UnallocatedDisabled: Story = {
    args: {
        wallet: { ...wallet, disabled: true, reason: 'Key not available' },
    },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowText(canvasElement, 'Disabled')
        ).toBeVisible()
        await expect(
            await findByShadowText(canvasElement, 'Key not available')
        ).toBeVisible()
        await expect(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Allocate party',
            })
        ).toBeDisabled()
    },
}

export const Verified: Story = {
    args: { verified: true },
    play: async ({ args, canvasElement, userEvent }) => {
        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Set as primary',
            })
        )
        await expect(args.onWalletSetPrimary).toHaveBeenCalledOnce()
        await expect(args.onWalletSetPrimary).toHaveBeenCalledWith(
            expect.objectContaining({ wallet: wallet })
        )

        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', { name: 'Edit' })
        )
        await expect(args.onWalletEdit).toHaveBeenCalledOnce()
        await expect(args.onWalletEdit).toHaveBeenCalledWith(
            expect.objectContaining({ wallet: wallet })
        )

        await expect(
            queryByShadowText(canvasElement, 'PRIMARY')
        ).not.toBeInTheDocument()
        await expect(
            queryByShadowRole(canvasElement, 'button', {
                name: 'Allocate party',
            })
        ).not.toBeInTheDocument()
    },
}

export const VerifiedLoading: Story = {
    args: { verified: true, loading: true },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Set as primary',
            })
        ).toBeDisabled()
        await expect(
            await findByShadowRole(canvasElement, 'button', { name: 'Edit' })
        ).toBeDisabled()
    },
}

export const VerifiedNotEditable: Story = {
    args: { verified: true, editable: false },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Set as primary',
            })
        ).toBeEnabled()
        await expect(
            queryByShadowRole(canvasElement, 'button', { name: 'Edit' })
        ).not.toBeInTheDocument()
    },
}

export const Primary: Story = {
    args: { verified: true, wallet: { ...wallet, primary: true } },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowText(canvasElement, 'PRIMARY')
        ).toBeVisible()
        await expect(
            await findByShadowRole(canvasElement, 'button', { name: 'Edit' })
        ).toBeEnabled()
        await expect(
            queryByShadowRole(canvasElement, 'button', {
                name: 'Set as primary',
            })
        ).not.toBeInTheDocument()
    },
}

export const VerifiedDisabled: Story = {
    // A disabled wallet can always be edited, to fix it
    args: {
        verified: true,
        editable: false,
        wallet: { ...wallet, disabled: true },
    },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowText(canvasElement, 'Disabled')
        ).toBeVisible()
        await expect(
            await findByShadowRole(canvasElement, 'button', { name: 'Edit' })
        ).toBeEnabled()
        await expect(
            queryByShadowRole(canvasElement, 'button', {
                name: 'Set as primary',
            })
        ).not.toBeInTheDocument()
    },
}

export const Select: Story = {
    args: {
        verified: true,
        wallet: { ...wallet, primary: true },
        selectLabel: 'Select',
    },
    play: async ({ args, canvasElement, userEvent }) => {
        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', { name: 'Select' })
        )
        await expect(args.onWalletSelect).toHaveBeenCalledOnce()
        await expect(args.onWalletSelect).toHaveBeenCalledWith(
            expect.objectContaining({
                wallet: {
                    ...wallet,
                    primary: true,
                },
            })
        )

        // Replaces the badge and every other action
        await expect(
            queryByShadowText(canvasElement, 'PRIMARY')
        ).not.toBeInTheDocument()
        await expect(
            queryByShadowRole(canvasElement, 'button', { name: 'Edit' })
        ).not.toBeInTheDocument()
    },
}

export const SelectLoading: Story = {
    args: { selectLabel: 'Use this party', loading: true },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Use this party',
            })
        ).toBeDisabled()
    },
}

export const LongPartyId: Story = {
    play: async ({ canvasElement }) => {
        const shown = `${partyId.slice(0, 10)}...${partyId.slice(-10)}`
        // Shortened, with the full ID on hover
        await expect(
            await findByShadowText(canvasElement, shown)
        ).toHaveAttribute('title', partyId)
        await expect(
            queryByShadowText(canvasElement, partyId)
        ).not.toBeInTheDocument()
    },
}

export const ShortPartyId: Story = {
    args: { wallet: { ...wallet, partyId: 'alice::1220' } },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowText(canvasElement, 'alice::1220')
        ).toBeVisible()
    },
}

export const NoHint: Story = {
    args: { wallet: { ...wallet, hint: '' } },
    play: async ({ canvasElement }) => {
        await expect(await findByShadowText(canvasElement, '-')).toBeVisible()
        await expect(
            queryByShadowRole(canvasElement, 'button', {
                name: 'Copy party hint',
            })
        ).not.toBeInTheDocument()
    },
}

export const WithPermissions: Story = {
    args: {
        verified: true,
        wallet: {
            ...wallet,
            // Listed out of order: shown in a fixed order, only those held
            rights: ['CanReadAs', 'CanActAs'] as Rights,
        },
    },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowText(canvasElement, 'Permissions')
        ).toBeVisible()
        const actAs = await findByShadowText(canvasElement, 'CanActAs')
        const readAs = await findByShadowText(canvasElement, 'CanReadAs')
        await expect(
            actAs.compareDocumentPosition(readAs) &
                Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy()
        await expect(
            queryByShadowText(canvasElement, 'CanExecuteAs')
        ).not.toBeInTheDocument()
    },
}

export const ExecuteAsOnly: Story = {
    args: { wallet: { ...wallet, rights: ['CanExecuteAs'] as Rights } },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowText(canvasElement, 'CanExecuteAs')
        ).toBeVisible()
        await expect(
            queryByShadowText(canvasElement, 'CanActAs')
        ).not.toBeInTheDocument()
        await expect(
            queryByShadowText(canvasElement, 'CanReadAs')
        ).not.toBeInTheDocument()
    },
}

export const NoPermissions: Story = {
    play: async ({ canvasElement }) => {
        await findByShadowText(canvasElement, 'alice')
        await expect(
            queryByShadowText(canvasElement, 'Permissions')
        ).not.toBeInTheDocument()
    },
}

export const ShortReason: Story = {
    args: { wallet: { ...wallet, disabled: true, reason: 'Key revoked' } },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowText(canvasElement, 'Reason')
        ).toBeVisible()
        await expect(
            await findByShadowText(canvasElement, 'Key revoked')
        ).toBeVisible()
    },
}

const longReason =
    'The signing provider rejected the allocation request because the topology transaction could not be authorised by the configured key.'

export const LongReason: Story = {
    args: { wallet: { ...wallet, disabled: true, reason: longReason } },
    play: async ({ canvasElement }) => {
        // Long reasons wrap in full instead of being truncated
        const reason = await findByShadowText(canvasElement, longReason)
        await expect(reason.scrollWidth).toBeLessThanOrEqual(reason.clientWidth)
    },
}

export const MultilineReason: Story = {
    args: {
        wallet: {
            ...wallet,
            disabled: true,
            reason: 'Key revoked\nAsk an admin to restore it',
        },
    },
    play: async ({ canvasElement }) => {
        const reason = await findByShadowText(
            canvasElement,
            'Key revoked Ask an admin to restore it'
        )
        await expect(reason.scrollWidth).toBeLessThanOrEqual(reason.clientWidth)
    },
}
