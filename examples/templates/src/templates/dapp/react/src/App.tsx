// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as sdk from '@canton-network/dapp-sdk'
import { useEffect, useState } from 'react'
import { Card, Connected } from './components'

function errorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String(error.message)
    }
    return String(error)
}

export function App() {
    const [status, setStatus] = useState<sdk.StatusEvent | null>(null)
    const [accounts, setAccounts] = useState<sdk.Wallet[] | null>(null)
    const [transactions, setTransactions] = useState<sdk.TxChangedEvent[]>([])
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const connected = status?.connection.isConnected ?? false

    useEffect(() => {
        let active = true
        async function restore() {
            await sdk.init()
            if (sdk.getConnectedProvider()) {
                const restored = await sdk.status()
                if (active) setStatus(restored)
            }
        }
        restore().catch((err: unknown) => {
            if (active) setError(errorMessage(err))
        })
        return () => {
            active = false
        }
    }, [])

    useEffect(() => {
        const provider = sdk.getConnectedProvider()
        if (!connected || !provider) return

        let needsAccounts = true
        function onAccounts(next: sdk.Wallet[]) {
            needsAccounts = false
            setAccounts(next)
        }
        function onStatus(next: sdk.StatusEvent) {
            setStatus(next)
            if (!next.connection.isConnected) {
                needsAccounts = false
                setAccounts(null)
            }
        }
        function onTransaction(next: sdk.TxChangedEvent) {
            setTransactions((previous) => [next, ...previous])
        }

        provider.on('statusChanged', onStatus)
        provider.on('accountsChanged', onAccounts)
        provider.on('txChanged', onTransaction)
        sdk.listAccounts().then(
            (next) => {
                if (needsAccounts) onAccounts(next)
            },
            (err: unknown) => {
                if (needsAccounts) {
                    setAccounts([])
                    setError(errorMessage(err))
                }
            }
        )
        return () => {
            needsAccounts = false
            provider.removeListener('statusChanged', onStatus)
            provider.removeListener('accountsChanged', onAccounts)
            provider.removeListener('txChanged', onTransaction)
        }
    }, [connected])

    async function run(action: () => Promise<unknown>) {
        setBusy(true)
        setError('')
        try {
            await action()
        } catch (err) {
            setError(errorMessage(err))
        } finally {
            setBusy(false)
        }
    }

    function connect() {
        return run(async () => {
            await sdk.connect()
            setStatus(await sdk.status())
        })
    }

    function disconnect() {
        return run(async () => {
            await sdk.disconnect()
            setStatus(null)
            setAccounts(null)
        })
    }

    function ping() {
        const partyId = accounts?.find((account) => account.primary)?.partyId
        if (!partyId) return
        return run(() =>
            sdk.prepareExecute({
                commands: [
                    {
                        CreateCommand: {
                            templateId:
                                '#canton-builtin-admin-workflow-ping:Canton.Internal.Ping:Ping',
                            createArguments: {
                                id: `my-test-${new Date().getTime()}`,
                                initiator: partyId,
                                responder: partyId,
                            },
                        },
                    },
                ],
            })
        )
    }

    return (
        <main>
            {status?.connection.isConnected ? (
                <Connected
                    status={status}
                    accounts={accounts ?? []}
                    transactions={transactions}
                    busy={busy || accounts === null}
                    openWallet={() => run(sdk.open)}
                    disconnect={disconnect}
                    ping={ping}
                />
            ) : (
                <div className="disconnected">
                    <Card title="Canton dApp">
                        <p>Connect a Canton wallet to get started.</p>
                        <div className="actions">
                            <button
                                className="primary"
                                disabled={busy}
                                onClick={connect}
                            >
                                Connect wallet
                            </button>
                        </div>
                    </Card>
                </div>
            )}
            {error && (
                <p className="error" role="alert">
                    {error}
                </p>
            )}
        </main>
    )
}
