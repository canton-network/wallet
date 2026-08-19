// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Disabled unused vars rule to allow for future implementations
/* eslint-disable @typescript-eslint/no-unused-vars */

import buildController from './rpc-gen/index.js'
import { type Store } from '@canton-network/core-wallet-store'

export const userController = (store: Store) =>
    buildController({
        addNetwork: async () => {
            throw new Error('Function addNetwork not implemented.')
        },
        removeNetwork: async () => {
            throw new Error('Function removeNetwork not implemented.')
        },
        listNetworks: async () => {
            throw new Error('Function listNetworks not implemented.')
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
            throw new Error('Function listIdps not implemented.')
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
        listWallets: async () => {
            throw new Error('Function listWallets not implemented.')
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
        addSession: async () => {
            throw new Error('Function addSession not implemented.')
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
