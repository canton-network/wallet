import { useContext, useEffect, useState } from 'react'
import './App.css'
import * as sdk from '@canton-network/dapp-sdk'
import { useAccounts } from './hooks/useAccounts'
import { useConnect } from './hooks/useConnect'
import { Status } from './components/Status'
import { ErrorContext } from './ErrorContext'
import { LedgerQuery } from './components/LedgerQuery'
import { LedgerSubmission } from './components/LedgerSubmission'
import { Accounts } from './components/Accounts'
import { PostEvents } from './components/PostEvents'
import { WindowMessages } from './components/WindowMessages'
import { Signing } from './components/Signing'
import { useStatus } from './hooks/useStatus'
import Holdings from './components/Holdings'
import { ScopedToken } from './components/ScopedToken'

function App() {
    const { errorMsg, setErrorMsg } = useContext(ErrorContext)
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<string>('accounts')

    const { connect, disconnect, connectResult } = useConnect()

    const { status, statusEvent } = useStatus()

    const accounts = useAccounts(connectResult)
    const primaryParty = accounts?.find((w) => w.primary)?.partyId

    const [ledgerApiVersion, setLedgerApiVersion] = useState<string>()

    const isConnected = !!connectResult?.isConnected
    const tabs = [
        { id: 'accounts', label: 'Accounts', visible: isConnected },
        { id: 'holdings', label: 'Holdings', visible: isConnected },
        { id: 'postEvents', label: 'Post Events', visible: !!window.canton },
        { id: 'windowMessages', label: 'Window Messages', visible: true },
        { id: 'scopedToken', label: 'Scoped Token', visible: !isConnected },
        { id: 'ledgerQuery', label: 'Ledger Query', visible: isConnected },
        {
            id: 'ledgerSubmission',
            label: 'Ledger Submission',
            visible: isConnected,
        },
        { id: 'signing', label: 'Signing', visible: isConnected },
    ]

    // If active tab is not visible, select first the visible one
    const visibleTabs = tabs.filter((tab) => tab.visible)
    if (!visibleTabs.some((tab) => tab.id === activeTab)) {
        setActiveTab(visibleTabs[0].id)
    }

    useEffect(() => {
        if (connectResult?.isNetworkConnected) {
            void sdk
                .ledgerApi({
                    requestMethod: 'get',
                    resource: '/v2/version',
                })
                .then((result) => {
                    const version = result.version
                    setLedgerApiVersion(version)
                })
        }
    }, [connectResult])

    function handleConnect(params?: sdk.ConnectParams) {
        console.log('Connecting to Wallet...', params)
        setLoading(true)
        connect(params)
            .then(() => {
                setLoading(false)
                setErrorMsg('')
                void status()
            })
            .catch((err) => {
                console.log(err)
                setLoading(false)
                setErrorMsg(err instanceof Error ? err.message : String(err))
            })
    }

    return (
        <div>
            <h1>Example dApp</h1>
            <div className="card">
                <div
                    style={{
                        gap: '10px',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    {connectResult?.isConnected ? (
                        <button
                            data-testid="disconnect-wallet"
                            disabled={loading}
                            onClick={() => {
                                setLoading(true)
                                void disconnect().then(() => {
                                    setLoading(false)
                                })
                            }}
                        >
                            disconnect
                        </button>
                    ) : (
                        <button
                            data-testid="connect-wallet"
                            disabled={loading}
                            onClick={() => handleConnect()}
                        >
                            connect to Wallet
                        </button>
                    )}
                    <button
                        data-testid="open-wallet"
                        disabled={!connectResult?.isConnected || loading}
                        onClick={() => {
                            console.log('Opening to Wallet...')
                            void sdk.open()
                        }}
                    >
                        open Wallet
                    </button>
                </div>
                {loading && <p>Loading...</p>}
                {errorMsg && (
                    <p className="error">
                        <b>Error:</b> <i>{errorMsg}</i>
                    </p>
                )}
                <Status
                    status={statusEvent}
                    ledgerApiVersion={ledgerApiVersion}
                />
                <br />
            </div>

            <div className="tabs">
                <div className="tab-buttons">
                    {visibleTabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={activeTab === tab.id ? 'active' : ''}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="tab-content">
                    <div
                        style={{
                            display:
                                activeTab === 'accounts' ? 'block' : 'none',
                        }}
                    >
                        <Accounts connectResult={connectResult} />
                    </div>

                    <div
                        style={{
                            display:
                                activeTab === 'holdings' ? 'block' : 'none',
                        }}
                    >
                        <Holdings connectResult={connectResult} />
                    </div>
                    <div
                        style={{
                            display:
                                activeTab === 'postEvents' ? 'block' : 'none',
                        }}
                    >
                        <PostEvents connectResult={connectResult} />
                    </div>
                    <div
                        style={{
                            display:
                                activeTab === 'windowMessages'
                                    ? 'block'
                                    : 'none',
                        }}
                    >
                        <WindowMessages />
                    </div>
                    <div
                        style={{
                            display:
                                activeTab === 'scopedToken' ? 'block' : 'none',
                        }}
                    >
                        <ScopedToken
                            loading={loading}
                            onConnect={handleConnect}
                        />
                    </div>
                    <div
                        style={{
                            display:
                                activeTab === 'ledgerQuery' ? 'block' : 'none',
                        }}
                    >
                        <LedgerQuery
                            connectResult={connectResult}
                            primaryParty={primaryParty}
                            ledgerApiVersion={ledgerApiVersion}
                        />
                    </div>
                    <div
                        style={{
                            display:
                                activeTab === 'ledgerSubmission'
                                    ? 'block'
                                    : 'none',
                        }}
                    >
                        <LedgerSubmission
                            connectResult={connectResult}
                            primaryParty={primaryParty}
                            ledgerApiVersion={ledgerApiVersion}
                        />
                    </div>
                    <div
                        style={{
                            display: activeTab === 'signing' ? 'block' : 'none',
                        }}
                    >
                        <Signing connectResult={connectResult} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
