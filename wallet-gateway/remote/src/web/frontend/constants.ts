// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const DEFAULT_PAGE_REDIRECT = '/parties'
export const NOT_FOUND_PAGE_REDIRECT = '/404'
export const LOGIN_PAGE_REDIRECT = '/login'
export const ACTIVITIES_PAGE_REDIRECT = '/activities'
export const NETWORKS_PAGE_REDIRECT = '/networks'
export const IDENTITY_PROVIDERS_PAGE_REDIRECT = '/identity-providers'

export const SESSION_EXPIRED_TOAST = {
    title: 'Session expired',
    message: 'Your session has ended. Log in again to continue.',
    type: 'info',
} as const

export const TOKEN_EXPIRED_SKEW_MS = 5000
// UI sets timeout to trigger logout when token expires. It needs capping, because setTimeout stops delaying if timeout exceed ~24 days (unsigned 32bit in ms)
export const TOKEN_EXPIRATION_TIMEOUT_LIMIT_MS = 24 * 60 * 60 * 1000

const WALLET_GATEWAY_DOCS_URL =
    'https://docs.canton.network/integrations/wallet-gateway'
const NETWORKS_AND_IDENTITY_DOCS_URL = `${WALLET_GATEWAY_DOCS_URL}/operate/networks-and-identity`
export const NETWORKS_DOCS_URL = `${NETWORKS_AND_IDENTITY_DOCS_URL}#networks`
export const IDENTITY_PROVIDERS_DOCS_URL = `${NETWORKS_AND_IDENTITY_DOCS_URL}#identity-providers`
export const PARTIES_DOCS_URL = `${WALLET_GATEWAY_DOCS_URL}/use/party-management`
export const ACTIVITIES_DOCS_URL = `${PARTIES_DOCS_URL}#view-activities`
export const API_KEYS_DOCS_URL = `${WALLET_GATEWAY_DOCS_URL}/automation/service-account-automations`
export const ADMIN_DOCS_URL = `${WALLET_GATEWAY_DOCS_URL}/operate/configure#administration-page`
