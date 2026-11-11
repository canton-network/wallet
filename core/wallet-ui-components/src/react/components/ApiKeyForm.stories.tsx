// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Meta, StoryObj } from '@storybook/react-vite'
import { findByShadowRole } from 'shadow-dom-testing-library'
import { expect, fn } from 'storybook/test'
import { fillField } from '../__tests__/fields'
import { ApiKeyForm } from './ApiKeyForm'

const meta = {
    title: 'ApiKeyForm',
    component: ApiKeyForm,
    args: {
        onApiKeyGenerate: fn(),
    },
} satisfies Meta<typeof ApiKeyForm>

export default meta

type Story = StoryObj<typeof meta>

// The "Name" label is not associated with its input, so the field has no
// accessible name: it is found as the form's only textbox
const findName = (canvasElement: HTMLElement) =>
    findByShadowRole(canvasElement, 'textbox')

export const Default: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        const name = await findName(canvasElement)
        await expect(name).toBeRequired()
        await expect(name).toHaveValue('')

        await fillField(userEvent, name, 'New API Key')
        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Generate',
            })
        )

        await expect(args.onApiKeyGenerate).toHaveBeenCalledOnce()
        await expect(args.onApiKeyGenerate).toHaveBeenCalledWith(
            expect.objectContaining({ apiKeyParams: { name: 'New API Key' } })
        )
    },
}

export const SubmitsWithEnter: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        const name = await findName(canvasElement)
        await fillField(userEvent, name, 'Keyboard key')
        await userEvent.type(name, '{Enter}')

        await expect(args.onApiKeyGenerate).toHaveBeenCalledOnce()
        await expect(args.onApiKeyGenerate).toHaveBeenCalledWith(
            expect.objectContaining({ apiKeyParams: { name: 'Keyboard key' } })
        )
    },
}

export const RequiresName: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        // The browser blocks submitting an empty required field
        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Generate',
            })
        )

        await expect(args.onApiKeyGenerate).not.toHaveBeenCalled()
        await expect(await findName(canvasElement)).toBeInvalid()
    },
}

export const Prefilled: Story = {
    args: { apiKeyParams: { name: 'Existing key' } },
    play: async ({ args, canvasElement, userEvent }) => {
        await expect(await findName(canvasElement)).toHaveValue('Existing key')

        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Generate',
            })
        )
        await expect(args.onApiKeyGenerate).toHaveBeenCalledWith(
            expect.objectContaining({ apiKeyParams: { name: 'Existing key' } })
        )
    },
}
