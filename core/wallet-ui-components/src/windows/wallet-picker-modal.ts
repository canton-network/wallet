// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
    BrowserPlatform,
    WalletPickerEntry,
    WalletPickerResult,
    WalletPickerSuggestedEntry,
} from '@canton-network/core-types'
import cantonLogo from '../../images/logos/canton-logo.png'
import { walletPickerModalCss } from '../styles/modal.js'

const RECENT_KEY = 'splice_wallet_picker_recent'
const SUGGESTED_KEY = 'splice_wallet_picker_suggested_entries'

type RecentGateway = { name: string; rpcUrl: string }

/**
 * In-page wallet picker modal.
 *
 * This is the framework-neutral, SDK-default counterpart to the popup-based
 * {@link ./wallet-picker.ts | pickWallet}. Instead of opening a separate
 * browser window, it renders a modal directly into the host page inside a
 * Shadow DOM (so host styles cannot leak in or out).
 *
 * The public contract mirrors the popup module so the SDK can drive it the
 * same way:
 *   - {@link pickWalletModal} shows the wallet list and resolves with the
 *     user's first selection.
 *   - {@link notifyWalletPickerModalConnected} closes the modal on success.
 *   - {@link notifyWalletPickerModalError} shows an error and returns to the
 *     list so the user can retry.
 *   - {@link waitForWalletPickerModalRetrySelection} resolves with the next
 *     selection after an error.
 *   - {@link setWalletPickerModalWalletConnectUri} feeds a WalletConnect
 *     pairing URI/QR into the connecting view.
 */

const el = <K extends keyof HTMLElementTagNameMap>(
    tag: K,
    text = '',
    attrs: Record<string, string> = {}
): HTMLElementTagNameMap[K] => {
    const node = document.createElement(tag)
    if (text) node.textContent = text
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v)
    return node
}

const BROWSER_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'

const detectBrowserPlatform = (): BrowserPlatform | 'unsupported' => {
    const userAgent = window.navigator.userAgent
    if (/firefox/i.test(userAgent)) return 'firefox'
    if (/chrome|chromium|crios/i.test(userAgent)) return 'chrome'
    return 'unsupported'
}

// The connecting spinner animates a registered <angle> custom property so the
// conic-gradient highlight travels around the ring. `@property` is ignored when
// declared inside a shadow root, so it must be registered at the document level.
let spinnerPropertyRegistered = false
const ensureSpinnerProperty = (): void => {
    if (spinnerPropertyRegistered) return
    spinnerPropertyRegistered = true
    try {
        const cssApi = (
            globalThis as {
                CSS?: { registerProperty?: (definition: object) => void }
            }
        ).CSS
        cssApi?.registerProperty?.({
            name: '--swk-spinner-angle',
            syntax: '<angle>',
            inherits: false,
            initialValue: '0deg',
        })
    } catch {
        // Already registered (e.g. the modal was opened before) — safe to ignore.
    }
}

class WalletPickerModalController {
    private host: HTMLDivElement
    private shadow: ShadowRoot
    private backdrop: HTMLElement | null = null
    private contentEl: HTMLElement | null = null
    private onHeightTransitionEnd: ((e: TransitionEvent) => void) | undefined =
        undefined

    private entries: WalletPickerEntry[] = []
    private recentGateways: RecentGateway[] = []
    private suggested: WalletPickerSuggestedEntry[] = []
    private readonly platform = detectBrowserPlatform()

    private state: 'list' | 'gateway' | 'connecting' = 'list'
    private errorMessage = ''
    private selected: WalletPickerResult | null = null
    private selectedIcon: string | null = null
    private wcUri: string | null = null
    private wcQrDataUrl: string | null = null
    private copied = false

    private destroyed = false
    private pending: {
        resolve: (v: WalletPickerResult) => void
        reject: (e: unknown) => void
    } | null = null
    private backPending: { resolve: () => void } | null = null
    private backRequested = false

