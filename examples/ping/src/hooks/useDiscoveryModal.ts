// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useRef, useState } from 'react'
import type {
    WalletPickerEntry,
    WalletPickerResult,
} from '@canton-network/core-types'

interface PickerState {
    isOpen: boolean
    mode: 'list' | 'connecting'
    entries: WalletPickerEntry[]
    selectedEntryId?: string
    selectedEntryName?: string
    selectedEntryIcon?: string
    walletConnectUri?: string
    walletConnectQrDataUrl?: string
}

export function useDiscoveryModal() {
    const [pickerState, setPickerState] = useState<PickerState>({
        isOpen: false,
        mode: 'list',
        entries: [],
    })
    const resolverRef = useRef<{
        resolve: (v: WalletPickerResult) => void
        reject: (e?: unknown) => void
    } | null>(null)

    // This function is passed to the SDK as the custom walletPicker
    const walletPickerFn = useCallback(
        async (entries: WalletPickerEntry[]): Promise<WalletPickerResult> => {
            setPickerState({
                isOpen: true,
                mode: 'list',
                entries,
                selectedEntryId: undefined,
                selectedEntryName: undefined,
                selectedEntryIcon: undefined,
                walletConnectUri: undefined,
                walletConnectQrDataUrl: undefined,
            })

            return new Promise<WalletPickerResult>((resolve, reject) => {
                resolverRef.current = { resolve, reject }
            })
        },
        []
    )

    // Call this when a wallet is selected from the modal
    const onWalletSelected = (entry: WalletPickerEntry) => {
        if (resolverRef.current) {
            resolverRef.current.resolve({
                providerId: entry.providerId,
                name: entry.name,
                type: entry.type,
                url: entry.url,
                reuseGlobalWalletPopup: entry.reuseGlobalWalletPopup,
            })
            resolverRef.current = null
        }

        // Keep the modal open and show a loading screen until the connection
        // completes (or the user goes back). WalletConnect additionally renders
        // its QR code within this connecting view.
        setPickerState((prev) => ({
            ...prev,
            isOpen: true,
            mode: 'connecting',
            selectedEntryId: entry.providerId,
            selectedEntryName: entry.name,
            selectedEntryIcon: entry.icon,
        }))
    }

    const onWalletConnectUri = useCallback(
        (uri: string, qrDataUrl?: string) => {
            // Only store the URI/QR here. The pairing may be pre-generated while the
            // wallet list is still showing, so we must NOT switch to the connecting
            // view until the user actually selects WalletConnect.
            setPickerState((prev) => ({
                ...prev,
                walletConnectUri: uri,
                walletConnectQrDataUrl: qrDataUrl,
            }))
        },
        []
    )

    // Return to the wallet list from the connecting/loading screen. The in-flight
    // connection attempt is abandoned; the caller is expected to restart the
    // picker so a new selection can be made.
    const backToList = useCallback(() => {
        resolverRef.current = null
        setPickerState((prev) => ({
            isOpen: true,
            mode: 'list',
            entries: prev.entries,
            selectedEntryId: undefined,
            selectedEntryName: undefined,
            selectedEntryIcon: undefined,
            walletConnectUri: undefined,
            walletConnectQrDataUrl: undefined,
        }))
    }, [])

    // Close the modal without rejecting (e.g. once the wallet is connected).
    const closeModal = useCallback(() => {
        resolverRef.current = null
        setPickerState({
            isOpen: false,
            mode: 'list',
            entries: [],
            selectedEntryId: undefined,
            selectedEntryName: undefined,
            selectedEntryIcon: undefined,
            walletConnectUri: undefined,
            walletConnectQrDataUrl: undefined,
        })
    }, [])

    // Call this when the modal is closed without selection
    const onModalClose = () => {
        if (resolverRef.current) {
            resolverRef.current.reject(
                new Error('User cancelled wallet selection')
            )
            resolverRef.current = null
        }
        setPickerState({
            isOpen: false,
            mode: 'list',
            entries: [],
            selectedEntryId: undefined,
            selectedEntryName: undefined,
            selectedEntryIcon: undefined,
            walletConnectUri: undefined,
            walletConnectQrDataUrl: undefined,
        })
    }

    return {
        pickerState,
        walletPickerFn,
        onWalletConnectUri,
        onWalletSelected,
        backToList,
        closeModal,
        onModalClose,
    }
}
