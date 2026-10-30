// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ParsedTransactionInfo } from '@canton-network/core-tx-visualizer'
import {
    findAllByShadowRole,
    findAllByShadowText,
    findByShadowRole,
    findByShadowText,
    queryByShadowRole,
    queryByShadowText,
} from 'shadow-dom-testing-library'
import { expect, fn, waitFor } from 'storybook/test'
import { TransactionDetail } from './TransactionDetail'

const parsed: ParsedTransactionInfo = {
    isCreate: false,
    isExercise: true,
    choiceId: 'TransferPreapproval_Send',
    templateId: 'pkg:Module:Entity',
    signatories: ['alice::1220aa', 'bob::1220bb'],
    jsonString: '{"a":1}',
}

const meta = {
    title: 'TransactionDetail',
    component: TransactionDetail,
    args: {
        commandId: 'cmd-1',
        status: 'pending',
        txHash: 'hash-abc',
        parsed,
        createdAt: '2025-06-01T12:34:56Z',
        externalTxId: 'ext-tx-1',
        onTransactionApprove: fn(),
        onTransactionDelete: fn(),
    },
} satisfies Meta<typeof TransactionDetail>

export default meta

type Story = StoryObj<typeof meta>

export const Pending: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        await expect(
            await findByShadowRole(canvasElement, 'heading', {
                name: 'Activity Details',
            })
        ).toBeInTheDocument()
        for (const text of [
            'pending',
            'TransferPreapproval_Send',
            '2025-06-01 12:34',
            'alice::1220aa',
            'bob::1220bb',
            'pkg:Module:Entity',
            'cmd-1',
            'ext-tx-1',
            'hash-abc',
        ]) {
            await expect(
                await findByShadowText(canvasElement, text)
            ).toBeInTheDocument()
        }
        await expect(
            queryByShadowRole(canvasElement, 'link', { name: 'Back' })
        ).not.toBeInTheDocument()

        // Everything with a value can be copied
        for (const name of [
            'Copy template',
            'Copy command ID',
            'Copy external transaction ID',
            'Copy transaction hash',
            'Copy transaction json object',
        ]) {
            await expect(
                await findByShadowRole(canvasElement, 'button', { name })
            ).toBeInTheDocument()
        }
        await expect(
            await findAllByShadowRole(canvasElement, 'button', {
                name: 'Copy signatory',
            })
        ).toHaveLength(2)

        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Approve',
            })
        )
        await expect(args.onTransactionApprove).toHaveBeenCalledOnce()
        await expect(args.onTransactionApprove).toHaveBeenCalledWith(
            expect.objectContaining({ commandId: 'cmd-1' })
        )
        await expect(args.onTransactionDelete).not.toHaveBeenCalled()

        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', { name: 'Reject' })
        )
        await expect(args.onTransactionDelete).toHaveBeenCalledOnce()
        await expect(args.onTransactionDelete).toHaveBeenCalledWith(
            expect.objectContaining({ commandId: 'cmd-1' })
        )
    },
}

export const ToggleJson: Story = {
    play: async ({ canvasElement, userEvent }) => {
        // The JSON is only in the page while expanded
        const toggle = await findByShadowRole(canvasElement, 'button', {
            name: 'Transaction JSON Object',
        })
        await expect(toggle).toHaveAttribute('aria-expanded', 'false')
        await expect(
            queryByShadowText(canvasElement, '{"a":1}')
        ).not.toBeInTheDocument()

        await userEvent.click(toggle)
        await expect(
            await findByShadowText(canvasElement, '{"a":1}')
        ).toBeInTheDocument()
        await expect(toggle).toHaveAttribute('aria-expanded', 'true')

        // ...and collapses again
        await userEvent.click(toggle)
        await waitFor(() =>
            expect(
                queryByShadowText(canvasElement, '{"a":1}')
            ).not.toBeInTheDocument()
        )
        await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    },
}

export const WithBackLink: Story = {
    args: { backHref: '/activities/' },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowRole(canvasElement, 'link', { name: 'Back' })
        ).toHaveAttribute('href', '/activities/')
    },
}

export const Signed: Story = {
    args: { status: 'signed' },
    play: async ({ args, canvasElement, userEvent }) => {
        // A signed transaction can only be approved, not rejected
        const approve = await findByShadowRole(canvasElement, 'button', {
            name: 'Approve',
        })
        await expect(approve).toBeEnabled()
        await expect(
            queryByShadowRole(canvasElement, 'button', { name: 'Reject' })
        ).not.toBeInTheDocument()

        await userEvent.click(approve)
        await expect(args.onTransactionApprove).toHaveBeenCalledOnce()
        await expect(args.onTransactionApprove).toHaveBeenCalledWith(
            expect.objectContaining({ commandId: 'cmd-1' })
        )
    },
}