    constructor(entries: WalletPickerEntry[]) {
        this.entries = entries
        this.recentGateways = this.loadRecentGateways()
        this.suggested = this.loadSuggested()

        ensureSpinnerProperty()

        this.host = document.createElement('div')
        this.host.setAttribute('data-swk-wallet-picker-modal', '')
        this.applyTheme(modalTheme)
        this.shadow = this.host.attachShadow({ mode: 'open' })

        const style = document.createElement('style')
        style.textContent = walletPickerModalCss
        this.shadow.appendChild(style)

        document.body.appendChild(this.host)
        this.render()
    }

    // ── Public flow control ────────────────────────────────

    awaitSelection(): Promise<WalletPickerResult> {
        return new Promise<WalletPickerResult>((resolve, reject) => {
            this.pending = { resolve, reject }
        })
    }

    /**
     * Resolves when the user clicks "back" from the connecting view, signalling
     * the SDK to abort the in-flight attempt and re-await a selection.
     */
    awaitBack(): Promise<void> {
        if (this.backRequested) {
            this.backRequested = false
            return Promise.resolve()
        }
        return new Promise<void>((resolve) => {
            this.backPending = { resolve }
        })
    }

    setConnected(): void {
        this.destroy()
    }

    setError(message: string): void {
        this.errorMessage = message
        this.selected = null
        this.selectedIcon = null
        this.wcUri = null
        this.wcQrDataUrl = null
        this.state = 'list'
        this.render()
    }

    setWalletConnectUri(uri: string, qrDataUrl?: string): void {
        this.wcUri = uri
        this.wcQrDataUrl = qrDataUrl ?? null
        if (this.state === 'connecting' && this.isWalletConnect()) {
            this.render()
        }
    }

    isActive(): boolean {
        return !this.destroyed
    }

    /** Forces the color scheme on the host element (`'auto'` clears the override). */
    applyTheme(theme: WalletPickerModalTheme): void {
        if (theme === 'auto') {
            this.host.removeAttribute('data-swk-theme')
        } else {
            this.host.setAttribute('data-swk-theme', theme)
        }
    }

    destroy(): void {
        if (this.destroyed) return
        this.destroyed = true

        // Re-open / teardown must not leave SDK waiters hanging forever.
        const pending = this.pending
        this.pending = null
        pending?.reject(new Error('User closed the wallet picker'))

        if (this.backPending) {
            const back = this.backPending
            this.backPending = null
            back.resolve()
        }

        this.host.remove()
    }

    // ── Storage helpers ────────────────────────────────────

    private loadRecentGateways(): RecentGateway[] {
        try {
            const raw = localStorage.getItem(RECENT_KEY)
            if (raw) return JSON.parse(raw)
        } catch {
            // ignore
        }
        return []
    }

    private loadSuggested(): WalletPickerSuggestedEntry[] {
        try {
            const raw = localStorage.getItem(SUGGESTED_KEY)
            if (raw) return JSON.parse(raw)
        } catch {
            // ignore
        }
        return []
    }

    private removeRecentGateway(rpcUrl: string): void {
        this.recentGateways = this.loadRecentGateways().filter(
            (r) => r.rpcUrl !== rpcUrl
        )
        if (this.recentGateways.length === 0) {
            localStorage.removeItem(RECENT_KEY)
        } else {
            localStorage.setItem(
                RECENT_KEY,
                JSON.stringify(this.recentGateways)
            )
        }
        this.render()
    }

    // ── Entry derivation (mirrors swk-wallet-picker) ───────

    private getAllEntries(): {
        entry: WalletPickerEntry
        isRecent: boolean
    }[] {
        const knownUrls = new Set(
            this.entries
                .filter((e) => e.type === 'remote' && e.url)
                .map((e) => e.url)
        )

        const recentEntries = this.recentGateways
            .filter((r) => !knownUrls.has(r.rpcUrl))
            .map((r) => ({
                entry: {
                    providerId: 'remote:' + r.rpcUrl,
                    name: r.name,
                    type: 'remote' as const,
                    url: r.rpcUrl,
                    reuseGlobalWalletPopup: true,
                } satisfies WalletPickerEntry,
                isRecent: true,
            }))

        return [
            ...this.entries.map((entry) => ({ entry, isRecent: false })),
            ...recentEntries,
        ]
    }

