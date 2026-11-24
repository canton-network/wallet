// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
    StatusEvent,
    TxChangedEvent,
    Wallet,
} from '@canton-network/dapp-sdk'
import type { ReactNode } from 'react'

export function Card({
    title,
    children,
}: {
    title: string
    children: ReactNode
}) {
    return (
        <div className="card">
            <h1>{title}</h1>
            <div>{children}</div>
        </div>
    )
}

type ConnectedProps = {
    status: StatusEvent
    accounts: Wallet[]
    transactions: TxChangedEvent[]
    busy: boolean
    openWallet: () => void
    disconnect: () => void
    ping: () => void
}

export function Connected({
    status,
    accounts,
    transactions,
    busy,
    openWallet,
    disconnect,
    ping,
}: ConnectedProps) {
    return (
        <div className="container">
            <Card title={`Welcome ${status.session?.userId ?? ''}`}>
                <dl>
                    <dt>Wallet</dt>
                    <dd>{status.provider.id ?? 'unknown'}</dd>
                    <dt>Network</dt>
                    <dd>{status.network?.networkId ?? 'unknown'}</dd>
                </dl>
                <div className="actions">
                    <button disabled={busy} onClick={openWallet}>
                        Open wallet
                    </button>
                    <button disabled={busy} onClick={disconnect}>
                        Disconnect
                    </button>
                    <button disabled={busy} onClick={ping}>
                        Ping
                    </button>
                </div>
            </Card>
            <div className="row">
                <Card title="Accounts">
                    {accounts.length ? (
                        <ul>
                            {accounts.map((account) => (
                                <li key={account.partyId}>
                                    <code>{account.partyId}</code>
                                    {account.primary && (
                                        <span className="badge">primary</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="muted">No accounts available.</p>
                    )}
                </Card>
                <Card title="Transactions">
                    <div className="transactions">
                        {transactions.length ? (
                            transactions.map((transaction, index) => (
                                <details key={transactions.length - index}>
                                    <summary>
                                        {transaction.commandId} -{' '}
                                        {transaction.status}
                                    </summary>
                                    <code>
                                        <pre>
                                            {JSON.stringify(
                                                transaction,
                                                undefined,
                                                4
                                            )}
                                        </pre>
                                    </code>
                                </details>
                            ))
                        ) : (
                            <p>No Transactions found.</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}
