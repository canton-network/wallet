// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readDescriptorTemplate } from '@canton-network/core-tx-clear-signing'

import { detectCurrentOrigin } from './listeners.ts'
import { createUserClient } from './rpc-client.ts'
import { stateManager } from './state-manager.ts'

async function userClient() {
    const origin = await detectCurrentOrigin()
    const token = await stateManager.accessToken.get(origin)
    return createUserClient(token)
}

/** The descriptor JSON text stored for the logged-in user. A new user has none. */
export async function listDescriptors(): Promise<string[]> {
    const client = await userClient()
    const result = await client.request({
        method: 'listClearSigningDescriptors',
    })
    return result.descriptors
}

/**
 * Stores a descriptor for the logged-in user. An earlier one for the same
 * package, module and entity is replaced. `text` is sent unchanged.
 */
export async function addDescriptor(text: string): Promise<string> {
    const client = await userClient()
    const result = await client.request({
        method: 'setClearSigningDescriptor',
        params: { descriptor: text },
    })
    return result.descriptor
}

/**
 * Removes the stored descriptor whose text is `text`. The template is read leniently, so a row stored
 * before the parser tightened can still be removed.
 */
export async function removeDescriptor(text: string): Promise<void> {
    const template = readDescriptorTemplate(text)
    if (!template) {
        throw new Error('the descriptor does not name a template')
    }
    const client = await userClient()
    await client.request({
        method: 'removeClearSigningDescriptor',
        params: template,
    })
}
