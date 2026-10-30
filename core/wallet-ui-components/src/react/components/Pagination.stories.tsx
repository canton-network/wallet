// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { findByShadowRole, findByShadowText } from 'shadow-dom-testing-library'
import { expect, fn } from 'storybook/test'
import { Pagination } from './Pagination'

const meta = {
    title: 'Pagination',
    component: Pagination,
    args: {
        onPageChange: fn(),
    },
} satisfies Meta<typeof Pagination>

export default meta

type Story = StoryObj<typeof meta>

const previous = (canvasElement: HTMLElement) =>
    findByShadowRole(canvasElement, 'button', { name: 'Previous page' })

const next = (canvasElement: HTMLElement) =>
    findByShadowRole(canvasElement, 'button', { name: 'Next page' })

export const FirstPage: Story = {
    args: { total: 12, pageSize: 5 },
    play: async ({ args, canvasElement, userEvent }) => {
        await expect(
            await findByShadowText(canvasElement, '1-5 of 12')
        ).toBeVisible()
        await expect(await previous(canvasElement)).toBeDisabled()
        await expect(await next(canvasElement)).toBeEnabled()

        await userEvent.click(await previous(canvasElement))
        await expect(args.onPageChange).not.toHaveBeenCalled()

        // The element moves to the next page itself and reports it
        await userEvent.click(await next(canvasElement))
        await expect(
            await findByShadowText(canvasElement, '6-10 of 12')
        ).toBeVisible()
        await expect(args.onPageChange).toHaveBeenCalledOnce()
        await expect(args.onPageChange?.mock.calls[0]?.[0].page).toBe(2)
        await expect(await previous(canvasElement)).toBeEnabled()
    },
}

export const MiddlePage: Story = {
    args: { total: 42, pageSize: 10, page: 3 },
    play: async ({ args, canvasElement, userEvent }) => {
        await expect(
            await findByShadowText(canvasElement, '21-30 of 42')
        ).toBeVisible()

        await userEvent.click(await previous(canvasElement))
        await expect(
            await findByShadowText(canvasElement, '11-20 of 42')
        ).toBeVisible()
        await expect(args.onPageChange?.mock.lastCall?.[0].page).toBe(2)

        await userEvent.click(await next(canvasElement))
        await expect(
            await findByShadowText(canvasElement, '21-30 of 42')
        ).toBeVisible()
        await expect(args.onPageChange?.mock.lastCall?.[0].page).toBe(3)
    },
}

export const SinglePage: Story = {
    args: { total: 5, pageSize: 5 },
    play: async ({ args, canvasElement, userEvent }) => {
        await expect(
            await findByShadowText(canvasElement, '1-5 of 5')
        ).toBeVisible()
        await expect(await previous(canvasElement)).toBeDisabled()
        await expect(await next(canvasElement)).toBeDisabled()

        await userEvent.click(await next(canvasElement))
        await expect(args.onPageChange).not.toHaveBeenCalled()
    },
}

export const LastPage: Story = {
    args: { total: 19, pageSize: 5, page: 4 },
    play: async ({ args, canvasElement, userEvent }) => {
        await expect(
            await findByShadowText(canvasElement, '16-19 of 19')
        ).toBeVisible()
        await expect(await next(canvasElement)).toBeDisabled()
        await expect(await previous(canvasElement)).toBeEnabled()

        await userEvent.click(await next(canvasElement))
        await expect(args.onPageChange).not.toHaveBeenCalled()
    },
}

export const Empty: Story = {
    args: { total: 0, pageSize: 5 },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowText(canvasElement, '0-0 of 0')
        ).toBeVisible()
        await expect(await previous(canvasElement)).toBeDisabled()
        await expect(await next(canvasElement)).toBeDisabled()
    },
}

export const PageOutOfRange: Story = {
    args: { total: 10, pageSize: 5, page: 99 },
    play: async ({ args, canvasElement, userEvent }) => {
        // Clamped to the last page
        await expect(
            await findByShadowText(canvasElement, '6-10 of 10')
        ).toBeVisible()
        await expect(await next(canvasElement)).toBeDisabled()

        await userEvent.click(await previous(canvasElement))
        await expect(args.onPageChange).toHaveBeenCalledOnce()
        await expect(args.onPageChange?.mock.calls[0]?.[0].page).toBe(1)
    },
}

export const InvalidPageAndPageSize: Story = {
    args: { total: 3, pageSize: 0, page: 0 },
    play: async ({ canvasElement }) => {
        // A page size below 1 counts as 1, a page below 1 as the first page
        await expect(
            await findByShadowText(canvasElement, '1-1 of 3')
        ).toBeVisible()
        await expect(await previous(canvasElement)).toBeDisabled()
        await expect(await next(canvasElement)).toBeEnabled()
    },
}

export const Controlled: Story = {
    args: { total: 29, pageSize: 5 },
    render: (args) => {
        const [page, setPage] = useState(1)
        return (
            <Pagination
                {...args}
                page={page}
                onPageChange={(event) => {
                    args.onPageChange?.(event)
                    setPage(event.page)
                }}
            />
        )
    },
    play: async ({ args, canvasElement, userEvent }) => {
        for (const range of ['6-10', '11-15', '16-20', '21-25', '26-29']) {
            await userEvent.click(await next(canvasElement))
            await expect(
                await findByShadowText(canvasElement, `${range} of 29`)
            ).toBeVisible()
        }
        await expect(await next(canvasElement)).toBeDisabled()
        await expect(args.onPageChange).toHaveBeenCalledTimes(5)

        await userEvent.click(await previous(canvasElement))
        await expect(
            await findByShadowText(canvasElement, '21-25 of 29')
        ).toBeVisible()
    },
}
