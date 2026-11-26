// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createComponent, type EventName } from '@lit/react'
import React from 'react'

import {
    WgTransactionCard as WgTransactionCardElement,
    type TransactionCardReviewEvent,
} from '../../components/transaction-card.ts'

export const TransactionCard = createComponent({
    tagName: 'wg-transaction-card',
    elementClass: WgTransactionCardElement,
    react: React,
    events: {
        onTransactionReview:
            'transaction-review' as EventName<TransactionCardReviewEvent>,
    },
})
