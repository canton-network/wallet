// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO should I just put the validation in mergeScopes method and and throw rpcErrors.invalidParams in controller on any error? Or maybe import rpcErrors here?
/**
 * Joins the network's scope with the scopes requested by a dApp into one
 * space-separated scope claim, without duplicates.
 * Validate the result with {@link findInvalidScope} before proceeding.
 */
export function mergeScopes(
    networkScope: string,
    scopes: string[] = []
): string {
    return [
        ...new Set([
            ...networkScope.split(/\s+/),
            ...scopes.map((scope) => scope.trim()),
        ]),
    ]
        .filter(Boolean)
        .join(' ')
}

// Returns the first requested scope with whitespace inside, which would sneak in several scopes as one
export function findInvalidScope(scopes: string[] = []): string | undefined {
    return scopes.map((scope) => scope.trim()).find((scope) => /\s/.test(scope))
}
