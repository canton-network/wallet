// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    providerErrors,
    rpcErrors,
    toJsonRpcError,
} from '@canton-network/core-rpc-errors'
import type {
    JsonRpcRequest,
    JsonRpcResponse,
} from '@canton-network/core-types'

import { logger } from '@/shared/logger.ts'

import type { AuthContextStore } from '../../auth-context.ts'
import { sitePrincipal } from '../../store/approved-sites.ts'
import { type VaultLockState, VaultLockedError } from '../../vault/index.ts'
import {
    dappController,
    type DappControllerDeps,
    type DappRequestContext,
} from './controller.ts'

/**
 * The single entry point of the dApp API. It always resolves to a JSON-RPC
 * response. `origin` and `tab` come from the browser's sender information,
 * see `registerDappService`.
 */
export interface DappDispatcher {
    request(
        request: JsonRpcRequest,
        origin: DappRequestContext['origin'],
        tab?: DappRequestContext['tab']
    ): Promise<JsonRpcResponse>
}

/** What the content script calls. The background adds the origin. */
export interface DappService {
    request(request: JsonRpcRequest): Promise<JsonRpcResponse>
}

/** What a site the user hasn't approved may call. */
const OPEN_METHODS = new Set(['connect', 'isConnected', 'disconnect', 'status'])

/**
 * Answers dApp requests: resolves who each one acts for and whether the user
 * approved the requesting site, like the remote's auth middleware, then
 * hands it to the controller.
 */
export function createDappDispatcher(
    deps: DappControllerDeps,
    vault: VaultLockState,
    authContext: AuthContextStore
): DappDispatcher {
    /** While the vault isn't unlocked, there's no signed-in user. */
    async function requestContext(
        origin: DappRequestContext['origin'],
        tab: DappRequestContext['tab']
    ): Promise<DappRequestContext> {
        // Wait for the restore, so a request that wakes the background
        // isn't refused while the vault is still unlocking.
        await vault.ready
        if (vault.status() === 'unlocked') {
            try {
                const auth = await authContext.load()
                const principal = auth && sitePrincipal(auth)
                const approved =
                    principal !== undefined &&
                    (await deps.sites.isApproved(principal, origin))
                return {
                    origin,
                    tab,
                    locked: false,
                    auth,
                    principal,
                    approved,
                }
            } catch (error) {
                // A lock() landed after the status check.
                if (!(error instanceof VaultLockedError)) throw error
            }
        }
        return {
            origin,
            tab,
            locked: true,
            auth: undefined,
            principal: undefined,
            approved: false,
        }
    }

    function notApproved({ locked, auth }: DappRequestContext) {
        return providerErrors.unauthorized({
            message: locked
                ? 'Wallet is locked'
                : auth
                  ? 'The user has not approved this site. Call connect first.'
                  : 'User is not connected',
        })
    }

    return {
        async request(request, origin, tab) {
            const id = request.id ?? null
            try {
                const context = await requestContext(origin, tab)
                const controller = dappController(deps, context)

                // Only the controller's own methods: never `constructor`,
                // `toString` or anything else on the prototype chain.
                if (!Object.hasOwn(controller, request.method)) {
                    return {
                        jsonrpc: '2.0',
                        id,
                        error: rpcErrors
                            .methodNotFound({
                                message: `Method ${request.method} not found`,
                            })
                            .serialize(),
                    }
                }

                if (!context.approved && !OPEN_METHODS.has(request.method)) {
                    throw notApproved(context)
                }

                const method = controller[
                    request.method as keyof typeof controller
                ] as (params: unknown) => Promise<unknown>
                return {
                    jsonrpc: '2.0',
                    id,
                    result: await method(request.params),
                }
            } catch (error) {
                logger.warn('dApp method {method} failed: {error}', {
                    method: request.method,
                    error,
                })
                return {
                    jsonrpc: '2.0',
                    id,
                    error: toJsonRpcError(error).serialize(),
                }
            }
        },
    }
}