    private getSuggestedEntries(): WalletPickerSuggestedEntry[] {
        const detected = this.getAllEntries()
        const notInstalled = this.suggested.filter(
            (s) => !detected.some((d) => d.entry.providerId === s.providerId)
        )
        return notInstalled.sort((a, b) => {
            const aSupported = a.installUrls.some(
                (u) => u.platform === this.platform
            )
            const bSupported = b.installUrls.some(
                (u) => u.platform === this.platform
            )
            if (aSupported && !bSupported) return -1
            if (!aSupported && bSupported) return 1
            return a.name.localeCompare(b.name)
        })
    }

    // ── Selection ──────────────────────────────────────────

    private select(result: WalletPickerResult, icon?: string): void {
        this.selected = result
        this.selectedIcon = icon ?? null
        this.errorMessage = ''
        this.state = 'connecting'
        this.render()

        const pending = this.pending
        this.pending = null
        pending?.resolve(result)
    }

    private cancel(): void {
        const pending = this.pending
        this.pending = null
        this.destroy()
        pending?.reject(new Error('User closed the wallet picker'))
    }

    /** Return to the wallet list from the connecting view and signal the SDK. */
    private requestBack(): void {
        this.selected = null
        this.selectedIcon = null
        this.wcUri = null
        this.wcQrDataUrl = null
        this.errorMessage = ''
        this.state = 'list'
        this.render()

        if (this.backPending) {
            const back = this.backPending
            this.backPending = null
            back.resolve()
        } else {
            // Back was clicked before the SDK started awaiting it; remember it.
            this.backRequested = true
        }
    }

    private isWalletConnect(): boolean {
        return this.selected?.providerId === 'walletconnect'
    }

    // ── Rendering ──────────────────────────────────────────

    private render(): void {
        // Mount the backdrop and content shell once so their entry animations
        // (fade-in / slide-up) don't replay on every state change. Subsequent
        // renders only swap the inner content.
        const firstMount = !this.backdrop
        if (firstMount) {
            this.backdrop = el('div', '', {
                class: 'discovery-modal-backdrop',
            })
            this.backdrop.addEventListener('click', (e) => {
                if (e.target === this.backdrop) this.cancel()
            })

            this.contentEl = el('div', '', {
                class: 'discovery-modal-content',
                role: 'dialog',
                'aria-modal': 'true',
            })
            this.backdrop.appendChild(this.contentEl)
            this.shadow.appendChild(this.backdrop)
        }

        const content = this.contentEl!
        const inner = el('div', '', { class: 'discovery-modal-inner' })
        inner.appendChild(this.renderHeader())
        inner.appendChild(this.renderBody())

        if (this.state === 'list') {
            inner.appendChild(this.renderFooter())
        }

        if (firstMount) {
            content.appendChild(inner)
            return
        }

        // FLIP the height: measure the current size, swap the content, measure
        // the new size, then transition between the two.
        this.clearHeightAnimation()
        const prevHeight = content.offsetHeight
        content.replaceChildren(inner)
        const nextHeight = content.offsetHeight

        if (prevHeight === nextHeight) return

        content.style.height = `${prevHeight}px`
        // Force a reflow so the browser commits the start height before we
        // transition to the target height.
        void content.offsetHeight
        content.style.transition = 'height 220ms cubic-bezier(0.4, 0, 0.2, 1)'
        content.style.height = `${nextHeight}px`

        this.onHeightTransitionEnd = (e: TransitionEvent) => {
            if (e.propertyName !== 'height') return
            this.clearHeightAnimation()
        }
        content.addEventListener('transitionend', this.onHeightTransitionEnd)
    }

    /** Reset any in-flight height transition back to auto sizing. */
    private clearHeightAnimation(): void {
        const content = this.contentEl
        if (!content) return
        if (this.onHeightTransitionEnd) {
            content.removeEventListener(
                'transitionend',
                this.onHeightTransitionEnd
            )
            this.onHeightTransitionEnd = undefined
        }
        content.style.transition = ''
        content.style.height = ''
    }

