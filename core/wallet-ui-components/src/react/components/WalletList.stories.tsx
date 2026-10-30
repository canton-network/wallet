// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Wallet } from '@canton-network/core-wallet-user-rpc-client'
import {
    findAllByShadowRole,
    findAllByShadowText,
    findByShadowRole,
    findByShadowText,
    queryAllByShadowRole,
    queryByShadowText,
} from 'shadow-dom-testing-library'
import { expect, fn, waitFor } from 'storybook/test'
import { WalletList } from './WalletList'

const makeWallet = (overrides: Partial<Wallet> = {}): Wallet => ({
    primary: false,
    status: 'allocated',
    partyId: 'party::ns',
    hint: 'alice',
    publicKey: 'pk',
    namespace: 'ns',
    networkId: 'canton:devnet',
    signingProviderId: 'wallet-kernel',
    rights: [],
    ...overrides,
})

const allocated = makeWallet({ partyId: 'alloc::ns', hint: 'allocated' })
const initialized = makeWallet({
    partyId: 'init::ns',
    hint: 'initialized',
    status: 'initialized',
})

const meta = {
    title: 'WalletList',
    component: WalletList,
    args: {
        onWalletAllocate: fn(),
        onWalletEdit: fn(),
        onWalletSetPrimary: fn(),
    },
} satisfies Meta<typeof WalletList>

export default meta

type Story = StoryObj<typeof meta>

export const Loading: Story = {
    play: async ({ canvasElement }) => {
        // Until the wallets are set
        await expect(
            await findByShadowText(canvasElement, 'Loading parties...')
        ).toBeVisible()
        await expect(queryAllByShadowRole(canvasElement, 'button')).toEqual([])
    },
}

export const Empty: Story = {
    args: { wallets: [] },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                queryByShadowText(canvasElement, 'Loading parties...')
            ).not.toBeInTheDocument()
        )
        await expect(queryAllByShadowRole(canvasElement, 'button')).toEqual([])
    },
}

export const UnallocatedFirst: Story = {
    args: { wallets: [allocated, initialized] },
    play: async ({ args, canvasElement, userEvent }) => {
        // The wallet still to allocate comes before the allocated one
        const hints = await findAllByShadowText(
            canvasElement,
            /^(allocated|initialized)$/
        )
        await expect(hints.map((hint) => hint.textContent?.trim())).toEqual([
            'initialized',
            'allocated',
        ])
        const actions = await findAllByShadowRole(canvasElement, 'button', {
            name: /^(Allocate party|Set as primary)$/,
        })
        await expect(
            actions.map((action) => action.textContent?.trim())
        ).toEqual(['Allocate party', 'Set as primary'])

        // The cards' events come out of the list
        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Allocate party',
            })
        )
        await expect(args.onWalletAllocate).toHaveBeenCalledOnce()
        await expect(args.onWalletAllocate?.mock.calls[0]?.[0].wallet).toEqual(
            initialized
        )

        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Set as primary',
            })
        )
        await expect(args.onWalletSetPrimary).toHaveBeenCalledOnce()
        await expect(
            args.onWalletSetPrimary?.mock.calls[0]?.[0].wallet
        ).toEqual(allocated)

        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', { name: 'Edit' })
        )
        await expect(args.onWalletEdit).toHaveBeenCalledOnce()
        await expect(args.onWalletEdit?.mock.calls[0]?.[0].wallet).toEqual(
            allocated
        )
    },
}

export const NonEditableSigningProvider: Story = {
    args: {
        wallets: [
            makeWallet({
                partyId: 'a::ns',
                hint: 'a',
                signingProviderId: 'participant',
            }),
            makeWallet({
                partyId: 'b::ns',
                hint: 'b',
                signingProviderId: 'fireblocks',
            }),
        ],
        nonEditableSigningProviderId: 'participant',
    },
    play: async ({ args, canvasElement, userEvent }) => {
        await expect(
            await findAllByShadowRole(canvasElement, 'button', {
                name: 'Set as primary',
            })
        ).toHaveLength(2)

        // Only the wallet of the other signing provider can be edited
        const edits = await findAllByShadowRole(canvasElement, 'button', {
            name: 'Edit',
        })
        await expect(edits).toHaveLength(1)
        await userEvent.click(edits[0])
        await expect(args.onWalletEdit?.mock.calls[0]?.[0].wallet.partyId).toBe(
            'b::ns'
        )
    },
}

export const Busy: Story = {
    args: { wallets: [allocated, initialized], loading: true },
    play: async ({ canvasElement }) => {
        // The cards' actions are disabled while a request is in flight
        for (const name of ['Allocate party', 'Set as primary', 'Edit']) {
            await expect(
                await findByShadowRole(canvasElement, 'button', { name })
            ).toBeDisabled()
        }
    },
}
