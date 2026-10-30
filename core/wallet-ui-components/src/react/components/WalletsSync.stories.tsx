// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { findByShadowRole } from 'shadow-dom-testing-library'
import { expect, fn, waitFor, within } from 'storybook/test'
import { ToastProvider } from '../contexts/ToastProvider'
import { useErrorToast } from '../hooks/useErrorToast'
import { useToast } from '../hooks/useToast'
import { WalletsSync } from './WalletsSync'

const meta = {
    title: 'WalletsSync',
    component: WalletsSync,
    args: {
        onWalletsSync: fn(),
    },
} satisfies Meta<typeof WalletsSync>

export default meta

type Story = StoryObj<typeof meta>

export const UpToDate: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        const button = await findByShadowRole(canvasElement, 'button', {
            name: 'Refresh parties',
        })
        await expect(button).toBeEnabled()

        await userEvent.click(button)
        await expect(args.onWalletsSync).toHaveBeenCalledOnce()
    },
}

export const SyncNeeded: Story = {
    args: { syncNeeded: true },
    play: async ({ args, canvasElement, userEvent }) => {
        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Refresh parties (changes available)',
            })
        )
        await expect(args.onWalletsSync).toHaveBeenCalledOnce()
    },
}

export const Syncing: Story = {
    args: { syncNeeded: true, syncing: true },
    play: async ({ args, canvasElement, userEvent }) => {
        // Syncing takes precedence over the "changes available" label
        const button = await findByShadowRole(canvasElement, 'button', {
            name: 'Syncing parties...',
        })
        await expect(button).toBeDisabled()

        await userEvent.click(button)
        await expect(args.onWalletsSync).not.toHaveBeenCalled()
    },
}

export const Disabled: Story = {
    args: { disabled: true },
    play: async ({ args, canvasElement, userEvent }) => {
        const button = await findByShadowRole(canvasElement, 'button', {
            name: 'Refresh parties',
        })
        await expect(button).toBeDisabled()

        await userEvent.click(button)
        await expect(args.onWalletsSync).not.toHaveBeenCalled()
    },
}

// What an app does with the presentational component: call the API, report
// the result through a toast and keep the sync state
const SyncContainer = ({ fail = false }: { fail?: boolean }) => {
    const { showToast } = useToast()
    const showError = useErrorToast()
    const [syncNeeded, setSyncNeeded] = useState(true)
    const [syncing, setSyncing] = useState(false)

    const sync = async () => {
        setSyncing(true)
        try {
            await new Promise((resolve) => setTimeout(resolve, 100))
            if (fail) throw new globalThis.Error('sync failed')

            showToast({
                title: 'Wallet Sync Complete',
                message: 'Added: 1, Updated: 1, Disabled: 1.',
                type: 'success',
            })
            setSyncNeeded(false)
        } catch (error) {
            showError(error)
        } finally {
            setSyncing(false)
        }
    }

    return (
        <WalletsSync
            syncNeeded={syncNeeded}
            syncing={syncing}
            onWalletsSync={sync}
        />
    )
}

export const AppFlow: Story = {
    render: () => (
        <ToastProvider>
            <SyncContainer />
        </ToastProvider>
    ),
    play: async ({ canvasElement, userEvent }) => {
        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Refresh parties (changes available)',
            })
        )
        await expect(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Syncing parties...',
            })
        ).toBeDisabled()

        // The result is reported through a toast and the button settles
        const toast = await within(canvasElement.ownerDocument.body).findByRole(
            'status'
        )
        await expect(toast).toHaveTextContent('Wallet Sync Complete')
        await expect(toast).toHaveTextContent(
            'Added: 1, Updated: 1, Disabled: 1.'
        )
        await expect(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Refresh parties',
            })
        ).toBeEnabled()
    },
}

export const AppFlowFailure: Story = {
    render: () => (
        <ToastProvider>
            <SyncContainer fail />
        </ToastProvider>
    ),
    play: async ({ canvasElement, userEvent }) => {
        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Refresh parties (changes available)',
            })
        )

        const alert = await within(canvasElement.ownerDocument.body).findByRole(
            'alert'
        )
        await expect(alert).toHaveTextContent('sync failed')
        // Still out of sync, and the button can be used again
        await waitFor(async () =>
            expect(
                await findByShadowRole(canvasElement, 'button', {
                    name: 'Refresh parties (changes available)',
                })
            ).toBeEnabled()
        )
    },
}
