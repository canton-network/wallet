// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Locator, Page } from '@playwright/test'

export const WALLET_PICKER_MODAL_HOST = '[data-swk-wallet-picker-modal]'

export type WalletPickerSurface = {
    kind: 'modal' | 'popup'
    page: Page
    dappPage: Page
}

export async function openWalletPicker(
    dappPage: Page,
    connectButton: Locator
): Promise<WalletPickerSurface> {
    const modalHost = dappPage.locator(WALLET_PICKER_MODAL_HOST)

    const popupRace = dappPage
        .waitForEvent('popup', { timeout: 15_000 })
        .then((page): WalletPickerSurface => ({
            kind: 'popup',
            page,
            dappPage,
        }))
        .catch(() => null)

    const modalRace = modalHost
        .waitFor({ state: 'attached', timeout: 15_000 })
        .then((): WalletPickerSurface => ({
            kind: 'modal',
            page: dappPage,
            dappPage,
        }))
        .catch(() => null)

    await connectButton.click()

    const surface = await Promise.race([popupRace, modalRace])
    if (!surface) {
        throw new Error(
            'wallet picker did not open as an in-page modal or a popup window'
        )
    }

    if (surface.kind === 'modal') {
        await modalHost
            .locator('[role="dialog"]')
            .waitFor({ state: 'visible', timeout: 5_000 })
    }

    return surface
}

export function walletPickerModalHost(dappPage: Page): Locator {
    return dappPage.locator(WALLET_PICKER_MODAL_HOST)
}

export function walletPickerModalRowByTitle(
    dappPage: Page,
    title: string
): Locator {
    const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return walletPickerModalHost(dappPage).getByRole('button', {
        name: new RegExp(`^${escaped}(\\s+${escaped})?$`),
    })
}
