// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    type DocsPage,
    docsUrl,
    type NetworkFormDocsUrls,
} from '@canton-network/core-wallet-ui-components'
import type { ToastDescriptor } from '@canton-network/core-wallet-ui-components/logic'

export const DEFAULT_PAGE_REDIRECT = '/parties'
export const NOT_FOUND_PAGE_REDIRECT = '/404'
export const LOGIN_PAGE_REDIRECT = '/login'
export const ACTIVITIES_PAGE_REDIRECT = '/activities'
export const NETWORKS_PAGE_REDIRECT = '/networks'
export const IDENTITY_PROVIDERS_PAGE_REDIRECT = '/identity-providers'

/** Set on the login page's URL when an open page logged the user out */
export const SESSION_EXPIRED_PARAM = 'sessionExpired'
export const SESSION_EXPIRED_TOAST: ToastDescriptor = {
    title: 'Session expired',
    message: 'Your session has ended. Log in again to continue.',
    type: 'info',
}

export const TOKEN_EXPIRED_SKEW_MS = 5000
// UI sets timeout to trigger logout when token expires. It needs capping, because setTimeout stops delaying if timeout exceed ~24 days (unsigned 32bit in ms)
export const TOKEN_EXPIRATION_TIMEOUT_LIMIT_MS = 24 * 60 * 60 * 1000

const NETWORKS_AND_IDENTITY_DOCS: DocsPage =
    'docs/wallet-gateway/operate/networks-and-identity.mdx'
const PARTIES_DOCS: DocsPage = 'docs/wallet-gateway/use/party-management.mdx'

export const NETWORKS_DOCS_URL = docsUrl(NETWORKS_AND_IDENTITY_DOCS, 'networks')
export const IDENTITY_PROVIDERS_DOCS_URL = docsUrl(
    NETWORKS_AND_IDENTITY_DOCS,
    'identity-providers'
)
export const NETWORK_FORM_DOCS_URLS: NetworkFormDocsUrls = {
    auth: docsUrl(NETWORKS_AND_IDENTITY_DOCS, 'authentication-methods'),
    adminAuth: docsUrl(NETWORKS_AND_IDENTITY_DOCS, 'auth-vs-adminauth'),
    serviceAccountAuth: docsUrl(
        NETWORKS_AND_IDENTITY_DOCS,
        'service-account-automation-serviceaccountauth'
    ),
}
export const PARTIES_DOCS_URL = docsUrl(PARTIES_DOCS)
export const LOGIN_DOCS_URL = docsUrl(PARTIES_DOCS, 'log-in')
export const CREATE_PARTY_DOCS_URL = docsUrl(PARTIES_DOCS, 'create-a-party')
export const EDIT_PARTY_DOCS_URL = docsUrl(
    PARTIES_DOCS,
    'change-the-signing-key-of-a-wallet'
)
export const ACTIVITIES_DOCS_URL = docsUrl(PARTIES_DOCS, 'view-activities')
export const API_KEYS_DOCS_URL = docsUrl(
    'docs/wallet-gateway/automation/service-account-automations.mdx'
)
export const ADMIN_DOCS_URL = docsUrl(
    'docs/wallet-gateway/operate/configure.mdx',
    'administration-page'
)
export const SELF_ISSUED_LOGIN_DOCS_URL = docsUrl(
    'docs/wallet-gateway/operate/self-issued-authentication.mdx',
    'wallet-gateway-ui'
)
export const APPROVE_DOCS_URL = docsUrl(
    'docs/wallet-gateway/use/approve-and-sign.mdx'
)

export const LOGIN_INFO =
    'Pick the network to log in to. Its identity provider decides how you log in. The Wallet Gateway operator configures which networks you can choose.'
export const NETWORKS_INFO =
    'A network is a Canton validator that users can connect to through this Wallet Gateway.'
export const IDENTITY_PROVIDERS_INFO =
    'An identity provider (IDP) decides how users log in to a network: through OIDC, by signing their own token with their party (self-issued), or with self-signed tokens, which are for testing only.'
export const API_KEYS_INFO =
    'API keys let your backend services submit transactions without someone approving each one. A key only works on the network you were connected to when you generated it.'
export const APPROVE_INFO =
    'Shows what a transaction does. Pending ones wait for you to approve or reject them.'
export const SIGN_MESSAGE_INFO =
    "A message that a dApp asked you to sign with your party's key. Signing doesn't submit a transaction."
