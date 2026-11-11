// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type {
    Idp,
    PublicNetwork,
} from '@canton-network/core-wallet-user-rpc-client'
import {
    findByShadowAltText,
    findByShadowLabelText,
    findByShadowRole,
    findByShadowText,
    queryByShadowLabelText,
    queryByShadowRole,
    queryByShadowText,
} from 'shadow-dom-testing-library'
import { expect, fn, waitFor, type Mock } from 'storybook/test'
import type { LoginConnectEvent } from '../../components/login-form'
import { LoginForm } from './LoginForm'

const oauthIdp: Idp = {
    id: 'idp-oauth',
    type: 'oauth',
    issuer: 'https://issuer.example',
    configUrl: 'https://issuer.example/.well-known/openid-configuration',
}
const selfSignedIdp: Idp = {
    id: 'idp-signed',
    type: 'self_signed',
    issuer: 'https://self-signed.example',
}
const selfIssuedIdp: Idp = { id: 'idp-issued', type: 'self_issued' }
const idps = [oauthIdp, selfSignedIdp, selfIssuedIdp]

const network = (overrides: Partial<PublicNetwork>): PublicNetwork => ({
    id: 'net',
    name: 'Network',
    description: 'A network',
    authMethod: 'authorization_code',
    identityProviderId: 'idp-oauth',
    ledgerApi: 'https://ledger.example',
    ...overrides,
})

const oauthNetwork = network({ id: 'oauth', name: 'OAuth Network' })
const selfSignedNetwork = network({
    id: 'signed',
    name: 'Self-signed Network',
    identityProviderId: 'idp-signed',
    clientId: 'client-1',
})
const selfIssuedNetwork = network({
    id: 'issued',
    name: 'Self-issued Network',
    identityProviderId: 'idp-issued',
})
const clientCredentialsNetwork = network({
    id: 'cc',
    name: 'Client Credentials Network',
    authMethod: 'client_credentials',
})
const misconfiguredNetwork = network({
    id: 'misconfigured',
    name: 'Misconfigured Network',
    identityProviderId: 'missing',
})
const networks = [oauthNetwork, selfSignedNetwork, selfIssuedNetwork]

const meta = {
    title: 'LoginForm',
    component: LoginForm,
    parameters: { layout: 'fullscreen' },
    args: {
        networks,
        idps,
        onLoginConnect: fn(),
    },
} satisfies Meta<typeof LoginForm>

export default meta

type Story = StoryObj<typeof meta>

/** The event passed to the first onLoginConnect call */
const connectEvent = (onLoginConnect: Mock | undefined) =>
    onLoginConnect?.mock.calls[0]?.[0] as LoginConnectEvent

const networkSelect = (canvasElement: HTMLElement) =>
    findByShadowRole(canvasElement, 'combobox', { name: 'Select a network' })

const connectButton = (canvasElement: HTMLElement) =>
    findByShadowRole(canvasElement, 'button', { name: 'Connect' })

/** Selects a network by its visible name */
const chooseNetwork = async (
    canvasElement: HTMLElement,
    userEvent: {
        selectOptions: (el: Element, option: HTMLElement) => Promise<void>
    },
    name: string
) => {
    await userEvent.selectOptions(
        await networkSelect(canvasElement),
        await findByShadowRole(canvasElement, 'option', { name })
    )
}

export const Default: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        await expect(
            await findByShadowRole(canvasElement, 'heading', {
                name: 'Wallet Gateway',
            })
        ).toBeInTheDocument()
        await expect(
            await findByShadowAltText(canvasElement, 'Canton logo')
        ).toBeInTheDocument()

        // The first network is selected, and there are no extra fields for OAuth
        await expect(
            await findByShadowRole(canvasElement, 'option', {
                name: 'OAuth Network',
                selected: true,
            })
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(canvasElement, 'Selected: OAuth Network')
        ).toBeInTheDocument()
        await expect(
            queryByShadowLabelText(canvasElement, 'Username')
        ).not.toBeInTheDocument()
        await expect(
            queryByShadowLabelText(canvasElement, 'Client ID')
        ).not.toBeInTheDocument()

        await userEvent.click(await connectButton(canvasElement))
        await expect(args.onLoginConnect).toHaveBeenCalledOnce()
        const event = connectEvent(args.onLoginConnect)
        await expect(event.selectedNetwork).toEqual(oauthNetwork)
        await expect(event.selectedIdp).toEqual(oauthIdp)
        await expect(event.clientId).toBeUndefined()
        await expect(event.clientSecret).toBeUndefined()
        await expect(event.username).toBeUndefined()
    },
}

