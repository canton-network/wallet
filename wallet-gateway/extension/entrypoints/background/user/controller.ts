// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import buildController from './rpc-gen/index.js'
import type { Store, Network } from '@canton-network/core-wallet-store'
import {
    AddSessionParams,
    PublicNetwork,
    Network as ApiNetwork,
    Auth,
    Status,
    UserLevelRight,
} from './rpc-gen/typings.js'

interface UserControllerParams {
    store: Store
}

function toAuthDto(auth: Auth): ApiNetwork['auth'] {
    const base = {
        method: auth.method,
        audience: auth.audience,
        scope: auth.scope,
        clientId: auth.clientId,
    }

    if (auth.method === 'self_signed') {
        return {
            ...base,
            issuer: auth.issuer,
            clientSecret: auth.clientSecret,
        }
    }

    if (auth.method === 'client_credentials') {
        return {
            ...base,
            clientSecret: auth.clientSecret,
        }
    }

    return base
}

function toNetworkDto(network: Network): ApiNetwork {
    return {
        id: network.id,
        name: network.name,
        description: network.description,
        synchronizerId: network.synchronizerId,
        identityProviderId: network.identityProviderId,
        ledgerApi: network.ledgerApi.baseUrl,
        auth: toAuthDto(network.auth),
        ...(network.adminAuth
            ? { adminAuth: toAuthDto(network.adminAuth) }
            : {}),
        ...(network.serviceAccountAuth
            ? { serviceAccountAuth: toAuthDto(network.serviceAccountAuth) }
            : {}),
    }
}

function toPublicNetwork(network: Network): PublicNetwork {
    const auth = network.auth

    return {
        id: network.id,
        name: network.name,
        description: network.description,
        synchronizerId: network.synchronizerId,
        identityProviderId: network.identityProviderId,
        ledgerApi: network.ledgerApi.baseUrl,
        authMethod: auth.method,
        ...(auth.method !== 'client_credentials' && {
            clientId: auth.clientId,
            scope: auth.scope,
            audience: auth.audience,
        }),
    }
}

export const userController = (getParams: Promise<UserControllerParams>) =>
    buildController({
        addNetwork: async () => {
            throw new Error('Function addNetwork not implemented.')
        },
        removeNetwork: async () => {
            throw new Error('Function removeNetwork not implemented.')
        },
        listNetworks: async () => {
            const { store } = await getParams
            const networks = await store.listNetworks()
            return { networks: networks.map(toPublicNetwork) }
        },
        getNetwork: async () => {
            throw new Error('Function getNetwork not implemented.')
        },
        selfSignedAccessToken: async () => {
            throw new Error('Function selfSignedAccessToken not implemented.')
        },
        addIdp: async () => {
            throw new Error('Function addIdp not implemented.')
        },
        removeIdp: async () => {
            throw new Error('Function removeIdp not implemented.')
        },
        listIdps: async () => {
            const { store } = await getParams
            return { idps: await store.listIdps() }
        },
        createWallet: async () => {
            throw new Error('Function createWallet not implemented.')
        },
        allocatePartyForWallet: async () => {
            throw new Error('Function allocatePartyForWallet not implemented.')
        },
        setPrimaryWallet: async () => {
            throw new Error('Function setPrimaryWallet not implemented.')
        },
        removeWallet: async () => {
            throw new Error('Function removeWallet not implemented.')
        },
        listWallets: async (params: {
            filter?: { signingProviderIds?: string[] }
        }) => {
            const { store } = await getParams
            return await store.getWallets(params.filter)
        },
        syncWallets: async () => {
            throw new Error('Function syncWallets not implemented.')
        },
        isWalletSyncNeeded: async () => {
            throw new Error('Function isWalletSyncNeeded not implemented.')
        },
        sign: async () => {
            throw new Error('Function sign not implemented.')
        },
        signMessage: async () => {
            throw new Error('Function signMessage not implemented.')
        },
        getMessageToSign: async () => {
            throw new Error('Function getMessageToSign not implemented.')
        },
        listMessagesToSign: async () => {
            throw new Error('Function listMessagesToSign not implemented.')
        },
        deleteMessageToSign: async () => {
            throw new Error('Function deleteMessageToSign not implemented.')
        },
        execute: async () => {
            throw new Error('Function execute not implemented.')
        },
        addSession: async (params: AddSessionParams) => {
            const { store } = await getParams
            const newSessionId = crypto.randomUUID()

            logger.info(
                `Adding session with ID ${newSessionId} for network ${params.networkId}`
            )

            const network = await store.getNetwork(params.networkId)
            const idp = await store.getIdp(network.identityProviderId)
            // assertTokenClaimsMatchNetwork(accessToken, network, idp)

            await store.setSession({
                id: newSessionId,
                origin: params.origin,
                network: params.networkId,
                accessToken: HARDCODED_ACCESS_TOKEN,
            })

            // TODO: fill in
            const status = {} as Status
            const rights = {} as UserLevelRight

            return {
                id: newSessionId,
                network: toNetworkDto(network),
                idp,
                accessToken: HARDCODED_ACCESS_TOKEN,
                status,
                rights,
            }
        },
        removeSession: async () => {
            throw new Error('Function removeSession not implemented.')
        },
        listSessions: async () => {
            throw new Error('Function listSessions not implemented.')
        },
        getTransaction: async () => {
            throw new Error('Function getTransaction not implemented.')
        },
        listTransactions: async () => {
            throw new Error('Function listTransactions not implemented.')
        },
        deleteTransaction: async () => {
            throw new Error('Function deleteTransaction not implemented.')
        },
        getUser: async () => {
            throw new Error('Function getUser not implemented.')
        },
        generateApiKey: async () => {
            throw new Error('Function generateApiKey not implemented.')
        },
        listApiKeys: async () => {
            throw new Error('Function listApiKeys not implemented.')
        },
        removeApiKey: async () => {
            throw new Error('Function removeApiKey not implemented.')
        },
        listSigningProviderVaults: async () => {
            throw new Error(
                'Function listSigningProviderVaults not implemented.'
            )
        },
    })
