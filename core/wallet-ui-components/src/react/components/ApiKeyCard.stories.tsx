// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ApiKey } from '@canton-network/core-wallet-user-rpc-client'
import {
    findByShadowRole,
    findByShadowText,
    queryByShadowRole,
} from 'shadow-dom-testing-library'
import { expect, fn } from 'storybook/test'
import { ApiKeyCard } from './ApiKeyCard'

const apiKey: ApiKey = {
    name: 'My API Key',
    id: '1234-5678-0000',
    createdAt: '2025-06-01T00:00:00Z',
}

const meta = {
    title: 'ApiKeyCard',
    component: ApiKeyCard,
    args: {
        apiKey,
        onRevoke: fn(),
    },
} satisfies Meta<typeof ApiKeyCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        await expect(
            await findByShadowText(canvasElement, 'My API Key')
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(canvasElement, '1234-5678-0000')
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(canvasElement, '2025-06-01T00:00:00Z')
        ).toBeInTheDocument()

        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', { name: 'Revoke' })
        )
        await expect(args.onRevoke).toHaveBeenCalledOnce()
        await expect(args.onRevoke).toHaveBeenCalledWith(
            expect.objectContaining({ apiKey })
        )
    },
}

export const NoApiKey: Story = {
    args: { apiKey: null },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowText(canvasElement, 'No API key supplied')
        ).toBeInTheDocument()
        await expect(
            queryByShadowRole(canvasElement, 'button', { name: 'Revoke' })
        ).not.toBeInTheDocument()
    },
}
