// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    canAct,
    useIncomingTransfers,
    type IncomingTransfer,
} from '@canton-network/core-wallet-ui-components/react/token'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

import { partyLabel } from './party-label.ts'
import { PartyTransfersPage, TransferList } from './PartyTransfers.tsx'
import { TransferChoiceDialog } from './TransferChoiceDialog.tsx'
import { useHasExpired } from './useHasExpired.ts'
import { useSymbol } from './useSymbol.ts'

type IncomingChoice = 'Accept' | 'Reject'

export function IncomingTransfersPage() {
    return (
        <PartyTransfersPage heading="Incoming transfers">
            {(partyId) => <Transfers partyId={partyId} />}
        </PartyTransfersPage>
    )
}

function Transfers({ partyId }: { partyId: string }) {
    const incoming = useIncomingTransfers(partyId)
    const [choosing, setChoosing] = useState<{
        transfer: IncomingTransfer
        choice: IncomingChoice
    }>()

    return (
        <>
            <TransferList
                pending={incoming}
                waitingFor="your party to accept them"
            >
                {(transfer, actionable) => (
                    <TransferCard
                        key={transfer.contractId}
                        partyId={partyId}
                        transfer={transfer}
                        actionable={actionable}
                        onChoose={(choice) => setChoosing({ transfer, choice })}
                    />
                )}
            </TransferList>
            {choosing && (
                <TransferChoiceDialog
                    partyId={partyId}
                    transfer={choosing.transfer}
                    choice={choosing.choice}
                    onClose={() => setChoosing(undefined)}
                />
            )}
        </>
    )
}

function TransferCard({
    partyId,
    transfer,
    actionable,
    onChoose,
}: {
    partyId: string
    transfer: IncomingTransfer
    actionable: boolean
    onChoose: (choice: IncomingChoice) => void
}) {
    const symbol = useSymbol(transfer)
    const expired = useHasExpired(transfer.executeBefore)
    const canAccept = actionable && canAct(partyId, transfer, 'Accept')
    const canReject = actionable && canAct(partyId, transfer, 'Reject')
    // An expired transfer can no longer be accepted, but rejecting it still
    // returns the amount to the sender.
    const choices: IncomingChoice[] = [
        ...(canAccept && !expired ? (['Accept'] as const) : []),
        ...(canReject ? (['Reject'] as const) : []),
    ]

    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="subtitle1" component="h2">
                    {transfer.amount} {symbol}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    From {partyLabel(transfer.sender)}
                </Typography>
                {transfer.memo !== '' && (
                    <Typography
                        variant="body2"
                        sx={{ wordBreak: 'break-word' }}
                    >
                        {transfer.memo}
                    </Typography>
                )}
                {expired ? (
                    <Typography variant="body2" color="warning.main">
                        Expired
                    </Typography>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        Expires{' '}
                        {new Date(transfer.executeBefore).toLocaleString()}
                    </Typography>
                )}
                {choices.length > 0 ? (
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        {choices.map((choice) => (
                            <Button
                                key={choice}
                                size="small"
                                onClick={() => onChoose(choice)}
                            >
                                {choice}
                            </Button>
                        ))}
                    </Stack>
                ) : (
                    actionable &&
                    !canAccept &&
                    !canReject && (
                        <Typography variant="body2" color="text.secondary">
                            This transfer doesn't let your party accept or
                            reject it alone.
                        </Typography>
                    )
                )}
            </CardContent>
        </Card>
    )
}
