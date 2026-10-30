// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type {
    OauthIdp,
    SelfIssuedIdp,
} from '@canton-network/core-wallet-user-rpc-client'
import {
    findByShadowRole,
    findByShadowText,
    queryByShadowRole,
    queryByShadowText,
} from 'shadow-dom-testing-library'
import { expect, fn, waitFor } from 'storybook/test'
import { IdpForm } from './IdpForm'

const oauthIdp: OauthIdp = {
    id: 'review-idp',
    type: 'oauth',
    issuer: 'https://old-issuer.example',
    configUrl: 'https://old-config.example',
}
const selfIssuedIdp: SelfIssuedIdp = {
    id: 'self-issued-idp',
    type: 'self_issued',
}

const meta = {
    title: 'IdpForm',
    component: IdpForm,
    args: {
        onIdpFormSave: fn(),
        onIdpFormDelete: fn(),
        onIdpFormCancel: fn(),
    },
} satisfies Meta<typeof IdpForm>

export default meta

type Story = StoryObj<typeof meta>

const field = (canvasElement: HTMLElement, name: RegExp) =>
    findByShadowRole(canvasElement, 'textbox', { name })
const typeSelect = (canvasElement: HTMLElement) =>
    findByShadowRole(canvasElement, 'combobox', { name: /^Type/ })

export const Add: Story = {
    args: { mode: 'add' },
    play: async ({ args, canvasElement, userEvent }) => {
        // OAuth is the default type, so all three text fields are shown
        await expect(await typeSelect(canvasElement)).toHaveValue('oauth')
        await expect(
            await findByShadowText(
                canvasElement,
                'A unique identifier for the identity provider'
            )
        ).toBeInTheDocument()
        await expect(
            queryByShadowRole(canvasElement, 'button', { name: 'Update' })
        ).not.toBeInTheDocument()
        await expect(
            queryByShadowRole(canvasElement, 'button', { name: 'Cancel' })
        ).not.toBeInTheDocument()
        await expect(
            queryByShadowText(canvasElement, 'Delete identity provider')
        ).not.toBeInTheDocument()

        await userEvent.type(await field(canvasElement, /^ID/), 'new-idp')
        await userEvent.type(
            await field(canvasElement, /^Issuer URL/),
            'https://issuer.example'
        )
        await userEvent.type(
            await field(canvasElement, /^Config URL/),
            'https://issuer.example/.well-known'
        )
        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', { name: 'Add' })
        )

        await expect(args.onIdpFormSave).toHaveBeenCalledOnce()
        await expect(args.onIdpFormSave).toHaveBeenCalledWith(
            expect.objectContaining({
                idp: {
                    id: 'new-idp',
                    type: 'oauth',
                    issuer: 'https://issuer.example',
                    configUrl: 'https://issuer.example/.well-known',
                },
            })
        )
    },
}

export const FieldsFollowType: Story = {
    play: async ({ canvasElement, userEvent }) => {
        const type = await typeSelect(canvasElement)
        await expect(await field(canvasElement, /^Issuer URL/)).toBeVisible()
        await expect(await field(canvasElement, /^Config URL/)).toBeVisible()

        // No config URL for self-signed identity providers
        await userEvent.selectOptions(type, 'self_signed')
        await expect(await field(canvasElement, /^Issuer URL/)).toBeVisible()
        await waitFor(() =>
            expect(
                queryByShadowRole(canvasElement, 'textbox', {
                    name: /^Config URL/,
                })
            ).not.toBeInTheDocument()
        )

        // Only the ID for self-issued ones
        await userEvent.selectOptions(type, 'self_issued')
        await waitFor(() =>
            expect(
                queryByShadowRole(canvasElement, 'textbox', {
                    name: /^Issuer URL/,
                })
            ).not.toBeInTheDocument()
        )
        await expect(
            queryByShadowRole(canvasElement, 'textbox', { name: /^Config URL/ })
        ).not.toBeInTheDocument()

        await userEvent.selectOptions(type, 'oauth')
        await expect(await field(canvasElement, /^Issuer URL/)).toBeVisible()
        await expect(await field(canvasElement, /^Config URL/)).toBeVisible()
    },
}

export const AddSelfSigned: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        // Fill everything as OAuth first: the config URL is kept as a draft
        // but not sent once the type is changed
        await userEvent.type(
            await field(canvasElement, /^ID/),
            'self-signed-idp'
        )
        await userEvent.type(
            await field(canvasElement, /^Issuer URL/),
            'https://issuer.example'
        )
        await userEvent.type(
            await field(canvasElement, /^Config URL/),
            'https://should-be-ignored.example'
        )
        const type = await typeSelect(canvasElement)
        await userEvent.selectOptions(type, 'self_signed')

        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', { name: 'Add' })
        )
        await expect(args.onIdpFormSave).toHaveBeenCalledOnce()
        await expect(args.onIdpFormSave).toHaveBeenCalledWith(
            expect.objectContaining({
                idp: {
                    id: 'self-signed-idp',
                    type: 'self_signed',
                    issuer: 'https://issuer.example',
                },
            })
        )

        // Switching back restores what was typed in the hidden field
        await userEvent.selectOptions(type, 'oauth')
        await expect(await field(canvasElement, /^Config URL/)).toHaveValue(
            'https://should-be-ignored.example'
        )
        await expect(await field(canvasElement, /^Issuer URL/)).toHaveValue(
            'https://issuer.example'
        )
    },
}