export const SelfSigned: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        await chooseNetwork(canvasElement, userEvent, 'Self-signed Network')

        // The client ID is prefilled from the network, the secret is masked
        const clientId = await findByShadowLabelText(canvasElement, 'Client ID')
        await expect(clientId).toHaveValue('client-1')
        const secret = await findByShadowLabelText(
            canvasElement,
            'Client Secret'
        )
        await expect(secret).toHaveAttribute('type', 'password')
        await expect(
            queryByShadowLabelText(canvasElement, 'Username')
        ).not.toBeInTheDocument()

        await userEvent.type(secret, 'network-secret')
        await userEvent.click(await connectButton(canvasElement))

        await expect(args.onLoginConnect).toHaveBeenCalledOnce()
        const event = connectEvent(args.onLoginConnect)
        await expect(event.selectedNetwork).toEqual(selfSignedNetwork)
        await expect(event.selectedIdp).toEqual(selfSignedIdp)
        await expect(event.clientId).toBe('client-1')
        await expect(event.clientSecret).toBe('network-secret')
        await expect(event.username).toBeUndefined()
    },
}

export const SelfSignedWithOtherClientId: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        await chooseNetwork(canvasElement, userEvent, 'Self-signed Network')
        const clientId = await findByShadowLabelText(canvasElement, 'Client ID')
        // userEvent.clear can't focus inputs inside shadow roots
        await userEvent.tripleClick(clientId)
        await userEvent.keyboard('{Backspace}')
        await userEvent.type(clientId, 'other-client')
        await userEvent.click(await connectButton(canvasElement))

        const event = connectEvent(args.onLoginConnect)
        await expect(event.clientId).toBe('other-client')
        await expect(event.clientSecret).toBe('')
    },
}

export const SelfSignedWithEmptyClientId: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        await chooseNetwork(canvasElement, userEvent, 'Self-signed Network')
        const clientId = await findByShadowLabelText(canvasElement, 'Client ID')
        // userEvent.clear can't focus inputs inside shadow roots
        await userEvent.tripleClick(clientId)
        await userEvent.keyboard('{Backspace}')
        await userEvent.click(await connectButton(canvasElement))

        // An empty client ID falls back to the network's
        const event = connectEvent(args.onLoginConnect)
        await expect(event.clientId).toBe('client-1')
    },
}

export const SelfIssued: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        await chooseNetwork(canvasElement, userEvent, 'Self-issued Network')
        const username = await findByShadowRole(canvasElement, 'textbox', {
            name: 'Username',
        })
        await expect(username).toBeRequired()
        await expect(
            queryByShadowLabelText(canvasElement, 'Client ID')
        ).not.toBeInTheDocument()
        await expect(
            queryByShadowLabelText(canvasElement, 'Client Secret')
        ).not.toBeInTheDocument()

        // Surrounding whitespace is trimmed, and Enter submits
        await userEvent.type(username, '  alice  {Enter}')
        await expect(args.onLoginConnect).toHaveBeenCalledOnce()
        const event = connectEvent(args.onLoginConnect)
        await expect(event.selectedNetwork).toEqual(selfIssuedNetwork)
        await expect(event.selectedIdp).toEqual(selfIssuedIdp)
        await expect(event.username).toBe('alice')
        await expect(event.clientId).toBeUndefined()
        await expect(event.clientSecret).toBeUndefined()
    },
}

export const SelfIssuedRequiresUsername: Story = {
    play: async ({ args, canvasElement, userEvent }) => {
        await chooseNetwork(canvasElement, userEvent, 'Self-issued Network')
        await userEvent.click(await connectButton(canvasElement))

        // The browser blocks submitting an empty required field
        await expect(args.onLoginConnect).not.toHaveBeenCalled()
        await expect(
            await findByShadowRole(canvasElement, 'textbox', {
                name: 'Username',
            })
        ).toBeInvalid()
    },
}

export const SelfIssuedOnboarding: Story = {
    args: {
        networks: [{ ...selfIssuedNetwork, authMethod: 'self_issued' }],
    },
    play: async ({ args, canvasElement, userEvent }) => {
        const username = await findByShadowRole(canvasElement, 'textbox', {
            name: 'Username',
        })
        await expect(
            queryByShadowLabelText(canvasElement, 'Client ID')
        ).not.toBeInTheDocument()
        await expect(
            queryByShadowLabelText(canvasElement, 'Client Secret')
        ).not.toBeInTheDocument()

        await userEvent.type(username, 'alice')
        await userEvent.click(await connectButton(canvasElement))

        const event = connectEvent(args.onLoginConnect)
        await expect(event.username).toBe('alice')
        await expect(event.clientId).toBeUndefined()
        await expect(event.clientSecret).toBeUndefined()
    },
}

