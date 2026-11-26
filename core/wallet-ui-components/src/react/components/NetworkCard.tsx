// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createComponent, type EventName } from '@lit/react'
import React from 'react'

import {
    NetworkCard as NetworkCardElement,
    type NetworkCardReviewEvent,
    type NetworkCardDeleteEvent,
    type NetworkCardUpdateEvent,
} from '../../components/network-card.ts'

export const NetworkCard = createComponent({
    tagName: 'network-card',
    elementClass: NetworkCardElement,
    react: React,
    events: {
        onNetworkReview: 'network-review' as EventName<NetworkCardReviewEvent>,
        onDelete: 'delete' as EventName<NetworkCardDeleteEvent>,
        onUpdate: 'update' as EventName<NetworkCardUpdateEvent>,
    },
})
