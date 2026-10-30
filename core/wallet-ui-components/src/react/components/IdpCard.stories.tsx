// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Meta, StoryObj } from '@storybook/react-vite'
import type {
    OauthIdp,
    SelfIssuedIdp,
    SelfSignedIdp,
} from '@canton-network/core-wallet-user-rpc-client'
import {
    findByShadowRole,
    findByShadowText,
    queryByShadowRole,
    queryByShadowText,
} from 'shadow-dom-testing-library'
import { expect, fn } from 'storybook/test'
import { IdpCard } from './IdpCard'

const oauthIdp: OauthIdp = {
    id: 'my-idp',
    type: 'oauth',
    issuer: 'https://issuer.example',
    configUrl: 'https://issuer.example/.well-known/openid-configuration',
}

const selfSignedIdp: SelfSignedIdp = {
    id: 'self-signed-idp',
    type: 'self_signed',
    issuer: 'https://self-signed.example',
}

const selfIssuedIdp: SelfIssuedIdp = {
    id: 'self-issued-idp',
    type: 'self_issued',
}

const meta = {
    title: 'IdpCard',
    component: IdpCard,
    args: {
        idp: oauthIdp,
        onIdpReview: fn(),
    },
} satisfies Meta<typeof IdpCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        await expect(
            await findByShadowText(canvasElement, 'Type')
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(canvasElement, 'oauth')
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(canvasElement, 'Issuer')
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(canvasElement, oauthIdp.issuer)
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(canvasElement, 'Config URL')
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(canvasElement, oauthIdp.configUrl)
        ).toBeInTheDocument()

        // Clicking anywhere on the card opens it for review
        await userEvent.click(await findByShadowText(canvasElement, 'my-idp'))
        await expect(args.onIdpReview).toHaveBeenCalledOnce()
        await expect(args.onIdpReview).toHaveBeenCalledWith(
            expect.objectContaining({ idp: oauthIdp })
        )
    },
}

export const CopyButtons: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        await expect(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Copy issuer URL',
            })
        ).toBeInTheDocument()
        const copyConfigUrl = await findByShadowRole(canvasElement, 'button', {
            name: 'Copy config URL',
        })

        // Copying doesn't open the identity provider
        await userEvent.click(copyConfigUrl)
        await expect(args.onIdpReview).not.toHaveBeenCalled()
    },
}

export const SelfSigned: Story = {
    args: { idp: selfSignedIdp },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowText(canvasElement, 'self_signed')
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(canvasElement, selfSignedIdp.issuer)
        ).toBeInTheDocument()
        await expect(
            queryByShadowText(canvasElement, 'Config URL')
        ).not.toBeInTheDocument()
        await expect(
            queryByShadowRole(canvasElement, 'button', {
                name: 'Copy config URL',
            })
        ).not.toBeInTheDocument()
    },
}

export const OauthWithoutConfigUrl: Story = {
    args: { idp: { ...oauthIdp, configUrl: '' } },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowText(canvasElement, oauthIdp.issuer)
        ).toBeInTheDocument()
        await expect(
            queryByShadowText(canvasElement, 'Config URL')
        ).not.toBeInTheDocument()
    },
}

export const SelfIssued: Story = {
    args: { idp: selfIssuedIdp },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowText(canvasElement, 'self_issued')
        ).toBeInTheDocument()
        await expect(
            queryByShadowText(canvasElement, 'Issuer')
        ).not.toBeInTheDocument()
        await expect(
            queryByShadowText(canvasElement, 'Config URL')
        ).not.toBeInTheDocument()
        await expect(
            queryByShadowRole(canvasElement, 'button', { name: /^Copy/ })
        ).not.toBeInTheDocument()
    },
}

export const ReadOnly: Story = {
    args: { readonly: true },
    play: async ({ args, canvasElement, userEvent }) => {
        await userEvent.click(await findByShadowText(canvasElement, 'my-idp'))
        await expect(args.onIdpReview).not.toHaveBeenCalled()
    },
}

export const NoIdp: Story = {
    args: { idp: null },
    play: async ({ args, canvasElement, userEvent }) => {
        const placeholder = await findByShadowText(
            canvasElement,
            'No identity provider supplied'
        )
        await userEvent.click(placeholder)
        await expect(args.onIdpReview).not.toHaveBeenCalled()
    },
}
