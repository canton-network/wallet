// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const ALLOWED_ROUTES = [
    '/api-keys/add',
    '/api-keys',
    '/login',
    '/parties/add',
    '/parties',
    '/wallets',
    '/settings',
    '/networks/add',
    '/networks/review',
    '/networks',
    '/identity-providers/add',
    '/identity-providers/review',
    '/identity-providers',
    '/activities',
    '/approve',
    '/sign-message',
    '/',
    '/404',
    '/callback',
] as const

export type AllowedRoute = (typeof ALLOWED_ROUTES)[number]

export function isAllowedRoute(path: string): path is AllowedRoute {
    return ALLOWED_ROUTES.includes(path as (typeof ALLOWED_ROUTES)[number])
}

// 1. Map legacy conceptual routes to actual WXT HTML files
const ROUTE_TO_HTML_MAP: Record<AllowedRoute, string> = {
    '/api-keys/add': '/api-keys-add.html',
    '/api-keys': '/api-keys.html',
    '/login': '/login.html',
    '/parties/add': '/parties-add.html',
    '/parties': '/parties.html',
    '/wallets': '/wallets.html',
    '/settings': '/settings.html',
    '/networks/add': '/networks-add.html',
    '/networks/review': '/networks-review.html',
    '/networks': '/networks.html',
    '/identity-providers/add': '/identity-providers-add.html',
    '/identity-providers/review': '/identity-providers-review.html',
    '/identity-providers': '/identity-providers.html',
    '/activities': '/activities.html',
    '/approve': '/approve.html',
    '/sign-message': '/sign-message.html',
    '/': '/popup.html', // Assumes your root entrypoint is entrypoints/popup/index.html
    '/404': '/404.html',
    '/callback': '/callback.html',
}

// 2. Reverse map to detect the route from the browser's current HTML file
const HTML_TO_ROUTE_MAP = Object.fromEntries(
    Object.entries(ROUTE_TO_HTML_MAP).map(([route, html]) => [
        html,
        route as AllowedRoute,
    ])
)

/**
 * Normalizes an incoming path string by stripping trailing slashes
 * so it matches the ALLOWED_ROUTES format.
 */
function normalizeRouteInput(path: string): string {
    if (!path || path === '/') return '/'
    return path.replace(/\/+$/, '')
}

/**
 * Reads the current physical HTML file (e.g., "/parties-add.html")
 * and returns the legacy AllowedRoute (e.g., "/parties/add")
 */
export function getCurrentRoute(
    pathname: string = window.location.pathname
): AllowedRoute | null {
    // pathname in an extension starts with a slash, e.g., "/parties-add.html"
    return HTML_TO_ROUTE_MAP[pathname] || null
}

/**
 * Translates a legacy path (e.g., "/parties/add/" or "/parties/add")
 * into the physical extension HTML file path.
 */
export function toRelPath(path: string): string {
    const normalized = normalizeRouteInput(path)

    if (isAllowedRoute(normalized)) {
        return ROUTE_TO_HTML_MAP[normalized]
    }

    // Fallback for non-route strings (like image assets or unrecognized paths)
    return normalized
}

/**
 * Convenience wrapper for AllowedRoutes.
 */
export function toRelHref(route: AllowedRoute): string {
    return ROUTE_TO_HTML_MAP[route] || '/404.html'
}
