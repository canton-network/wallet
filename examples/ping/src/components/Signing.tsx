// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useContext, useState } from 'react'
import { ErrorContext } from '../ErrorContext'
import * as sdk from '@canton-network/dapp-sdk'
import { prettyjson } from '../utils'

export function Signing(props: { connectResult?: sdk.dappAPI.ConnectResult }) {
    const { setErrorMsg } = useContext(ErrorContext)
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<sdk.dappAPI.SignMessageResult>()

    const connected = props.connectResult?.isConnected ?? false

    function signMessage() {
        setErrorMsg('')
        setResult(undefined)
        setLoading(true)

        sdk.dappSDK
            .signMessage({ message })
            .then((response) => {
                setResult(response)
            })
            .catch((err) => {
                console.error('Error signing message:', err)
                setErrorMsg(
                    err instanceof Error ? err.message : JSON.stringify(err)
                )
            })
            .finally(() => {
                setLoading(false)
            })
    }

    return (
        connected && (
            <div className="card">
                <h2>Signing</h2>
                <div
                    style={{
                        display: 'flex',
                        gap: '10px',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <input
                        type="text"
                        placeholder="Message to sign"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        style={{ flex: 1, maxWidth: '400px' }}
                    />
                    <button
                        disabled={loading || !message}
                        onClick={signMessage}
                    >
                        signMessage
                    </button>
                </div>

                {loading && <p>Loading...</p>}

                {result && (
                    <div>
                        <h3>Result</h3>
                        <div className="terminal-display">
                            <pre>{prettyjson(result)}</pre>
                        </div>
                    </div>
                )}
            </div>
        )
    )
}
