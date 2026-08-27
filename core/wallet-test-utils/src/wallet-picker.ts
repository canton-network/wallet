// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Locator, Page } from '@playwright/test'

export async function openWalletPicker(
    dappPage: Page,
    connectButton: Locator
): Promise<Page> {
    const pickerPopup = dappPage.waitForEvent('popup')
    await connectButton.click()
    return pickerPopup
}
