// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { DappNotificationEvent } from '@canton-network/core-wallet-services'

/**
 * Name of the `runtime.Port` the content script opens to the background script
 * to receive dApp notifications (CIP-103 events).
 */
export const NOTIFICATIONS_PORT_NAME = 'wg-dapp-notifications'

/**
 * A notification sent from the background script to the content script over the
 * notifications port. The content script relays it to the dApp page as an
 * id-less JSON-RPC request (a JSON-RPC notification).
 */
export interface NotificationPortMessage {
    method: DappNotificationEvent
    params?: unknown
}

const SITE_APPROVAL_PORT_PREFIX = 'wg-site-approval:'

/**
 * Name of the `runtime.Port` the site approval page holds open for its
 * request. The background disconnects it to make the page close.
 */
export const siteApprovalPortName = (id: string) =>
    `${SITE_APPROVAL_PORT_PREFIX}${id}`

/** The request ID of a site approval port, or undefined for another port. */
export const siteApprovalPortId = (name: string) =>
    name.startsWith(SITE_APPROVAL_PORT_PREFIX)
        ? name.slice(SITE_APPROVAL_PORT_PREFIX.length)
        : undefined

const TX_APPROVAL_PORT_PREFIX = 'wg-tx-approval:'

/**
 * Name of the `runtime.Port` the transaction approval page holds open for
 * its transaction. The background disconnects it to make the page close.
 */
export const txApprovalPortName = (transactionId: string) =>
    `${TX_APPROVAL_PORT_PREFIX}${transactionId}`

/** The transaction ID of a transaction approval port, or undefined. */
export const txApprovalPortId = (name: string) =>
    name.startsWith(TX_APPROVAL_PORT_PREFIX)
        ? name.slice(TX_APPROVAL_PORT_PREFIX.length)
        : undefined

/**
 * Name of the `runtime.Port` the content script holds open while its page is
 * loaded. The background ends the page's prompts when it disconnects.
 */
export const PAGE_PRESENCE_PORT_NAME = 'wg-page-presence'

/**
 * What the background tells a presence port: whether the background holds a
 * prompt for the tab, during which the content script sends a heartbeat.
 */
export interface PresenceHeartbeat {
    heartbeat: boolean
}

/**
 * How often a content script sends its heartbeat. Chrome stops an idle
 * service worker after 30 seconds, and a port message resets that timer.
 */
export const PRESENCE_HEARTBEAT_MS = 20_000
