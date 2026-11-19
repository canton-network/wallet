// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineExtensionMessaging } from '@webext-core/messaging'
import { browser } from 'wxt/browser'

/**
 * The origin the extension pages connect as, e.g.
 * `chrome-extension://<id>`. popup.html, app.html and the background share
 * it, so they all see the same session. Built from `getURL` because the URL
 * standard gives non-web schemes an opaque origin (`"null"`).
 */
export const EXTENSION_ORIGIN = browser.runtime.getURL('/').replace(/\/$/, '')

/**
 * Whether the extension pages are connected to a network: a signed-in user
 * whose token hasn't expired, with a session for {@link EXTENSION_ORIGIN}.
 */
export type ConnectionStatus = 'connected' | 'disconnected'

/** Messages the extension pages send to the background's auth service. */
export interface AuthProtocol {
    'auth.getStatus'(): ConnectionStatus
    /**
     * Signs in to the network's identity provider, stores the token as the
     * auth context and adds the extension's session. The token never leaves
     * the background.
     */
    'auth.connect'(data: { networkId: string }): void
}

export const authMessenger = defineExtensionMessaging<AuthProtocol>()

/**
 * `error.name` of the errors `auth.connect` throws on top of the vault's.
 * Messaging rebuilds errors as plain `Error`s, so compare names.
 */
export const AuthErrorName = {
    /** The network's auth method or identity provider isn't supported yet. */
    UnsupportedAuthMethod: 'UnsupportedAuthMethodError',
    /** The user closed the sign-in window or the IdP refused the request. */
    SignInFailed: 'SignInFailedError',
} as const

export type AuthErrorName = (typeof AuthErrorName)[keyof typeof AuthErrorName]
