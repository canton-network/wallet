// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Shared tests methods for dapp scope

import { expect } from '@canton-network/core-wallet-test-utils'
import { Page } from '@playwright/test'

export async function expectDappConnected(
    dappPage: Page,
    gatewayName: string
): Promise<void> {
    // Wrapped with expect().toPass, because buttons part depends on connectResponse, while <Status> part depends on statusEvent.
    // They come in asynchronously, wrapper mitigates race condition by waiting until every assertion in positive at the same time.
    await expect(async () => {
        const [
            connectCount,
            openEnabled,
            connectedVisible,
            connectedGateway,
            disconnectVisible,
        ] = await Promise.all([
            dappPage.getByTestId('connect-wallet').count(),
            dappPage.getByTestId('open-wallet').isEnabled(),
            dappPage.getByTestId('connection-indicator-connected').isVisible(),
            dappPage.getByTestId('connected-gateway').textContent(),
            dappPage.getByTestId('disconnect-wallet').isVisible(),
        ]);

        expect(
            connectCount,
            'a connected dApp should no longer has a connect button'
        ).toBe(0);

        expect(
            openEnabled,
            'a connected dApp should allow opening the wallet'
        ).toBe(true);

        expect(
            connectedVisible,
            'the dApp status line should report the wallet as connected'
        ).toBe(true);

        expect(
            connectedGateway,
            'the dApp should report the gateway it is connected to'
        ).toBe(gatewayName);

        expect(
            disconnectVisible,
            'a connected dApp should have disconnect button'
        ).toBe(true);
    }).toPass({
        timeout: 10_000,
    })
}

export async function expectDappDisconnected(dappPage: Page): Promise<void> {
    // Wrapped with expect().toPass, because buttons part depends on connectResponse, while <Status> part depends on statusEvent.
    // They come in asynchronously, wrapper mitigates race condition by waiting until every assertion in positive at the same time.
    await expect(async () => {
        const [
            disconnectedVisible,
            connectVisible,
            disconnectCount,
            openDisabled,
        ] = await Promise.all([
            dappPage
                .getByTestId('connection-indicator-disconnected')
                .isVisible(),
            dappPage
                .getByTestId('connect-wallet')
                .isVisible(),
            dappPage
                .getByTestId('disconnect-wallet')
                .count(),
            dappPage
                .getByTestId('open-wallet')
                .isDisabled(),
        ]);

        expect(disconnectedVisible).toBe(true);
        expect(connectVisible).toBe(true);
        expect(disconnectCount).toBe(0);
        expect(openDisabled).toBe(true);
    }).toPass({
        timeout: 10_000,
    })
}
