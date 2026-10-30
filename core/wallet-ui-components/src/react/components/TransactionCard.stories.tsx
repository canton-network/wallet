// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ParsedTransactionInfo } from '@canton-network/core-tx-visualizer'
import {
    findAllByShadowText,
    findByShadowRole,
    findByShadowText,
    queryByShadowText,
} from 'shadow-dom-testing-library'
import { expect, fn } from 'storybook/test'
import { TransactionCard } from './TransactionCard'

const parsed: ParsedTransactionInfo = {
    isCreate: false,
    isExercise: true,
    choiceId: 'TransferPreapproval_Send',
    amount: '100.0 CC',
}

const meta = {
    title: 'TransactionCard',
    component: TransactionCard,
    args: {
        transactionId: 'tx-1',
        commandId: 'cmd-1',
        status: 'pending',
        parsed,
        createdAt: '2025-06-01T12:34:56Z',
        onTransactionReview: fn(),
    },
} satisfies Meta<typeof TransactionCard>

export default meta

type Story = StoryObj<typeof meta>

// The e2e helpers locate cards by this accessible name
const card = (canvasElement: HTMLElement, commandId = 'cmd-1') =>
    findByShadowRole(canvasElement, 'button', {
        name: `Open activity ${commandId}`,
    })

export const Default: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        await expect(
            await findByShadowText(canvasElement, 'cmd-1')
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(canvasElement, 'pending')
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(canvasElement, 'TransferPreapproval_Send')
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(canvasElement, '100.0 CC')
        ).toBeInTheDocument()
        // Only the date and time up to the minute are shown
        await expect(
            await findByShadowText(canvasElement, '2025-06-01 12:34')
        ).toBeInTheDocument()
        await expect(
            queryByShadowText(canvasElement, 'External transaction ID')
        ).not.toBeInTheDocument()

        await userEvent.click(await card(canvasElement))
        await expect(args.onTransactionReview).toHaveBeenCalledOnce()
        await expect(args.onTransactionReview).toHaveBeenCalledWith(
            expect.objectContaining({
                transactionId: 'tx-1',
                commandId: 'cmd-1',
            })
        )
    },
}

export const WithExternalTxId: Story = {
    args: { externalTxId: 'ext-tx-123' },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowText(canvasElement, 'External transaction ID')
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(canvasElement, 'ext-tx-123')
        ).toBeInTheDocument()
    },
}

export const Executed: Story = {
    args: { status: 'executed' },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowText(canvasElement, 'executed')
        ).toBeInTheDocument()
    },
}

export const Failed: Story = {
    args: { status: 'failed' },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowText(canvasElement, 'failed')
        ).toBeInTheDocument()
    },
}

export const UnknownStatus: Story = {
    args: { status: '' },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowText(canvasElement, 'Unknown')
        ).toBeInTheDocument()
    },
}

export const WithoutParsedData: Story = {
    args: { parsed: null, createdAt: null },
    play: async ({ canvasElement }) => {
        // Action type, created at and amount all fall back to N/A
        await expect(
            await findAllByShadowText(canvasElement, 'N/A')
        ).toHaveLength(3)
    },
}

export const Loading: Story = {
    args: { loading: true },
    play: async ({ args, canvasElement, userEvent }) => {
        await userEvent.click(await card(canvasElement))
        await expect(args.onTransactionReview).not.toHaveBeenCalled()
    },
}

export const LongIds: Story = {
    args: {
        commandId: 'cmd-' + 'a'.repeat(80),
        externalTxId: 'ext-' + 'b'.repeat(80),
    },
    decorators: [
        (Story) => (
            <div style={{ width: 360 }}>
                <Story />
            </div>
        ),
    ],
    play: async ({ args, canvasElement }) => {
        // Truncated visually, with the full ID on hover; labels stay in full
        const commandId = await findByShadowText(canvasElement, args.commandId!)
        await expect(commandId).toHaveAttribute('title', args.commandId)
        await expect(commandId.scrollWidth).toBeGreaterThan(
            commandId.clientWidth
        )
        const label = await findByShadowText(
            canvasElement,
            'External transaction ID'
        )
        await expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth)
    },
}