export const SkipsClientCredentialsNetworks: Story = {
    args: { networks: [clientCredentialsNetwork, oauthNetwork] },
    play: async ({ args, canvasElement, userEvent }) => {
        // The first network that can be logged into is selected, not the first one
        await expect(
            await findByShadowRole(canvasElement, 'option', {
                name: 'OAuth Network',
                selected: true,
            })
        ).toBeInTheDocument()
        await expect(
            await findByShadowRole(canvasElement, 'option', {
                name: 'Client Credentials Network',
            })
        ).toBeDisabled()

        await userEvent.click(await connectButton(canvasElement))
        const event = connectEvent(args.onLoginConnect)
        await expect(event.selectedNetwork).toEqual(oauthNetwork)
        await expect(event.selectedIdp).toEqual(oauthIdp)
    },
}

export const NothingToSelect: Story = {
    args: { networks: [clientCredentialsNetwork] },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowText(
                canvasElement,
                'Choose a network to continue.'
            )
        ).toBeInTheDocument()
        await expect(
            await findByShadowRole(canvasElement, 'option', {
                name: 'Select network',
                selected: true,
            })
        ).toBeInTheDocument()
        await expect(await connectButton(canvasElement)).toBeDisabled()
    },
}

export const ChoosingNoNetwork: Story = {
    play: async ({ canvasElement, userEvent }) => {
        await chooseNetwork(canvasElement, userEvent, 'Select network')

        await expect(
            await findByShadowText(
                canvasElement,
                'Choose a network to continue.'
            )
        ).toBeInTheDocument()
        await expect(await connectButton(canvasElement)).toBeDisabled()
    },
}

export const MisconfiguredIdentityProvider: Story = {
    args: { networks: [misconfiguredNetwork, oauthNetwork] },
    play: async ({ args, canvasElement, userEvent }) => {
        await userEvent.click(await connectButton(canvasElement))

        const alert = await findByShadowRole(canvasElement, 'alert')
        await expect(alert).toHaveTextContent(
            'Identity provider misconfigured for this network.'
        )
        // The message replaces the "Selected" hint
        await expect(
            queryByShadowText(canvasElement, /^Selected:/)
        ).not.toBeInTheDocument()
        await expect(args.onLoginConnect).not.toHaveBeenCalled()

        // Choosing another network clears the message
        await chooseNetwork(canvasElement, userEvent, 'OAuth Network')
        await waitFor(() =>
            expect(
                queryByShadowRole(canvasElement, 'alert')
            ).not.toBeInTheDocument()
        )
        await expect(
            await findByShadowText(canvasElement, 'Selected: OAuth Network')
        ).toBeInTheDocument()
    },
}

export const IdentityProvidersArriveLate: Story = {
    render: (args) => {
        const [loadedIdps, setLoadedIdps] = useState<Idp[]>([])
        return (
            <>
                <LoginForm
                    {...args}
                    networks={[oauthNetwork]}
                    idps={loadedIdps}
                />
                <button type="button" onClick={() => setLoadedIdps(idps)}>
                    Load idps
                </button>
            </>
        )
    },
    play: async ({ args, canvasElement, userEvent }) => {
        // No identity provider yet: connecting is a misconfiguration
        await userEvent.click(await connectButton(canvasElement))
        await expect(
            await findByShadowRole(canvasElement, 'alert')
        ).toHaveTextContent('Identity provider misconfigured')

        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Load idps',
            })
        )
        await userEvent.click(await connectButton(canvasElement))
        await expect(args.onLoginConnect).toHaveBeenCalledOnce()
        await expect(connectEvent(args.onLoginConnect).selectedIdp).toEqual(
            oauthIdp
        )
    },
}

export const Loading: Story = {
    args: { networks: [], idps: [], loading: true },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowText(canvasElement, 'Loading networks...')
        ).toBeInTheDocument()
        await expect(await networkSelect(canvasElement)).toBeDisabled()
        await expect(await connectButton(canvasElement)).toBeDisabled()
    },
}

