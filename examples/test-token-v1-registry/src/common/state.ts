// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { SDKInterface } from '@canton-network/wallet-sdk'
import defaultSdk from './defaultSdk'

export interface RegistryConfig {
    sdk: SDKInterface
    synchronizerIds: {
        transferInstruction: string
        allocationInstruction: string
    }
    operator: {
        party: string
        keys: ReturnType<SDKInterface['keys']['generate']>
    }
    port: number
}

export const defaultConfig: RegistryConfig = {
    sdk: defaultSdk,
    synchronizerIds: {
        transferInstruction: '',
        allocationInstruction: '',
    },
    operator: {
        party: '',
        keys: defaultSdk.keys.generate(),
    },
    port: 5634,
} as const

export class RegistryState implements RegistryConfig {
    protected constructor(private config: Partial<RegistryConfig>) {
        Object.assign(this, defaultConfig, config)
    }
    sdk!: RegistryConfig['sdk']
    synchronizerIds!: RegistryConfig['synchronizerIds']
    operator!: RegistryConfig['operator']
    port!: RegistryConfig['port']

    private static _instance: RegistryState | null = null

    public static get instance() {
        if (!this._instance) throw new Error('must be instantiated first')
        return this._instance
    }

    public static async instantiate(config: Partial<RegistryConfig>) {
        this._instance = new RegistryState(config)
        if (!config.operator?.party) {
            await this._instance.sdk.party.external
                .create(this._instance.operator.keys.publicKey, {
                    partyHint: 'operator',
                })
                .sign(this._instance.operator.keys.privateKey)
                .execute()
        }
    }

    public reset() {
        Object.assign(this, defaultConfig)
    }
}
