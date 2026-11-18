// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Descriptor } from '@canton-network/core-tx-clear-signing'
import { templateIdOf } from '@canton-network/core-wallet-services/clear-signing'

import { detectCurrentOrigin } from './listeners.ts'
import { createUserClient } from './rpc-client.ts'
import { stateManager } from './state-manager.ts'

export type { Descriptor }

async function userClient() {
    const origin = await detectCurrentOrigin()
    const token = await stateManager.accessToken.get(origin)
    return createUserClient(token)
}

/** The descriptors stored for the logged-in user. A new user has none. */
export async function listDescriptors(): Promise<Descriptor[]> {
    const client = await userClient()
    const result = await client.request({
        method: 'listClearSigningDescriptors',
    })
    return result.descriptors as Descriptor[]
}

/**
 * Stores a descriptor for the logged-in user. An earlier one for the same
 * package, module and entity is replaced.
 *
 * @throws Error when the JSON does not name a template
 */
export async function addDescriptor(json: unknown): Promise<Descriptor> {
    templateIdOf(json)
    const client = await userClient()
    const result = await client.request({
        method: 'setClearSigningDescriptor',
        params: { descriptor: json as Descriptor },
    })
    return result.descriptor as Descriptor
}

export async function removeDescriptor(descriptor: Descriptor): Promise<void> {
    const template = templateIdOf(descriptor)
    const client = await userClient()
    await client.request({
        method: 'removeClearSigningDescriptor',
        params: template,
    })
}
