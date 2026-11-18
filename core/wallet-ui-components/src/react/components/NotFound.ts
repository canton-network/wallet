// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createComponent } from '@lit/react'
import React from 'react'

import { NotFound as NotFoundElement } from '../../components/not-found.ts'

export const NotFound = createComponent({
    tagName: 'not-found',
    elementClass: NotFoundElement,
    react: React,
})