    private renderHeader(): HTMLElement {
        const header = el('div', '', { class: 'discovery-modal-header' })

        const showBack = this.state === 'gateway' || this.state === 'connecting'
        if (showBack) {
            const back = el('button', '', {
                class: 'discovery-modal-back',
                type: 'button',
                'aria-label': 'Go back',
            })
            back.innerHTML =
                '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 4L6 8l4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
            back.addEventListener('click', () => {
                if (this.state === 'connecting') {
                    this.requestBack()
                } else {
                    this.state = 'list'
                    this.render()
                }
            })
            header.appendChild(back)
        }

        const heading = el('div', '', { class: 'discovery-modal-heading' })
        const title =
            this.state === 'connecting'
                ? this.isWalletConnect()
                    ? 'Scan with your phone'
                    : 'Connecting...'
                : this.state === 'gateway'
                  ? 'Remote Wallet'
                  : 'Connect Wallet'
        heading.appendChild(el('h2', title))
        header.appendChild(heading)

        const close = el('button', '', {
            class: 'discovery-modal-close',
            type: 'button',
            'aria-label': 'Close modal',
        })
        close.innerHTML =
            '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
        close.addEventListener('click', () => this.cancel())
        header.appendChild(close)

        return header
    }

    private renderBody(): HTMLElement {
        const body = el('div', '', { class: 'discovery-modal-body' })
        const view = el('div', '', { class: 'discovery-modal-view' })

        if (this.state === 'connecting') {
            view.appendChild(this.renderConnecting())
        } else if (this.state === 'gateway') {
            view.appendChild(this.renderGateway())
        } else {
            view.appendChild(this.renderList())
        }

        body.appendChild(view)
        return body
    }

    private renderList(): HTMLElement {
        const container = el('div', '', { class: 'wallet-picker-container' })

        if (this.errorMessage) {
            container.appendChild(
                el('div', this.errorMessage, {
                    class: 'discovery-modal-error',
                    role: 'alert',
                })
            )
        }

        // Order the flat list: saved remote connections first, then installed
        // extensions, then WalletConnect, then other remote wallets, then
        // everything else (not-yet-installed wallets).
        const detected = this.getAllEntries()
        const isWc = (e: WalletPickerEntry) => e.providerId === 'walletconnect'

        const recent = detected.filter((d) => d.isRecent)
        const installed = detected.filter(
            (d) => !d.isRecent && d.entry.type === 'browser' && !isWc(d.entry)
        )
        const walletConnect = detected.filter(
            (d) => !d.isRecent && isWc(d.entry)
        )
        const remote = detected.filter(
            (d) => !d.isRecent && d.entry.type === 'remote' && !isWc(d.entry)
        )
        const rest = detected.filter(
            (d) =>
                !recent.includes(d) &&
                !installed.includes(d) &&
                !walletConnect.includes(d) &&
                !remote.includes(d)
        )

        for (const { entry, isRecent } of [
            ...recent,
            ...installed,
            ...walletConnect,
            ...remote,
        ]) {
            container.appendChild(this.renderWalletItem(entry, isRecent))
        }

        // Remote Wallet (custom URL) connector, grouped with remote wallets.
        const gatewayItem = el('div', '', { class: 'wallet-picker-item' })
        const gatewayBtn = el('button', '', {
            class: 'wallet-picker-item-main',
            type: 'button',
        })
        const gwIcon = el('span', '', { class: 'wallet-icon' })
        gwIcon.appendChild(
            el('img', '', { src: cantonLogo, alt: 'Remote Wallet' })
        )
        const gwInfo = el('div', '', { class: 'wallet-info' })
        gwInfo.appendChild(el('h3', 'Remote Wallet'))
        gatewayBtn.append(gwIcon, gwInfo)
        gatewayBtn.addEventListener('click', () => {
            this.state = 'gateway'
            this.render()
        })
        gatewayItem.appendChild(gatewayBtn)
        container.appendChild(gatewayItem)

        // The rest: any leftover detected wallets, then not-yet-installed ones.
        for (const { entry, isRecent } of rest) {
            container.appendChild(this.renderWalletItem(entry, isRecent))
        }
        for (const entry of this.getSuggestedEntries()) {
            container.appendChild(this.renderSuggestedItem(entry))
        }

        // Wrap the scrollable list so the bottom fade can be pinned to the
        // viewport bottom (an absolute overlay in a non-scrolling wrapper)
        // rather than scrolling with the content.
        const scroll = el('div', '', { class: 'wallet-picker-scroll' })
        scroll.appendChild(container)
        const fadeTop = el('div', '', {
            class: 'wallet-picker-fade wallet-picker-fade-top',
        })
        const fade = el('div', '', { class: 'wallet-picker-fade' })
        scroll.append(fadeTop, fade)

        // Show a fade at the top once scrolled down (content above) and at the
        // bottom while there's more to scroll to; hide each at its edge.
        const updateFade = () => {
            const scrollable =
                container.scrollHeight - container.clientHeight > 1
            const atTop = container.scrollTop <= 1
            const atBottom =
                container.scrollTop + container.clientHeight >=
                container.scrollHeight - 1
            fadeTop.classList.toggle('is-hidden', !scrollable || atTop)
            fade.classList.toggle('is-hidden', !scrollable || atBottom)
        }
        container.addEventListener('scroll', updateFade, { passive: true })
        requestAnimationFrame(updateFade)

        return scroll
    }

