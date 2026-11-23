// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SignedInContext } from '../auth-context.ts'
import type { Vault } from '../vault/index.ts'

/** Approved site origins by principal, see `sitePrincipal`. */
type ApprovedSites = Record<string, string[]>

/**
 * Who site approvals belong to: the configured identity provider the user
 * signed in through, plus the user's subject. The provider is the one the
 * extension recorded at sign-in, not the token's issuer claim, which any
 * configured provider could set, nor the session's network, which can be
 * changed after sign-in. Undefined for a context stored before the provider
 * was recorded, so it matches no approval.
 */
export function sitePrincipal(context: SignedInContext): string | undefined {
    if (context.identityProviderId === undefined) return undefined
    return JSON.stringify([context.identityProviderId, context.userId])
}

/**
 * The sites each principal allowed to use the dApp API. Not per network: an
 * approval holds on every network of the same identity provider. Every method
 * throws `VaultLockedError` while the vault is locked.
 */
export interface ApprovedSiteStore {
    isApproved(principal: string, origin: string): Promise<boolean>
    approve(principal: string, origin: string): Promise<void>
    revoke(principal: string, origin: string): Promise<void>
}

/**
 * Keeps the approved sites in the vault item `approvedSitesV2`. The old
 * `approvedSites` item was keyed by the token's issuer claim and is ignored.
 */
export function createApprovedSiteStore(
    vault: Pick<Vault, 'defineItem'>
): ApprovedSiteStore {
    const item = vault.defineItem<ApprovedSites>('approvedSitesV2', {
        fallback: {},
    })
    const originsOf = (sites: ApprovedSites, principal: string): string[] => {
        const origins = Object.hasOwn(sites, principal)
            ? sites[principal]
            : undefined
        return Array.isArray(origins) ? origins : []
    }
    return {
        async isApproved(principal, origin) {
            return originsOf(await item.getValue(), principal).includes(origin)
        },
        async approve(principal, origin) {
            await item.update((sites) => {
                const origins = originsOf(sites, principal)
                return origins.includes(origin)
                    ? sites
                    : { ...sites, [principal]: [...origins, origin] }
            })
        },
        async revoke(principal, origin) {
            // Every write re-encrypts the vault, so skip one that changes nothing.
            if (!originsOf(await item.getValue(), principal).includes(origin)) {
                return
            }
            await item.update((sites) => ({
                ...sites,
                [principal]: originsOf(sites, principal).filter(
                    (site) => site !== origin
                ),
            }))
        },
    }
}
