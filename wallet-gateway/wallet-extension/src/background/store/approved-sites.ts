// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Vault } from '../vault'

/** Approved site origins by principal, see `sitePrincipal`. */
type ApprovedSites = Record<string, string[]>

/**
 * Who site approvals belong to: the access token's issuer and subject. A
 * subject is only unique within its issuer, and the extension signs in
 * through several identity providers. Undefined for a token without both
 * claims, which then can't hold approvals.
 */
export function sitePrincipal(accessToken: string): string | undefined {
    let claims: unknown
    try {
        const payload = accessToken.split('.')[1]!
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
        const bytes = Uint8Array.from(atob(base64), (char) =>
            char.charCodeAt(0)
        )
        claims = JSON.parse(new TextDecoder().decode(bytes))
    } catch {
        return undefined
    }
    if (typeof claims !== 'object' || claims === null) return undefined
    const { iss, sub } = claims as { iss?: unknown; sub?: unknown }
    if (typeof iss !== 'string' || typeof sub !== 'string') return undefined
    if (iss === '' || sub === '') return undefined
    return JSON.stringify([iss, sub])
}

/**
 * The sites each principal allowed to use the dApp API. Not per network: an
 * approval holds on every network the principal signs in to. Every method
 * throws `VaultLockedError` while the vault is locked.
 */
export interface ApprovedSiteStore {
    isApproved(principal: string, origin: string): Promise<boolean>
    approve(principal: string, origin: string): Promise<void>
    revoke(principal: string, origin: string): Promise<void>
}

/** Keeps the approved sites in the vault item `approvedSites`. */
export function createApprovedSiteStore(
    vault: Pick<Vault, 'defineItem'>
): ApprovedSiteStore {
    const item = vault.defineItem<ApprovedSites>('approvedSites', {
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