export const SubmitFailed: Story = {
    args: { status: 'signed', submitFailed: true },
    play: async ({ args, canvasElement, userEvent }) => {
        // After a failed submit, approving is a retry
        const retry = await findByShadowRole(canvasElement, 'button', {
            name: 'Retry submit',
        })
        await expect(retry).toBeEnabled()
        await expect(
            queryByShadowRole(canvasElement, 'button', { name: 'Approve' })
        ).not.toBeInTheDocument()

        await userEvent.click(retry)
        await expect(args.onTransactionApprove).toHaveBeenCalledOnce()
    },
}

export const RetryingSubmit: Story = {
    args: { status: 'signed', submitFailed: true, isApproving: true },
    play: async ({ canvasElement }) => {
        // The retry label stays while the retry runs
        await expect(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Retry submit',
            })
        ).toBeDisabled()
    },
}

export const FirstSubmit: Story = {
    args: { status: 'signed', isApproving: true },
    play: async ({ canvasElement }) => {
        // The first submit of a signed transaction is still "Approve"
        await expect(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Approve',
            })
        ).toBeDisabled()
        await expect(
            queryByShadowRole(canvasElement, 'button', {
                name: 'Retry submit',
            })
        ).not.toBeInTheDocument()
    },
}

export const Signing: Story = {
    args: { isSigning: true },
    play: async ({ args, canvasElement, userEvent }) => {
        const approve = await findByShadowRole(canvasElement, 'button', {
            name: 'Approve',
        })
        await expect(approve).toBeDisabled()
        // The transaction can still be rejected while it is being signed
        const reject = await findByShadowRole(canvasElement, 'button', {
            name: 'Reject',
        })
        await expect(reject).toBeEnabled()

        await userEvent.click(reject)
        await expect(args.onTransactionDelete).toHaveBeenCalledOnce()
    },
}

export const Deleting: Story = {
    args: { isDeleting: true },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Approve',
            })
        ).toBeDisabled()
        await expect(
            await findByShadowRole(canvasElement, 'button', { name: 'Reject' })
        ).toBeDisabled()
    },
}

export const Disabled: Story = {
    args: { disabled: true },
    play: async ({ canvasElement }) => {
        const approve = await findByShadowRole(canvasElement, 'button', {
            name: 'Approve',
        })
        const reject = await findByShadowRole(canvasElement, 'button', {
            name: 'Reject',
        })
        await expect(approve).toBeDisabled()
        await expect(reject).toBeDisabled()
    },
}

export const WithoutActions: Story = {
    render: (args) => (
        <>
            {['executed', 'failed', ''].map((status) => (
                <TransactionDetail key={status} {...args} status={status} />
            ))}
        </>
    ),
    play: async ({ canvasElement }) => {
        // Each status is shown, with a fallback label
        for (const label of ['executed', 'failed', 'Unknown']) {
            await expect(
                await findByShadowText(canvasElement, label)
            ).toBeInTheDocument()
        }

        // Only pending and signed transactions have actions
        await expect(
            queryByShadowRole(canvasElement, 'button', { name: 'Approve' })
        ).not.toBeInTheDocument()
        await expect(
            queryByShadowRole(canvasElement, 'button', { name: 'Reject' })
        ).not.toBeInTheDocument()
    },
}

export const MissingData: Story = {
    args: {
        externalTxId: null,
        txHash: '',
        parsed: null,
        createdAt: null,
    },
    play: async ({ canvasElement, userEvent }) => {
        // Action type, created at, signatories, template and transaction hash
        await expect(
            await findAllByShadowText(canvasElement, 'N/A')
        ).toHaveLength(5)
        await expect(
            queryByShadowText(canvasElement, 'External transaction ID')
        ).not.toBeInTheDocument()

        // Only the command ID can be copied
        await expect(
            await findAllByShadowRole(canvasElement, 'button', {
                name: /^Copy/,
            })
        ).toHaveLength(1)
        await expect(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Copy command ID',
            })
        ).toBeInTheDocument()

        // The JSON object falls back too
        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Transaction JSON Object',
            })
        )
        await waitFor(async () =>
            expect(
                await findAllByShadowText(canvasElement, 'N/A')
            ).toHaveLength(6)
        )
    },
}