export const FinishesLoading: Story = {
    render: (args) => {
        const [loaded, setLoaded] = useState(false)
        return (
            <>
                <LoginForm
                    {...args}
                    networks={loaded ? networks : []}
                    idps={loaded ? idps : []}
                    loading={!loaded}
                />
                <button type="button" onClick={() => setLoaded(true)}>
                    Finish loading
                </button>
            </>
        )
    },
    play: async ({ canvasElement, userEvent }) => {
        await expect(await networkSelect(canvasElement)).toBeDisabled()
        await expect(await connectButton(canvasElement)).toBeDisabled()

        await userEvent.click(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Finish loading',
            })
        )

        await waitFor(async () =>
            expect(await networkSelect(canvasElement)).toBeEnabled()
        )
        await expect(await connectButton(canvasElement)).toBeEnabled()
        await expect(
            await findByShadowText(canvasElement, 'Selected: OAuth Network')
        ).toBeInTheDocument()
    },
}

export const Connecting: Story = {
    args: { networks: [selfSignedNetwork], connecting: true },
    play: async ({ canvasElement }) => {
        // Connecting locks the select, the credential fields and the button
        await expect(await networkSelect(canvasElement)).toBeDisabled()
        await expect(
            await findByShadowLabelText(canvasElement, 'Client ID')
        ).toBeDisabled()
        await expect(
            await findByShadowLabelText(canvasElement, 'Client Secret')
        ).toBeDisabled()
        await expect(
            await findByShadowRole(canvasElement, 'button', {
                name: 'Connecting…',
            })
        ).toBeDisabled()
    },
}

export const ConnectingSelfIssued: Story = {
    args: { networks: [selfIssuedNetwork], connecting: true },
    play: async ({ canvasElement }) => {
        await expect(
            await findByShadowRole(canvasElement, 'textbox', {
                name: 'Username',
            })
        ).toBeDisabled()
    },
}

export const KeepsSelectionAcrossRefetch: Story = {
    render: (args) => {
        const [current, setCurrent] = useState<PublicNetwork[]>(networks)
        return (
            <>
                <LoginForm {...args} networks={current} idps={idps} />
                <button
                    type="button"
                    onClick={() =>
                        setCurrent([
                            oauthNetwork,
                            { ...selfIssuedNetwork, name: 'Renamed Network' },
                        ])
                    }
                >
                    Refetch
                </button>
                <button
                    type="button"
                    onClick={() => setCurrent([oauthNetwork])}
                >
                    Drop selected
                </button>
                <button
                    type="button"
                    onClick={() => setCurrent([clientCredentialsNetwork])}
                >
                    Only client credentials
                </button>
                <button type="button" onClick={() => setCurrent([])}>
                    No networks
                </button>
            </>
        )
    },
    play: async ({ args, canvasElement, userEvent }) => {
        const clickButton = async (name: string) =>
            userEvent.click(
                await findByShadowRole(canvasElement, 'button', { name })
            )

        await chooseNetwork(canvasElement, userEvent, 'Self-issued Network')

        // Still selected after a refetch, now with the refreshed details
        await clickButton('Refetch')
        await expect(
            await findByShadowRole(canvasElement, 'option', {
                name: 'Renamed Network',
                selected: true,
            })
        ).toBeInTheDocument()
        await expect(
            await findByShadowText(canvasElement, 'Selected: Renamed Network')
        ).toBeInTheDocument()

        // Falls back to the first usable network when it disappears
        await clickButton('Drop selected')
        await expect(
            await findByShadowText(canvasElement, 'Selected: OAuth Network')
        ).toBeInTheDocument()
        await userEvent.click(await connectButton(canvasElement))
        await expect(connectEvent(args.onLoginConnect).selectedNetwork).toEqual(
            oauthNetwork
        )

        // Selects nothing when no network can be logged into
        await clickButton('Only client credentials')
        await expect(
            await findByShadowText(
                canvasElement,
                'Choose a network to continue.'
            )
        ).toBeInTheDocument()
        await expect(await connectButton(canvasElement)).toBeDisabled()

        await clickButton('No networks')
        await waitFor(() =>
            expect(
                queryByShadowRole(canvasElement, 'option', {
                    name: 'Client Credentials Network',
                })
            ).not.toBeInTheDocument()
        )
        await expect(
            await findByShadowText(
                canvasElement,
                'Choose a network to continue.'
            )
        ).toBeInTheDocument()
        await expect(await connectButton(canvasElement)).toBeDisabled()
    },
}
