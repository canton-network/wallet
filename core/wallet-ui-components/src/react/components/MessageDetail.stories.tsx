// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Meta, StoryObj } from '@storybook/react-vite'
import {
    findByShadowRole,
    findByShadowText,
    queryByShadowRole,
    queryByShadowText,
} from 'shadow-dom-testing-library'
import { expect, fn } from 'storybook/test'
import { MessageDetail } from './MessageDetail'

const message = 'Sign in to Example dApp\nNonce: 12345'

const meta = {
    title: 'MessageDetail',
    component: MessageDetail,
    args: {
        messageId: 'msg-1',
        message,
        status: 'pending',
        onMessageApprove: fn(),
        onMessageDelete: fn(),
    },
} satisfies Meta<typeof MessageDetail>

export default meta

type Story = StoryObj<typeof meta>

export const Pending: Story = {
    args: {
        origin: 'https://dapp.example',
        externalTxId: 'ext-1',
        backHref: '/activities/',
    },
    play: async ({ args, canvasElement, userEvent }) => {
        await expect(
            await findByShadowRole(canvasElement, 'heading', {
                name: 'Message Details',
            })
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(canvasElement, 'pending')
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(canvasElement, 'https://dapp.example')
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(canvasElement, 'ext-1')
        ).toBeInTheDocument()
        await expect(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Copy external transaction ID',
            })
        ).toBeInTheDocument()
        await expect(
            await findByShadowRole(canvasElement, 'link', { name: 'Back' })
        ).toHaveAttribute('href', '/activities/')

        // The message is shown as is, line breaks included
        await expect(
            await findByShadowText(
                canvasElement,
                (_, el) => el?.tagName === 'PRE' && el.textContent === message
            )
        ).toBeInTheDocument()

        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Approve',
            })
        )
        await expect(args.onMessageApprove).toHaveBeenCalledOnce()
        await expect(args.onMessageApprove).toHaveBeenCalledWith(
            expect.objectContaining({ messageId: 'msg-1' })
        )
        await expect(args.onMessageDelete).not.toHaveBeenCalled()

        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', { name: 'Reject' })
        )
        await expect(args.onMessageDelete).toHaveBeenCalledOnce()
        await expect(args.onMessageDelete).toHaveBeenCalledWith(
            expect.objectContaining({ messageId: 'msg-1' })
        )
    },
}

export const Minimal: Story = {
    play: async ({ canvasElement }) => {
        await findByShadowRole(canvasElement, 'heading', {
            name: 'Message Details',
        })
        // The optional rows and the back link are only shown when set
        await expect(
            queryByShadowText(canvasElement, 'Requested by')
        ).not.toBeInTheDocument()
        await expect(
            queryByShadowText(canvasElement, 'External transaction ID')
        ).not.toBeInTheDocument()
        await expect(
            queryByShadowRole(canvasElement, 'button', { name: /^Copy/ })
        ).not.toBeInTheDocument()
        await expect(
            queryByShadowRole(canvasElement, 'link', { name: 'Back' })
        ).not.toBeInTheDocument()
    },
}

export const AwaitingSignature: Story = {
    args: {
        status: 'awaiting-signature',
        origin: 'https://dapp.example',
        externalTxId: 'ext-1',
    },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowText(canvasElement, 'awaiting-signature')
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(canvasElement, 'Requested by')
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(canvasElement, 'External transaction ID')
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(canvasElement, 'ext-1')
        ).toBeInTheDocument()
        await expect(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Copy external transaction ID',
            })
        ).toBeInTheDocument()

        // Only pending messages have actions
        await expect(
            queryByShadowRole(canvasElement, 'button', { name: 'Approve' })
        ).not.toBeInTheDocument()
        await expect(
            queryByShadowRole(canvasElement, 'button', { name: 'Reject' })
        ).not.toBeInTheDocument()
    },
}

export const WithoutActions: Story = {
    render: (args) => (
        <>
            {['signed', 'failed', ''].map((status) => (
                <MessageDetail key={status} {...args} status={status} />
            ))}
        </>
    ),
    play: async ({ canvasElement }) => {
        // Each status is shown, with a fallback label
        for (const label of ['signed', 'failed', 'Unknown']) {
            await expect(
                await findByShadowText(canvasElement, label)
            ).toBeInTheDocument()
        }

        // Only pending messages have actions
        await expect(
            queryByShadowRole(canvasElement, 'button', { name: 'Approve' })
        ).not.toBeInTheDocument()
        await expect(
            queryByShadowRole(canvasElement, 'button', { name: 'Reject' })
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
        // The message can still be rejected while it is being signed
        const reject = await findByShadowRole(canvasElement, 'button', {
            name: 'Reject',
        })
        await expect(reject).toBeEnabled()

        await userEvent.click(reject)
        await expect(args.onMessageDelete).toHaveBeenCalledOnce()
    },
}

export const Approving: Story = {
    args: { isApproving: true },
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
