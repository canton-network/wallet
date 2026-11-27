// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    canAct,
    useOutgoingTransfers,
    type OutgoingTransfer,
} from '@canton-network/core-wallet-ui-components/react/token'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

import { PartyTransfersPage, TransferList } from './PartyTransfers.tsx'
import { TransferChoiceDialog } from './TransferChoiceDialog.tsx'
import { useSymbol } from './useSymbol.ts'

export function OutgoingTransfersPage() {
    return (
        <PartyTransfersPage heading="Outgoing transfers">
            {(partyId) => <Transfers partyId={partyId} />}
        </PartyTransfersPage>
    )
}

function Transfers({ partyId }: { partyId: string }) {
    const outgoing = useOutgoingTransfers(partyId)
    const [withdrawing, setWithdrawing] = useState<OutgoingTransfer>()

    return (
        <>
            <TransferList pending={outgoing} waitingFor="their receiver">
                {(transfer) => (
                    <TransferCard
                        key={transfer.contractId}
                        transfer={transfer}
                        canWithdraw={canAct(partyId, transfer, 'Withdraw')}
                        onWithdraw={() => setWithdrawing(transfer)}
                    />
                )}
            </TransferList>
            {withdrawing && (
                <TransferChoiceDialog
                    partyId={partyId}
                    transfer={withdrawing}
                    choice="Withdraw"
                    onClose={() => setWithdrawing(undefined)}
                />
            )}
        </>
    )
}

function TransferCard({
    transfer,
    canWithdraw,
    onWithdraw,
}: {
    transfer: OutgoingTransfer
    canWithdraw: boolean
    onWithdraw: () => void
}) {
    const symbol = useSymbol(transfer)
    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="subtitle1" component="h2">
                    {transfer.amount} {symbol}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    To {transfer.receiver}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Expires {new Date(transfer.executeBefore).toLocaleString()}
                </Typography>
                {canWithdraw ? (
                    <Button size="small" sx={{ mt: 1 }} onClick={onWithdraw}>
                        Withdraw
                    </Button>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        This transfer doesn't let your party withdraw it alone.
                    </Typography>
                )}
            </CardContent>
        </Card>
    )
}
