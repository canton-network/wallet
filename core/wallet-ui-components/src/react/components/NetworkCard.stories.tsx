// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { PublicNetwork } from '@canton-network/core-wallet-user-rpc-client'
import {
    findByShadowRole,
    findByShadowText,
    queryByShadowRole,
    queryByShadowText,
} from 'shadow-dom-testing-library'
import { expect, fn, type Mock } from 'storybook/test'
import type { NetworkCardReviewEvent } from '../../components/network-card'
import { NetworkCard } from './NetworkCard'

const network: PublicNetwork = {
    id: 'canton:devnet',
    name: 'DevNet',
    description: 'Canton DevNet',
    authMethod: 'authorization_code',
    synchronizerId:
        'global-domain::1220be58c29e65de40bf273be1dc2b266d43a9a002ea5b18955aeef7aac881bb471a',
    identityProviderId: 'idp-1',
    ledgerApi: 'https://ledger.example',
    clientId: 'client-1',
}

const { synchronizerId: _, ...rest } = network
const withoutSynchronizer: PublicNetwork = { ...rest, identityProviderId: '' }

const meta = {
    title: 'NetworkCard',
    component: NetworkCard,
    args: {
        network,
        onNetworkReview: fn(),
    },
} satisfies Meta<typeof NetworkCard>

export default meta

type Story = StoryObj<typeof meta>

/** The event passed to the first onNetworkReview call */
const reviewEvent = (onNetworkReview: Mock | undefined) =>
    onNetworkReview?.mock.calls[0]?.[0] as NetworkCardReviewEvent

export const Default: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        await expect(
            await findByShadowText(canvasElement, 'DevNet')
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(canvasElement, 'canton:devnet')
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(canvasElement, 'authorization_code')
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(canvasElement, 'Synchronizer')
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(canvasElement, network.synchronizerId!)
        ).toBeInTheDocument()
        await expect(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Copy synchronizer ID',
            })
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(canvasElement, 'Identity provider')
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(canvasElement, 'idp-1')
        ).toBeInTheDocument()

        // Session-only content is hidden
        await expect(
            queryByShadowText(canvasElement, 'CONNECTED')
        ).not.toBeInTheDocument()
        await expect(
            queryByShadowText(canvasElement, '[private]')
        ).not.toBeInTheDocument()
        await expect(
            queryByShadowRole(canvasElement, 'button', {
                name: 'Copy access token',
            })
        ).not.toBeInTheDocument()

        // Clicking anywhere on the card asks to review the network
        await userEvent.click(await findByShadowRole(canvasElement, 'article'))
        await expect(args.onNetworkReview).toHaveBeenCalledOnce()
        await expect(reviewEvent(args.onNetworkReview).network).toEqual(network)
    },
}

export const ActiveSession: Story = {
    args: { activeSession: true, accessToken: 'secret-token' },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowText(canvasElement, 'CONNECTED')
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(canvasElement, 'Access Token')
        ).toBeInTheDocument()
        // The token itself is never rendered
        await expect(
            await findByShadowText(canvasElement, '[private]')
        ).toBeInTheDocument()
        await expect(
            queryByShadowText(canvasElement, 'secret-token')
        ).not.toBeInTheDocument()
        await expect(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Copy access token',
            })
        ).toBeInTheDocument()
    },
}

export const ReadOnly: Story = {
    args: { readonly: true },
    play: async ({ args, canvasElement, userEvent }) => {
        await userEvent.click(await findByShadowText(canvasElement, 'DevNet'))
        await expect(args.onNetworkReview).not.toHaveBeenCalled()
    },
}

export const Minimal: Story = {
    args: {
        network: withoutSynchronizer,
    },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowText(canvasElement, 'canton:devnet')
        ).toBeInTheDocument()
        await expect(
            queryByShadowText(canvasElement, 'Synchronizer')
        ).not.toBeInTheDocument()
        await expect(
            queryByShadowRole(canvasElement, 'button', {
                name: 'Copy synchronizer ID',
            })
        ).not.toBeInTheDocument()
        await expect(
            queryByShadowText(canvasElement, 'Identity provider')
        ).not.toBeInTheDocument()
    },
}

export const NoNetwork: Story = {
    args: { network: null },
    play: async ({ args, canvasElement, userEvent }) => {
        const placeholder = await findByShadowText(
            canvasElement,
            'No network supplied'
        )
        await userEvent.click(placeholder)
        await expect(args.onNetworkReview).not.toHaveBeenCalled()
    },
}