    private renderWalletItem(
        entry: WalletPickerEntry,
        isRecent: boolean
    ): HTMLElement {
        const item = el('div', '', { class: 'wallet-picker-item' })

        const main = el('button', '', {
            class: 'wallet-picker-item-main',
            type: 'button',
        })

        const icon = el('span', '', { class: 'wallet-icon' })
        if (entry.icon) {
            icon.appendChild(
                el('img', '', { src: entry.icon, alt: entry.name })
            )
        } else if (entry.type === 'remote') {
            // Remote wallets (e.g. saved gateways) default to the Canton logo.
            icon.appendChild(
                el('img', '', { src: cantonLogo, alt: entry.name })
            )
        } else {
            const fallback = el('span', entry.name.charAt(0).toUpperCase(), {
                class: 'wallet-icon-fallback',
            })
            icon.appendChild(fallback)
        }

        const info = el('div', '', { class: 'wallet-info' })
        info.appendChild(el('h3', entry.name))

        main.append(icon, info)

        if (entry.type === 'browser') {
            main.appendChild(
                el('span', 'Installed', { class: 'wallet-installed-badge' })
            )
        }

        main.addEventListener('click', () =>
            this.select(
                {
                    providerId: entry.providerId,
                    name: entry.name,
                    type: entry.type,
                    url: entry.url,
                    reuseGlobalWalletPopup: entry.reuseGlobalWalletPopup,
                },
                entry.icon
            )
        )
        item.appendChild(main)

        if (isRecent && entry.url) {
            const remove = el('button', '', {
                class: 'wallet-picker-remove',
                type: 'button',
                'aria-label': `Remove ${entry.name}`,
                title: 'Remove',
            })
            remove.innerHTML =
                '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
            remove.addEventListener('click', (e) => {
                e.stopPropagation()
                this.removeRecentGateway(entry.url as string)
            })
            item.appendChild(remove)
        }

        return item
    }

