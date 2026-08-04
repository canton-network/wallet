// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import type { WalletPickerEntry } from '@canton-network/core-types'
import { WALLET_GATEWAY_ICON } from '@canton-network/dapp-sdk'
import './DiscoveryModal.css'

interface DiscoveryModalProps {
    isOpen: boolean
    mode: 'list' | 'connecting'
    entries: WalletPickerEntry[]
    selectedEntryId?: string
    selectedEntryName?: string
    selectedEntryIcon?: string
    walletConnectUri?: string
    walletConnectQrDataUrl?: string
    enableGatewayConnector?: boolean
    onSelect: (entry: WalletPickerEntry) => void
    onBack: () => void
    onClose: () => void
}

export const DiscoveryModal: React.FC<DiscoveryModalProps> = ({
    isOpen,
    mode,
    entries,
    selectedEntryId,
    selectedEntryName,
    selectedEntryIcon,
    walletConnectUri,
    walletConnectQrDataUrl,
    enableGatewayConnector = true,
    onSelect,
    onBack,
    onClose,
}) => {
    const [customUrl, setCustomUrl] = useState('')
    const [copied, setCopied] = useState(false)
    const [showGatewayInput, setShowGatewayInput] = useState(false)
    const shellRef = useRef<HTMLDivElement>(null)
    const innerRef = useRef<HTMLDivElement>(null)
    const prevHeightRef = useRef<number | null>(null)
    const parsedCustomUrl = useMemo(() => {
        const trimmed = customUrl.trim()
        if (!trimmed) return undefined

        try {
            const normalized = /^https?:\/\//i.test(trimmed)
                ? trimmed
                : `https://${trimmed}`
            return new URL(normalized)
        } catch {
            return undefined
        }
    }, [customUrl])

    // Merge previously connected gateways (persisted by the SDK in localStorage)
    // into the list so they are available for future connections, mirroring the
    // default wallet picker behaviour. Held in state so they can be removed.
    const RECENT_GATEWAYS_KEY = 'splice_wallet_picker_recent'
    const [recentGateways, setRecentGateways] = useState<
        { name: string; rpcUrl: string }[]
    >([])

    const loadRecentGateways = useCallback(() => {
        try {
            const raw = localStorage.getItem(RECENT_GATEWAYS_KEY)
            setRecentGateways(raw ? JSON.parse(raw) : [])
        } catch {
            setRecentGateways([])
        }
    }, [])

    // Refresh the recents from storage whenever the modal (re)opens.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (isOpen) loadRecentGateways()
    }, [isOpen, loadRecentGateways])

    // Reset the gateway URL sub-view when the modal closes or starts connecting.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (!isOpen || mode === 'connecting') setShowGatewayInput(false)
    }, [isOpen, mode])

    const handleRemoveRecent = useCallback((rpcUrl: string) => {
        setRecentGateways((prev) => {
            const next = prev.filter((r) => r.rpcUrl !== rpcUrl)
            try {
                if (next.length === 0) {
                    localStorage.removeItem(RECENT_GATEWAYS_KEY)
                } else {
                    localStorage.setItem(
                        RECENT_GATEWAYS_KEY,
                        JSON.stringify(next)
                    )
                }
            } catch {
                // best-effort
            }
            return next
        })
    }, [])

    const recentUrls = useMemo(() => {
        const knownUrls = new Set(
            entries
                .filter((e) => e.type === 'remote' && e.url)
                .map((e) => e.url)
        )
        return new Set(
            recentGateways
                .map((r) => r.rpcUrl)
                .filter((url) => url && !knownUrls.has(url))
        )
    }, [entries, recentGateways])

    const mergedEntries = useMemo(() => {
        const recentEntries: WalletPickerEntry[] = recentGateways
            .filter((r) => recentUrls.has(r.rpcUrl))
            .map((r) => ({
                providerId: 'remote:' + r.rpcUrl,
                name: r.name,
                type: 'remote' as const,
                url: r.rpcUrl,
                icon: WALLET_GATEWAY_ICON,
                reuseGlobalWalletPopup: true,
            }))

        return [...entries, ...recentEntries]
    }, [entries, recentGateways, recentUrls])

    // Morph the modal shell between the list / loading / QR views by animating
    // its height from the previous size to the newly measured content size.
    useLayoutEffect(() => {
        const shell = shellRef.current
        const inner = innerRef.current
        if (!shell || !inner) return

        const toWidth = inner.offsetWidth
        const toHeight = inner.offsetHeight

        if (prevHeightRef.current === null) {
            // First render of this open session: snap to size without animating.
            shell.style.setProperty('--modal-width', `${toWidth}px`)
            shell.style.setProperty('--modal-height', `${toHeight}px`)
            shell.classList.add('is-measured')
            prevHeightRef.current = toHeight
            return
        }

        if (prevHeightRef.current === toHeight) {
            shell.style.setProperty('--modal-width', `${toWidth}px`)
            return
        }

        // FLIP: pin the previous height (no transition), force a reflow so the
        // browser commits it as the starting frame, then animate to the new one.
        shell.style.transition = 'none'
        shell.style.setProperty('--modal-height', `${prevHeightRef.current}px`)
        shell.style.setProperty('--modal-width', `${toWidth}px`)
        void shell.offsetHeight
        shell.style.transition = ''
        shell.style.setProperty('--modal-height', `${toHeight}px`)
        prevHeightRef.current = toHeight
    }, [
        isOpen,
        mode,
        walletConnectUri,
        walletConnectQrDataUrl,
        mergedEntries.length,
        showGatewayInput,
    ])

    // Reset the cached height when closed so the next open snaps to size
    // instead of animating from a stale height.
    useEffect(() => {
        if (!isOpen) prevHeightRef.current = null
    }, [isOpen])

    if (!isOpen) {
        return null
    }

    const handleWalletSelection = (entry: WalletPickerEntry) => {
        onSelect(entry)
    }

    const handleBackdropClick = (e: React.MouseEvent) => {
        // Only close if clicking the backdrop itself, not the modal content
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    const handleConnectWithUrl = () => {
        if (!parsedCustomUrl) return

        const normalizedUrl = parsedCustomUrl.toString()
        const hostname = parsedCustomUrl.hostname

        onSelect({
            providerId: `custom:remote:${encodeURIComponent(normalizedUrl)}`,
            name: hostname || 'Custom URL',
            type: 'remote',
            description: normalizedUrl,
            url: normalizedUrl,
            reuseGlobalWalletPopup: false,
        })
        setCustomUrl('')
    }

    const handleCopyUri = async () => {
        if (!walletConnectUri) return
        try {
            await navigator.clipboard.writeText(walletConnectUri)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            setCopied(false)
        }
    }

    // WalletConnect always renders the QR view (never the generic loading
    // screen). While the pre-generated URI is still being produced we show a
    // QR-shaped placeholder so there is no loading flash.
    const isWalletConnect = selectedEntryId === 'walletconnect'

    const viewKey =
        mode === 'connecting'
            ? isWalletConnect
                ? 'wc'
                : 'loading'
            : showGatewayInput
              ? 'gateway'
              : 'list'

    const showBackButton = mode === 'connecting' || showGatewayInput
    const handleHeaderBack = () => {
        if (mode === 'connecting') {
            onBack()
        } else if (showGatewayInput) {
            setShowGatewayInput(false)
        }
    }
    const headerTitle =
        mode === 'connecting'
            ? 'Connecting...'
            : showGatewayInput
              ? 'Wallet Gateway'
              : 'Connect Wallet'

    return (
        <div className="discovery-modal-backdrop" onClick={handleBackdropClick}>
            <div
                ref={shellRef}
                className="discovery-modal-content"
                role="dialog"
                aria-modal="true"
                aria-labelledby="discovery-modal-title"
            >
                <div className="discovery-modal-inner" ref={innerRef}>
                    <div className="discovery-modal-header">
                        {showBackButton && (
                            <button
                                className="discovery-modal-back"
                                onClick={handleHeaderBack}
                                aria-label="Go back"
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M10 4L6 8l4 4"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        )}
                        <div className="discovery-modal-heading">
                            <h2 id="discovery-modal-title">{headerTitle}</h2>
                        </div>
                        <button
                            className="discovery-modal-close"
                            onClick={onClose}
                            aria-label="Close modal"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                aria-hidden="true"
                            >
                                <path
                                    d="M12 4L4 12M4 4l8 8"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </button>
                    </div>
                    <div className="discovery-modal-body">
                        <div className="discovery-modal-view" key={viewKey}>
                            {mode === 'connecting' ? (
                                <div className="walletconnect-view">
                                    {isWalletConnect ? (
                                        <>
                                            <h3 className="walletconnect-title">
                                                Scan with your wallet
                                            </h3>
                                            {walletConnectQrDataUrl ? (
                                                <img
                                                    className="walletconnect-qr"
                                                    src={walletConnectQrDataUrl}
                                                    alt="WalletConnect QR code"
                                                />
                                            ) : (
                                                <div className="walletconnect-qr walletconnect-qr-placeholder">
                                                    <div className="walletconnect-spinner" />
                                                </div>
                                            )}
                                            <div className="walletconnect-divider" />
                                            <button
                                                className="walletconnect-copy-button"
                                                onClick={handleCopyUri}
                                                disabled={!walletConnectUri}
                                            >
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 16 16"
                                                    fill="none"
                                                    aria-hidden="true"
                                                >
                                                    <rect
                                                        x="5.5"
                                                        y="5.5"
                                                        width="8"
                                                        height="8"
                                                        rx="1.6"
                                                        stroke="currentColor"
                                                        strokeWidth="1.4"
                                                    />
                                                    <path
                                                        d="M3.5 10.5h-.5a1.5 1.5 0 0 1-1.5-1.5V3a1.5 1.5 0 0 1 1.5-1.5h6A1.5 1.5 0 0 1 11 3v.5"
                                                        stroke="currentColor"
                                                        strokeWidth="1.4"
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                {copied
                                                    ? 'Copied!'
                                                    : 'Copy link'}
                                            </button>
                                        </>
                                    ) : (
                                        <div className="connecting-loading">
                                            <div className="connecting-spinner-ring">
                                                <span className="connecting-avatar">
                                                    {selectedEntryIcon ? (
                                                        <img
                                                            src={
                                                                selectedEntryIcon
                                                            }
                                                            alt={
                                                                selectedEntryName ??
                                                                'wallet'
                                                            }
                                                        />
                                                    ) : (
                                                        <span className="connecting-avatar-fallback">
                                                            {(
                                                                selectedEntryName ??
                                                                'W'
                                                            )
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                            <h3 className="walletconnect-title">
                                                Connecting to{' '}
                                                {selectedEntryName ?? 'wallet'}
                                            </h3>
                                            <p className="walletconnect-help">
                                                Approve the connection in your
                                                wallet to continue.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : showGatewayInput ? (
                                <div className="gateway-view">
                                    <p className="gateway-help">
                                        Enter the URL of your Wallet Gateway to
                                        connect.
                                    </p>
                                    <input
                                        id="wallet-custom-url"
                                        className="custom-url-input"
                                        type="url"
                                        aria-label="Wallet Gateway URL"
                                        placeholder="https://wallet.example.com"
                                        value={customUrl}
                                        onChange={(e) =>
                                            setCustomUrl(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === 'Enter' &&
                                                parsedCustomUrl
                                            ) {
                                                e.preventDefault()
                                                handleConnectWithUrl()
                                            }
                                        }}
                                        autoFocus
                                    />
                                    <button
                                        className="gateway-connect-button"
                                        onClick={handleConnectWithUrl}
                                        disabled={!parsedCustomUrl}
                                    >
                                        Connect
                                    </button>
                                </div>
                            ) : mergedEntries.length === 0 &&
                              !enableGatewayConnector ? (
                                <div className="wallet-picker-empty">
                                    <div className="wallet-picker-empty-icon">
                                        🔍
                                    </div>
                                    <p>No wallets found</p>
                                    <span>
                                        Install a compatible wallet to get
                                        started
                                    </span>
                                </div>
                            ) : (
                                <div className="wallet-picker-container">
                                    {enableGatewayConnector && (
                                        <div className="wallet-picker-item">
                                            <button
                                                className="wallet-picker-item-main"
                                                onClick={() =>
                                                    setShowGatewayInput(true)
                                                }
                                            >
                                                <span className="wallet-icon">
                                                    <img
                                                        src={
                                                            WALLET_GATEWAY_ICON
                                                        }
                                                        alt="Wallet Gateway"
                                                    />
                                                </span>
                                                <div className="wallet-info">
                                                    <h3>Wallet Gateway</h3>
                                                </div>
                                            </button>
                                        </div>
                                    )}
                                    {mergedEntries.map((entry) => {
                                        const isRecent =
                                            entry.type === 'remote' &&
                                            !!entry.url &&
                                            recentUrls.has(entry.url)
                                        return (
                                            <div
                                                key={entry.providerId}
                                                className="wallet-picker-item"
                                            >
                                                <button
                                                    className="wallet-picker-item-main"
                                                    onClick={() =>
                                                        handleWalletSelection(
                                                            entry
                                                        )
                                                    }
                                                >
                                                    <span className="wallet-icon">
                                                        {entry.icon ? (
                                                            <img
                                                                src={entry.icon}
                                                                alt={entry.name}
                                                            />
                                                        ) : (
                                                            <span className="wallet-icon-fallback">
                                                                {entry.name
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </span>
                                                        )}
                                                    </span>
                                                    <div className="wallet-info">
                                                        <h3>{entry.name}</h3>
                                                    </div>
                                                </button>
                                                {isRecent && (
                                                    <button
                                                        className="wallet-picker-remove"
                                                        aria-label={`Remove ${entry.name}`}
                                                        title="Remove"
                                                        onClick={() =>
                                                            handleRemoveRecent(
                                                                entry.url as string
                                                            )
                                                        }
                                                    >
                                                        <svg
                                                            width="16"
                                                            height="16"
                                                            viewBox="0 0 16 16"
                                                            fill="none"
                                                            aria-hidden="true"
                                                        >
                                                            <path
                                                                d="M12 4L4 12M4 4l8 8"
                                                                stroke="currentColor"
                                                                strokeWidth="1.6"
                                                                strokeLinecap="round"
                                                            />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                    {viewKey === 'list' && (
                        <div className="discovery-modal-footer">
                            <a className="discovery-modal-no-wallet" href="#">
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    aria-hidden="true"
                                >
                                    <rect
                                        x="3"
                                        y="6"
                                        width="18"
                                        height="13"
                                        rx="2.5"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                    />
                                    <path
                                        d="M3 9.5h12a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H3"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinejoin="round"
                                    />
                                    <circle cx="15" cy="13" r="1.1" fill="currentColor" />
                                </svg>
                                Need a wallet?
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DiscoveryModal
