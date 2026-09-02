// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { browser } from 'wxt/browser'
import { storage } from 'wxt/utils/storage'

export interface ApprovalRequest {
    transactionId: string
    commandId: string
}

const approvalRequests = storage.defineItem<ApprovalRequest[]>(
    'session:approvalRequests',
    { fallback: [] }
)

async function updateActionBadge(requests: ApprovalRequest[]): Promise<void> {
    const count = requests.length
    await Promise.allSettled([
        browser.action.setBadgeText({
            text: count === 0 ? '' : `${Math.min(count, 9)}`,
        }),
        browser.action.setTitle({
            title:
                count === 0
                    ? 'Canton Wallet'
                    : `${count} transaction${count === 1 ? '' : 's'} awaiting review`,
        }),
    ])
}

export async function enqueueApprovalRequest(
    request: ApprovalRequest
): Promise<void> {
    const requests = await approvalRequests.getValue()
    if (
        !requests.some(
            (candidate) => candidate.transactionId === request.transactionId
        )
    ) {
        requests.push(request)
        await approvalRequests.setValue(requests)
    }
    await updateActionBadge(requests)
}

export async function consumeNextApprovalRequest(): Promise<
    ApprovalRequest | undefined
> {
    const requests = await approvalRequests.getValue()
    const [nextRequest, ...remainingRequests] = requests

    if (nextRequest) {
        await approvalRequests.setValue(remainingRequests)
    }
    await updateActionBadge(remainingRequests)

    return nextRequest
}
