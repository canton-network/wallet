// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Meta, StoryObj } from '@storybook/react-vite'
import {
    deepQuerySelector,
    findByShadowRole,
    findByShadowText,
} from 'shadow-dom-testing-library'
import { expect, fn, waitFor } from 'storybook/test'
import { AppHeader } from './AppHeader'

const dappApiUrl = 'http://localhost:3030/api/v0/dapp'

const meta = {
    title: 'AppHeader',
    component: AppHeader,
    args: {
        onLogout: fn(),
        onCopyDappApiUrl: fn(),
    },
} satisfies Meta<typeof AppHeader>

export default meta

type Story = StoryObj<typeof meta>

// The menu button has no accessible name, it is the only one with a popup
const menuButton = (canvasElement: HTMLElement) =>
    findByShadowRole(canvasElement, 'button', { expanded: false })

const menuItem = (canvasElement: HTMLElement, name: string | RegExp) =>
    findByShadowRole(canvasElement, 'button', { name })

export const Default: Story = {
    args: {
        networkName: 'DevNet',
        networkConnected: true,
        dappApiUrl,
    },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Go to home',
            })
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(canvasElement, 'DevNet')
        ).toBeInTheDocument()
        // Hook used by the e2e helpers in wallet-test-utils
        await waitFor(() =>
            expect(
                deepQuerySelector(
                    canvasElement,
                    '[data-testid="network-status-connected"]'
                )
            ).toBeInTheDocument()
        )
    },
}

export const Disconnected: Story = {
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowText(canvasElement, 'No network connected')
        ).toBeInTheDocument()
        await waitFor(() =>
            expect(
                deepQuerySelector(
                    canvasElement,
                    '[data-testid="network-status-disconnected"]'
                )
            ).toBeInTheDocument()
        )
    },
}

export const ToggleMenu: Story = {
    play: async ({ canvasElement, userEvent }) => {
        const trigger = await menuButton(canvasElement)
        const logout = await menuItem(canvasElement, 'Logout')
        await expect(logout).not.toBeVisible()

        await userEvent.click(trigger)
        await expect(trigger).toHaveAttribute('aria-expanded', 'true')
        await waitFor(() => expect(logout).toBeVisible())
        for (const name of [
            'Parties',
            'Activities',
            'Networks',
            'API Keys',
            'Identity Providers',
        ]) {
            await expect(await menuItem(canvasElement, name)).toBeVisible()
        }

        // Clicking the menu button again closes it
        await userEvent.click(trigger)
        await expect(trigger).toHaveAttribute('aria-expanded', 'false')
        await waitFor(() => expect(logout).not.toBeVisible())
    },
}

export const ClosesOnOutsideClick: Story = {
    play: async ({ canvasElement, userEvent }) => {
        const trigger = await menuButton(canvasElement)
        const logout = await menuItem(canvasElement, 'Logout')

        await userEvent.click(trigger)
        await waitFor(() => expect(logout).toBeVisible())

        // Clicks inside the header keep it open
        await userEvent.click(
            await findByShadowText(canvasElement, 'No network connected')
        )
        await expect(trigger).toHaveAttribute('aria-expanded', 'true')

        await userEvent.click(canvasElement.ownerDocument.body)
        await expect(trigger).toHaveAttribute('aria-expanded', 'false')
        await waitFor(() => expect(logout).not.toBeVisible())

        // Outside clicks while closed are ignored
        await userEvent.click(canvasElement.ownerDocument.body)
        await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    },
}

export const Logout: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        const trigger = await menuButton(canvasElement)
        await userEvent.click(trigger)
        const logout = await menuItem(canvasElement, 'Logout')
        await waitFor(() => expect(logout).toBeVisible())

        await userEvent.click(logout)
        await expect(args.onLogout).toHaveBeenCalledOnce()
        await expect(args.onCopyDappApiUrl).not.toHaveBeenCalled()

        // The menu closes
        await expect(trigger).toHaveAttribute('aria-expanded', 'false')
        await waitFor(() => expect(logout).not.toBeVisible())
    },
}

export const CopyDappApiUrl: Story = {
    args: { dappApiUrl },
    play: async ({ args, canvasElement, userEvent }) => {
        const trigger = await menuButton(canvasElement)
        await userEvent.click(trigger)

        // The URL is in the name, and shows on hover
        const copy = await menuItem(
            canvasElement,
            `Copy dApp API URL: ${dappApiUrl}`
        )
        await expect(copy).toHaveAccessibleDescription(dappApiUrl)
        await expect(copy).toHaveTextContent('Dapp API URL')
        await waitFor(() => expect(copy).toBeVisible())

        await userEvent.click(copy)
        await expect(args.onCopyDappApiUrl).toHaveBeenCalledOnce()
        await expect(args.onLogout).not.toHaveBeenCalled()

        // The menu closes
        await expect(trigger).toHaveAttribute('aria-expanded', 'false')
        await waitFor(() => expect(copy).not.toBeVisible())
    },
}

export const CopyWithoutDappApiUrl: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        await userEvent.click(await menuButton(canvasElement))

        const copy = await menuItem(canvasElement, 'Copy dApp API URL')
        await waitFor(() => expect(copy).toBeVisible())
        await userEvent.click(copy)
        await expect(args.onCopyDappApiUrl).toHaveBeenCalledOnce()
    },
}
