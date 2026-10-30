// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Meta, StoryObj } from '@storybook/react-vite'
import {
    findByShadowRole,
    findByShadowText,
    queryByShadowRole,
} from 'shadow-dom-testing-library'
import { expect, fn } from 'storybook/test'
import { ErrorPage } from './ErrorPage'

const meta = {
    title: 'ErrorPage',
    component: ErrorPage,
    args: {
        // Navigating or reloading would tear down the story
        performDefaultAction: false,
        onErrorBack: fn(),
        onErrorRefresh: fn(),
    },
} satisfies Meta<typeof ErrorPage>

export default meta

type Story = StoryObj<typeof meta>

export const Defaults: Story = {
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowRole(canvasElement, 'alert')
        ).toBeInTheDocument()
        await expect(
            await findByShadowRole(canvasElement, 'heading', {
                level: 1,
                name: 'Something went wrong',
            })
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(
                canvasElement,
                'An unexpected error occurred while loading this page.'
            )
        ).toBeInTheDocument()
        // Back mode is the default
        await expect(
            await findByShadowRole(canvasElement, 'button', { name: 'Back' })
        ).toBeInTheDocument()
    },
}

export const BackMode: Story = {
    args: {
        mode: 'back',
        title: 'Unable to load parties',
        message: 'The wallet gateway could not fetch parties for this network.',
    },
    play: async ({ args, canvasElement, userEvent }) => {
        await expect(
            await findByShadowRole(canvasElement, 'heading', {
                level: 1,
                name: 'Unable to load parties',
            })
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(
                canvasElement,
                'The wallet gateway could not fetch parties for this network.'
            )
        ).toBeInTheDocument()
        await expect(
            queryByShadowRole(canvasElement, 'button', { name: 'Refresh' })
        ).not.toBeInTheDocument()

        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', { name: 'Back' })
        )
        await expect(args.onErrorBack).toHaveBeenCalledOnce()
        await expect(args.onErrorRefresh).not.toHaveBeenCalled()
    },
}

export const RefreshMode: Story = {
    args: {
        mode: 'refresh',
        title: 'Connection lost',
        message: 'Please refresh to reconnect to Wallet Gateway.',
    },
    play: async ({ args, canvasElement, userEvent }) => {
        await expect(
            await findByShadowRole(canvasElement, 'heading', {
                level: 1,
                name: 'Connection lost',
            })
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(
                canvasElement,
                'Please refresh to reconnect to Wallet Gateway.'
            )
        ).toBeInTheDocument()
        await expect(
            queryByShadowRole(canvasElement, 'button', { name: 'Back' })
        ).not.toBeInTheDocument()

        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', { name: 'Refresh' })
        )
        await expect(args.onErrorRefresh).toHaveBeenCalledOnce()
        await expect(args.onErrorBack).not.toHaveBeenCalled()
    },
}
