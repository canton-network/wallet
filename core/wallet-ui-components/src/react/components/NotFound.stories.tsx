// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Meta, StoryObj } from '@storybook/react-vite'
import { findByShadowRole, findByShadowText } from 'shadow-dom-testing-library'
import { expect } from 'storybook/test'
import { NotFound } from './NotFound'

const meta = {
    title: 'NotFound',
    component: NotFound,
} satisfies Meta<typeof NotFound>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowRole(canvasElement, 'heading', {
                level: 1,
                name: 'Page not found',
            })
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(
                canvasElement,
                "Sorry, the page you're looking for doesn't exist. It may have been moved or deleted."
            )
        ).toBeInTheDocument()
        // Clicking navigates away, so only check the way back is offered
        await expect(
            await findByShadowRole(canvasElement, 'button', { name: 'Back' })
        ).toBeEnabled()
    },
}

export const CustomHref: Story = {
    args: { href: '/wallets' },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowRole(canvasElement, 'button', { name: 'Back' })
        ).toBeEnabled()
    },
}