    private renderSuggestedItem(
        entry: WalletPickerSuggestedEntry
    ): HTMLElement {
        // Prefer an install link for the user's current browser, else the first.
        const preferred =
            entry.installUrls.find((u) => u.platform === this.platform) ??
            entry.installUrls[0]

        const item = el('div', '', {
            class: 'wallet-picker-item wallet-suggested-item',
        })

        const main = el('button', '', {
            class: 'wallet-picker-item-main',
            type: 'button',
        })

        const icon = el('span', '', { class: 'wallet-icon' })
        if (entry.icon) {
            icon.appendChild(
                el('img', '', { src: entry.icon, alt: entry.name })
            )
        } else {
            icon.innerHTML = BROWSER_ICON
        }

        const info = el('div', '', { class: 'wallet-info' })
        info.appendChild(el('h3', entry.name))

        const badge = el(
            'span',
            preferred ? `Get for ${preferred.platform}` : 'Get',
            { class: 'wallet-get-badge' }
        )

        main.append(icon, info, badge)

        if (preferred?.url) {
            main.addEventListener('click', () => {
                window.open(preferred.url, '_blank', 'noopener')
            })
        }

        item.appendChild(main)
        return item
    }

    private renderGateway(): HTMLElement {
        const container = el('div', '', { class: 'gateway-view' })
        container.appendChild(
            el('p', 'Enter the URL of your Remote Wallet.', {
                class: 'gateway-help',
            })
        )

        const input = el('input', '', {
            class: 'custom-url-input',
            type: 'url',
            'aria-label': 'Remote Wallet URL',
            placeholder: 'https://wallet.example.com',
        }) as HTMLInputElement

        const button = el('button', 'Connect', {
            class: 'gateway-connect-button',
            type: 'button',
        }) as HTMLButtonElement
        button.disabled = true

        const parse = (value: string): URL | undefined => {
            const trimmed = value.trim()
            if (!trimmed) return undefined
            try {
                const normalized = /^https?:\/\//i.test(trimmed)
                    ? trimmed
                    : `https://${trimmed}`
                return new URL(normalized)
            } catch {
                return undefined
            }
        }

        const connect = () => {
            const parsed = parse(input.value)
            if (!parsed) return
            const normalizedUrl = parsed.toString()
            this.select({
                providerId: `custom:remote:${encodeURIComponent(normalizedUrl)}`,
                name: parsed.hostname || 'Custom URL',
                type: 'remote',
                url: normalizedUrl,
                reuseGlobalWalletPopup: false,
            })
        }

        input.addEventListener('input', () => {
            button.disabled = !parse(input.value)
        })
        input.addEventListener('keydown', (e) => {
            if ((e as KeyboardEvent).key === 'Enter' && parse(input.value)) {
                e.preventDefault()
                connect()
            }
        })
        button.addEventListener('click', connect)

        container.append(input, button)
        queueMicrotask(() => input.focus())
        return container
    }

    private renderConnecting(): HTMLElement {
        const container = el('div', '', { class: 'walletconnect-view' })

        if (this.isWalletConnect()) {
            if (this.wcQrDataUrl) {
                container.appendChild(
                    el('img', '', {
                        class: 'walletconnect-qr',
                        src: this.wcQrDataUrl,
                        alt: 'WalletConnect QR code',
                    })
                )
            } else {
                const placeholder = el('div', '', {
                    class: 'walletconnect-qr walletconnect-qr-placeholder',
                })
                placeholder.appendChild(
                    el('div', '', { class: 'walletconnect-spinner' })
                )
                container.appendChild(placeholder)
            }

            const divider = el('div', '', { class: 'walletconnect-divider' })
            divider.appendChild(
                el('span', 'Or', { class: 'walletconnect-divider-label' })
            )
            container.appendChild(divider)

            const copyBtn = el(
                'button',
                this.copied ? 'Copied!' : 'Copy link',
                {
                    class: 'walletconnect-copy-button',
                    type: 'button',
                }
            ) as HTMLButtonElement
            copyBtn.disabled = !this.wcUri
            copyBtn.addEventListener('click', async () => {
                if (!this.wcUri) return
                try {
                    await navigator.clipboard.writeText(this.wcUri)
                    this.copied = true
                    this.render()
                    setTimeout(() => {
                        this.copied = false
                        if (!this.destroyed && this.state === 'connecting') {
                            this.render()
                        }
                    }, 2000)
                } catch {
                    // ignore clipboard failures
                }
            })
            container.appendChild(copyBtn)
            return container
        }

        const loading = el('div', '', { class: 'connecting-loading' })
        const ring = el('div', '', { class: 'connecting-spinner-ring' })
        const avatar = el('span', '', { class: 'connecting-avatar' })
        if (this.selectedIcon) {
            avatar.appendChild(
                el('img', '', {
                    src: this.selectedIcon,
                    alt: this.selected?.name ?? 'wallet',
                })
            )
        } else {
            avatar.appendChild(
                el(
                    'span',
                    (this.selected?.name ?? 'W').charAt(0).toUpperCase(),
                    { class: 'connecting-avatar-fallback' }
                )
            )
        }
        ring.appendChild(avatar)
        loading.appendChild(ring)
        loading.appendChild(
            el('h3', `Connecting to ${this.selected?.name ?? 'wallet'}`, {
                class: 'walletconnect-title',
            })
        )
        loading.appendChild(
            el('p', 'Approve the connection in your wallet to continue.', {
                class: 'walletconnect-help',
            })
        )
        container.appendChild(loading)
        return container
    }

