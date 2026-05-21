// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { WalletPickerEntry } from '@canton-network/core-types'
import { CSSResultGroup, html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { BaseElement } from '../../../../internal/base-element'
import styles from './styles'

@customElement('wallet-picker-connecting')
export class WalletPickerConnecting extends LitElement {
    static styles: CSSResultGroup = [BaseElement.styles, styles]

    @property()
    wcUri = ''

    @property()
    wcQrDataUrl = ''

    @property({ type: Object })
    entry: WalletPickerEntry | null = null

    @state()
    copyButtonClicked = false

    render() {
        return this.wcUri
            ? html`
                  ${this.wcQrDataUrl &&
                  html` <img src="${this.wcQrDataUrl}" alt="QR Code" /> `}
                  <h3>
                      ${this.wcQrDataUrl
                          ? 'Or paste this URI in your wallet'
                          : 'Paste this URI in your wallet'}
                  </h3>
                  <code>${this.wcUri}</code>
                  <button @click=${this.handleCopy}>
                      ${this.copyButtonClicked ? 'Copied!' : 'Copy URI'}
                  </button>
              `
            : html`
                  <div class="spinner"></div>
                  <h3>Connecting to ${this.entry?.name || ''}...</h3>
                  <p>
                      ${this.entry?.type === 'remote'
                          ? 'Approve the connection in the wallet popup'
                          : 'Approve the connection in your extension'}
                  </p>
              `
    }

    private handleCopy() {
        navigator.clipboard.writeText(this.wcUri)
        this.copyButtonClicked = true
        setTimeout(() => {
            this.copyButtonClicked = false
        }, 2000)
    }
}
