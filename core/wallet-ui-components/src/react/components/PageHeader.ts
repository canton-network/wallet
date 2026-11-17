// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createComponent } from '@lit/react'
import React from 'react'

import { WgPageHeader as WgPageHeaderElement } from '../../components/page-header.ts'

export const PageHeader = createComponent({
    tagName: 'wg-page-header',
    elementClass: WgPageHeaderElement,
    react: React,
})
