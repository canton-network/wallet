// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { browser } from 'wxt/browser'
import { consumeNextApprovalRequest } from '@/utils/approval-requests.js'

async function initializePopup(): Promise<void> {
    let approvalRequest
    try {
        approvalRequest = await consumeNextApprovalRequest()
    } catch (error) {
        logger.error('Failed to load approval requests: {*}', { error })
    }

    if (approvalRequest) {
        const approvalUrl = new URL(browser.runtime.getURL('/approve.html'))
        approvalUrl.searchParams.set(
            'transactionId',
            approvalRequest.transactionId
        )
        approvalUrl.searchParams.set('commandId', approvalRequest.commandId)
        window.location.replace(approvalUrl.toString())
        return
    }

    await import('@/utils/legacy-frontend')
}

void initializePopup()