export const AddSelfIssued: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        await userEvent.selectOptions(
            await typeSelect(canvasElement),
            'self_issued'
        )
        await waitFor(() =>
            expect(
                queryByShadowRole(canvasElement, 'textbox', {
                    name: /^Issuer URL/,
                })
            ).not.toBeInTheDocument()
        )

        // Enter submits the form
        await userEvent.type(
            await field(canvasElement, /^ID/),
            'self-issued-idp{Enter}'
        )
        await expect(args.onIdpFormSave).toHaveBeenCalledOnce()
        await expect(args.onIdpFormSave).toHaveBeenCalledWith(
            expect.objectContaining({
                idp: {
                    id: 'self-issued-idp',
                    type: 'self_issued',
                },
            })
        )
    },
}

export const RequiresFields: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        // The browser blocks submitting empty required fields
        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', { name: 'Add' })
        )

        await expect(args.onIdpFormSave).not.toHaveBeenCalled()
        await expect(await field(canvasElement, /^ID/)).toBeInvalid()
    },
}

export const Review: Story = {
    args: { mode: 'review', idp: oauthIdp },
    play: async ({ args, canvasElement, userEvent }) => {
        // Prefilled with the identity provider
        await expect(await field(canvasElement, /^ID/)).toHaveValue(
            'review-idp'
        )
        await expect(await typeSelect(canvasElement)).toHaveValue('oauth')
        await expect(await field(canvasElement, /^Issuer URL/)).toHaveValue(
            'https://old-issuer.example'
        )
        await expect(await field(canvasElement, /^Config URL/)).toHaveValue(
            'https://old-config.example'
        )
        await expect(
            queryByShadowRole(canvasElement, 'button', { name: 'Add' })
        ).not.toBeInTheDocument()

        // Updating sends the edited values. Select-and-type replaces the text
        // (userEvent.clear can't focus inputs inside a shadow root)
        const issuer = await field(canvasElement, /^Issuer URL/)
        await userEvent.tripleClick(issuer)
        await userEvent.keyboard('https://new-issuer.example')
        const configUrl = await field(canvasElement, /^Config URL/)
        await userEvent.tripleClick(configUrl)
        await userEvent.keyboard('https://new-config.example')
        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', { name: 'Update' })
        )
        await expect(args.onIdpFormSave).toHaveBeenCalledOnce()
        await expect(args.onIdpFormSave).toHaveBeenCalledWith(
            expect.objectContaining({
                idp: {
                    id: 'review-idp',
                    type: 'oauth',
                    issuer: 'https://new-issuer.example',
                    configUrl: 'https://new-config.example',
                },
            })
        )

        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', { name: 'Cancel' })
        )
        await expect(args.onIdpFormCancel).toHaveBeenCalledOnce()

        // Delete reports the identity provider as passed in, not the edited one
        await expect(
            await findByShadowRole(canvasElement, 'heading', {
                name: 'Delete identity provider',
            })
        ).toBeInTheDocument()
        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Delete identity provider',
            })
        )
        await expect(args.onIdpFormDelete).toHaveBeenCalledOnce()
        await expect(args.onIdpFormDelete).toHaveBeenCalledWith(
            expect.objectContaining({ idp: oauthIdp })
        )
        await expect(args.onIdpFormSave).toHaveBeenCalledOnce()
    },
}

export const ReviewSelfIssued: Story = {
    args: { mode: 'review', idp: selfIssuedIdp },
    play: async ({ canvasElement }) => {
        await expect(await field(canvasElement, /^ID/)).toHaveValue(
            'self-issued-idp'
        )
        await expect(await typeSelect(canvasElement)).toHaveValue('self_issued')
        await expect(
            queryByShadowRole(canvasElement, 'textbox', { name: /^Issuer URL/ })
        ).not.toBeInTheDocument()
    },
}

export const Loading: Story = {
    args: { loading: true },
    play: async ({ canvasElement }) => {
        await expect(await field(canvasElement, /^ID/)).toBeDisabled()
        await expect(await typeSelect(canvasElement)).toBeDisabled()
        await expect(await field(canvasElement, /^Issuer URL/)).toBeDisabled()
        await expect(await field(canvasElement, /^Config URL/)).toBeDisabled()
        await expect(
            await findByShadowRole(canvasElement, 'button', { name: 'Add' })
        ).toBeDisabled()
    },
}

export const ReviewLoading: Story = {
    args: { mode: 'review', idp: oauthIdp, loading: true },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowRole(canvasElement, 'button', { name: 'Update' })
        ).toBeDisabled()
    },
}

export const StartsOverWhenIdpChanges: Story = {
    render: (args) => {
        const [idp, setIdp] = useState<OauthIdp | SelfIssuedIdp>(oauthIdp)
        return (
            <>
                <IdpForm {...args} mode="review" idp={idp} />
                <button onClick={() => setIdp(selfIssuedIdp)}>
                    Show other
                </button>
            </>
        )
    },
    play: async ({ canvasElement, userEvent }) => {
        await userEvent.type(await field(canvasElement, /^ID/), '-edited')
        await expect(await field(canvasElement, /^ID/)).toHaveValue(
            'review-idp-edited'
        )

        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Show other',
            })
        )

        await waitFor(async () =>
            expect(await field(canvasElement, /^ID/)).toHaveValue(
                'self-issued-idp'
            )
        )
        await expect(await typeSelect(canvasElement)).toHaveValue('self_issued')
    },
}
