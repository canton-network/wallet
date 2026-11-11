// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Meta, StoryObj } from '@storybook/react-vite'
import { findByShadowRole } from 'shadow-dom-testing-library'
import { expect } from 'storybook/test'
import { PageHeader } from './PageHeader'

const meta = {
    title: 'PageHeader',
    component: PageHeader,
    args: { heading: 'Parties' },
} satisfies Meta<typeof PageHeader>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowRole(canvasElement, 'heading', { level: 1 })
        ).toHaveTextContent(/^Parties$/)
    },
}

export const WithActions: Story = {
    render: (args) => (
        <PageHeader {...args}>
            <button type="button" slot="title-suffix">
                Refresh
            </button>
            <button type="button">New</button>
        </PageHeader>
    ),
    play: async ({ canvasElement }) => {
        // Slotted content is shown alongside the heading
        await expect(
            await findByShadowRole(canvasElement, 'heading', {
                level: 1,
                name: 'Parties',
            })
        ).toBeVisible()
        await expect(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Refresh',
            })
        ).toBeVisible()
        await expect(
            await findByShadowRole(canvasElement, 'button', { name: 'New' })
        ).toBeVisible()
    },
}
