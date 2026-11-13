// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react'
import type * as sdk from '@canton-network/dapp-sdk'

export function ScopedToken(props: {
    connectResult?: sdk.dappAPI.ConnectResult
    loading: boolean
    onConnect: (params: sdk.ConnectParams) => void
}) {
    const [scope, setScope] = useState('')
    const scopes = scope.split(' ').filter((s) => s.length > 0)

    return (
        <div>
            <h2>Scoped Token</h2>
            <p>
                Space separated Ledger API scopes to request when connecting,
                e.g. <code>ledger:read l:pkg:#pkg-one</code>
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
                <input
                    data-testid="scoped-token-scope"
                    style={{ flex: 1 }}
                    type="text"
                    placeholder="ledger:read l:pkg:#pkg-one"
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                />
                <button
                    data-testid="scoped-token-connect"
                    disabled={props.loading || props.connectResult?.isConnected}
                    onClick={() => props.onConnect({ scopes })}
                >
                    connect
                </button>
            </div>
            {props.connectResult?.isConnected && (
                <p>
                    <i>Disconnect first to connect with requested scopes.</i>
                </p>
            )}
            <p>Requested scopes: {JSON.stringify(scopes)}</p>
        </div>
    )
}