    private renderFooter(): HTMLElement {
        const footer = el('div', '', { class: 'discovery-modal-footer' })
        const link = el('a', '', {
            class: 'discovery-modal-no-wallet',
            href: 'https://github.com/canton-foundation/wallets/blob/main/WALLET_DIRECTORY.md',
            target: '_blank',
            rel: 'noopener',
        })
        link.innerHTML =
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2.5" stroke="currentColor" stroke-width="1.8"/><path d="M3 9.5h12a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H3" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="15" cy="13" r="1.1" fill="currentColor"/></svg>'
        link.appendChild(
            el('span', 'Need a wallet?', {
                class: 'discovery-modal-no-wallet-label',
            })
        )
        footer.appendChild(link)
        return footer
    }
}

let active: WalletPickerModalController | null = null

/**
 * Opens the in-page wallet picker modal and resolves with the user's first
 * selection. Subsequent retries after a failed connection are obtained via
 * {@link waitForWalletPickerModalRetrySelection}.
 */
export async function pickWalletModal(
    entries: WalletPickerEntry[]
): Promise<WalletPickerResult> {
    active?.destroy()
    active = new WalletPickerModalController(entries)
    return active.awaitSelection()
}

/** Closes the modal after a successful connection. */
export function notifyWalletPickerModalConnected(): void {
    active?.setConnected()
}

/** Shows an error in the modal and returns the user to the wallet list. */
export function notifyWalletPickerModalError(message: string): void {
    active?.setError(message)
}

/** Resolves with the next selection after an error; rejects if the modal was closed. */
export async function waitForWalletPickerModalRetrySelection(): Promise<WalletPickerResult> {
    if (!active || !active.isActive()) {
        throw new Error('Wallet picker is not open')
    }
    return active.awaitSelection()
}

/**
 * Resolves when the user clicks "back" from the connecting view. The SDK races
 * this against the in-flight connection so it can abort the attempt and re-await
 * a selection. If no modal is active it never resolves (loses the race).
 */
export function waitForWalletPickerModalBack(): Promise<void> {
    if (!active || !active.isActive()) {
        return new Promise<void>(() => {})
    }
    return active.awaitBack()
}

/** Feeds a WalletConnect pairing URI (and optional QR data URL) into the connecting view. */
export function setWalletPickerModalWalletConnectUri(
    uri: string,
    qrDataUrl?: string
): void {
    active?.setWalletConnectUri(uri, qrDataUrl)
}

/** Forces the modal color scheme, or `'auto'` to follow `prefers-color-scheme`. */
export type WalletPickerModalTheme = 'light' | 'dark' | 'auto'

let modalTheme: WalletPickerModalTheme = 'auto'

/**
 * Sets the color scheme used by the in-page modal picker. Applies immediately
 * to an open modal and to any opened later. `'auto'` follows the OS setting.
 */
export function setWalletPickerModalTheme(theme: WalletPickerModalTheme): void {
    modalTheme = theme
    active?.applyTheme(theme)
}
