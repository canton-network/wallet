// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { PageHeader } from '@canton-network/core-wallet-ui-components/react'
import {
    getInstrumentKey,
    tokenQueryKeys,
    transferAmountError,
    useAggregatedHoldings,
    type AggregatedHolding,
    type TokenStandardVersion,
    type TokenWallet,
} from '@canton-network/core-wallet-ui-components/react/token'
import ArrowBack from '@mui/icons-material/ArrowBack'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Decimal } from 'decimal.js'
import { type SubmitEvent, useEffect, useMemo, useRef, useState } from 'react'

import type { PreparedTransfer } from '@/background/token/service.ts'
import { EXTENSION_ORIGIN } from '@/shared/auth-protocol.ts'
import { isNotSubmitted } from '@/shared/transfer-errors.ts'
import { ButtonLink } from '@/ui/components/ButtonLink.tsx'
import { PageLoader } from '@/ui/components/feedback.tsx'
import {
    tokenInstrumentsQuery,
    toTokenWallets,
} from '@/ui/features/assets/index.ts'
import { walletsQuery } from '@/ui/features/parties/index.ts'
import { TransactionReview } from '@/ui/features/transactions/index.ts'

import {
    discardTransfer,
    usePrepareTransfer,
    useSubmitTransfer,
} from './api.ts'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

/** A date as a `datetime-local` input value, in local time. */
function toLocalInput(date: Date): string {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    return local.toISOString().slice(0, 16)
}

function isPast(date: Date): boolean {
    return date.getTime() <= Date.now()
}

/** What the party can send: the transfer is from its basic account. */
function basicAvailable(holding: AggregatedHolding): string {
    return (
        holding.accountBalances.find((balance) => balance.isBasic)
            ?.availableAmount ?? '0'
    )
}

/**
 * Menu labels by instrument key. Registries don't make names or symbols
 * unique, so a label two instruments share also names the instrument.
 */
function instrumentLabels(
    holdings: readonly AggregatedHolding[]
): Map<string, string> {
    const label = ({ instrument }: AggregatedHolding) =>
        `${instrument!.name} (${instrument!.symbol})`
    const counts = new Map<string, number>()
    for (const holding of holdings) {
        counts.set(label(holding), (counts.get(label(holding)) ?? 0) + 1)
    }
    return new Map(
        holdings.map((holding) => [
            getInstrumentKey(holding.instrumentId),
            counts.get(label(holding))! > 1
                ? `${label(holding)}: ${holding.instrumentId.id} of ${holding.instrumentId.admin}`
                : label(holding),
        ])
    )
}

interface SendForm {
    sender: string
    instrumentKey: string
    amount: string
    receiver: string
    expiry: string
    memo: string
    version: TokenStandardVersion
}

/** A transfer the review step shows, with the names it needs. */
interface ReviewedTransfer {
    form: SendForm
    instrument: AggregatedHolding
    expiry: Date
}

export function SendPage() {
    const wallets = useQuery(walletsQuery())
    const tokenWallets = useMemo(
        () => toTokenWallets(wallets.data ?? []),
        [wallets.data]
    )
    const [draft, setDraft] = useState<ReviewedTransfer>()
    const [prepared, setPrepared] = useState<PreparedTransfer>()
    const [step, setStep] = useState<'form' | 'review' | 'sent' | 'unknown'>(
        'form'
    )
    const [unknownReason, setUnknownReason] = useState('')
    // A failure after which nothing was submitted, shown on the form.
    const [notSent, setNotSent] = useState<Error>()
    // Kept here, not in the review step: a wallets query error unmounts the
    // step, and it must not come back with a fresh claim while the transfer
    // is in flight.
    const prepareTransfer = usePrepareTransfer()
    const submitTransfer = useSubmitTransfer()
    const queryClient = useQueryClient()
    // Claimed on the click, before the pending state renders.
    const claimed = useRef(false)
    // The review the user hasn't answered, discarded if they leave. Once
    // confirmed it is left alone: a discard could remove it while it is
    // being signed.
    const openReview = useRef<string>(undefined)

    useEffect(
        () => () => {
            if (openReview.current) discardTransfer(openReview.current)
        },
        []
    )

    const review = (transfer: ReviewedTransfer) => {
        const { form, instrument, expiry } = transfer
        setDraft(transfer)
        setNotSent(undefined)
        submitTransfer.reset()
        prepareTransfer.mutate(
            {
                sender: form.sender,
                receiver: form.receiver,
                instrumentId: instrument.instrumentId,
                amount: form.amount,
                expiry: expiry.toISOString(),
                memo: form.memo || undefined,
                tokenStandardVersion: form.version,
            },
            {
                onSuccess: (transaction) => {
                    openReview.current = transaction.transactionId
                    setPrepared(transaction)
                    setStep('review')
                },
            }
        )
    }

    const reject = (transactionId: string) => {
        openReview.current = undefined
        discardTransfer(transactionId)
        setPrepared(undefined)
        setStep('form')
    }

    const confirm = (transactionId: string) => {
        if (claimed.current) return
        claimed.current = true
        openReview.current = undefined
        submitTransfer.mutate(transactionId, {
            onSuccess: () => setStep('sent'),
            onError: (error) => {
                if (isNotSubmitted(error)) {
                    setNotSent(error)
                    setPrepared(undefined)
                    setStep('form')
                    return
                }
                void queryClient.invalidateQueries({
                    queryKey: tokenQueryKeys.holdings.all,
                })
                void queryClient.invalidateQueries({
                    queryKey: tokenQueryKeys.pendingTransfers.all,
                })
                setUnknownReason(error.message)
                setStep('unknown')
            },
            onSettled: () => {
                claimed.current = false
            },
        })
    }

    return (
        <>
            <PageHeader heading="Send">
                <ButtonLink to="/assets" size="small" startIcon={<ArrowBack />}>
                    Assets
                </ButtonLink>
            </PageHeader>

            {wallets.isError ? (
                <Alert severity="error">
                    Couldn't load the parties. {wallets.error.message}
                </Alert>
            ) : wallets.isPending ? (
                <PageLoader />
            ) : tokenWallets.length === 0 ? (
                <Alert severity="info">You have no allocated parties.</Alert>
            ) : step === 'sent' ? (
                <Stack spacing={2}>
                    <Alert severity="success">
                        The transfer was executed. Until the receiver accepts
                        it, it is listed under your outgoing transfers.
                    </Alert>
                    <ButtonLink to="/transfers" variant="outlined">
                        Outgoing transfers
                    </ButtonLink>
                </Stack>
            ) : step === 'unknown' && prepared ? (
                <Stack spacing={2}>
                    <Alert severity="warning">
                        We couldn't confirm whether the transfer went through.{' '}
                        {unknownReason} Check your outgoing transfers and your
                        assets before you send it again.
                    </Alert>
                    <ButtonLink to="/transfers" variant="outlined">
                        Outgoing transfers
                    </ButtonLink>
                    <ButtonLink to="/assets" variant="outlined">
                        Assets
                    </ButtonLink>
                    <Button
                        variant="contained"
                        loading={submitTransfer.isPending}
                        onClick={() => confirm(prepared.transactionId)}
                    >
                        Check again
                    </Button>
                    <TransactionReview
                        transaction={{ ...prepared, origin: EXTENSION_ORIGIN }}
                    />
                </Stack>
            ) : step === 'review' && draft && prepared ? (
                <Review
                    transfer={draft}
                    prepared={prepared}
                    isSubmitting={submitTransfer.isPending}
                    onConfirm={() => confirm(prepared.transactionId)}
                    onReject={() => reject(prepared.transactionId)}
                />
            ) : prepareTransfer.isPending ? (
                <PageLoader />
            ) : (
                <TransferForm
                    wallets={tokenWallets}
                    initial={draft}
                    error={prepareTransfer.error ?? notSent}
                    onReview={review}
                />
            )}
        </>
    )
}

function TransferForm({
    wallets,
    initial,
    error,
    onReview,
}: {
    wallets: TokenWallet[]
    initial: ReviewedTransfer | undefined
    /** A failure after which nothing was submitted. */
    error: Error | null | undefined
    onReview: (transfer: ReviewedTransfer) => void
}) {
    const [form, setForm] = useState<SendForm>(
        () =>
            initial?.form ?? {
                sender: (wallets.find((w) => w.primary) ?? wallets[0]!).partyId,
                instrumentKey: '',
                amount: '',
                receiver: '',
                expiry: toLocalInput(new Date(Date.now() + SEVEN_DAYS_MS)),
                memo: '',
                version: 'v1',
            }
    )
    const [submitted, setSubmitted] = useState(false)
    // Set on submit, as the check depends on the time.
    const [expiryPassed, setExpiryPassed] = useState(false)
    const holdings = useAggregatedHoldings(form.sender)
    const registry = useQuery(tokenInstrumentsQuery())
    // Only instruments with registry metadata can be sent: the transfer is
    // built from it, and the amount is checked against its decimals.
    const instruments = useMemo(
        () =>
            holdings.instruments.filter(
                (holding) =>
                    holding.instrument &&
                    new Decimal(basicAvailable(holding)).gt(0)
            ),
        [holdings.instruments]
    )
    const labels = useMemo(() => instrumentLabels(instruments), [instruments])
    const instrument = instruments.find(
        (holding) =>
            getInstrumentKey(holding.instrumentId) === form.instrumentKey
    )
    const available = instrument ? basicAvailable(instrument) : '0'
    const amount = form.amount.trim()

    const expiry = new Date(form.expiry)
    const errors = {
        instrument: instrument ? undefined : 'Select an asset',
        amount: instrument
            ? transferAmountError(amount, {
                  available,
                  decimals: instrument.instrument!.decimals,
              })
            : undefined,
        receiver: form.receiver.trim() ? undefined : 'Enter the receiver',
        expiry:
            Number.isNaN(expiry.getTime()) || expiryPassed
                ? 'The expiry must be in the future'
                : undefined,
    }
    const shown = (error: string | undefined) => (submitted ? error : undefined)

    const update =
        (field: keyof SendForm) =>
        (event: { target: { value: string } }): void => {
            if (field === 'expiry') setExpiryPassed(false)
            setForm((current) => ({
                ...current,
                [field]: event.target.value,
                // Another party holds other assets.
                ...(field === 'sender' && { instrumentKey: '', amount: '' }),
            }))
        }

    const submit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault()
        setSubmitted(true)
        const passed = isPast(expiry)
        setExpiryPassed(passed)
        if (passed || Object.values(errors).some(Boolean) || !instrument) {
            return
        }
        onReview({
            form: {
                ...form,
                amount,
                receiver: form.receiver.trim(),
                memo: form.memo.trim(),
            },
            instrument,
            expiry,
        })
    }

    return (
        <Stack component="form" spacing={2} noValidate onSubmit={submit}>
            <TextField
                select
                label="From"
                value={form.sender}
                onChange={update('sender')}
            >
                {wallets.map((wallet) => (
                    <MenuItem key={wallet.partyId} value={wallet.partyId}>
                        {wallet.hint}
                    </MenuItem>
                ))}
            </TextField>
            {holdings.isError && (
                <Alert severity="error">
                    Couldn't load the holdings. {holdings.error?.message}
                </Alert>
            )}
            {registry.isError && (
                <Alert
                    severity="error"
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={() => void registry.refetch()}
                        >
                            Retry
                        </Button>
                    }
                >
                    {registry.data
                        ? "Couldn't refresh the registries' instruments, so the assets use the ones loaded before."
                        : "Couldn't load the registries' instruments, so no asset can be sent."}{' '}
                    {registry.error.message}
                </Alert>
            )}
            <TextField
                select
                label="Asset"
                value={instrument ? form.instrumentKey : ''}
                onChange={update('instrumentKey')}
                disabled={holdings.isLoading || instruments.length === 0}
                error={!!shown(errors.instrument)}
                helperText={
                    shown(errors.instrument) ??
                    (holdings.isLoading || registry.isPending
                        ? 'Loading assets…'
                        : instruments.length === 0 &&
                            !holdings.isError &&
                            registry.isSuccess
                          ? 'This party has no assets to send'
                          : undefined)
                }
            >
                {instruments.map((holding) => (
                    <MenuItem
                        key={getInstrumentKey(holding.instrumentId)}
                        value={getInstrumentKey(holding.instrumentId)}
                    >
                        {labels.get(getInstrumentKey(holding.instrumentId))}
                    </MenuItem>
                ))}
            </TextField>
            <TextField
                label="Amount"
                value={form.amount}
                onChange={update('amount')}
                inputMode="decimal"
                error={!!shown(errors.amount)}
                helperText={
                    shown(errors.amount) ??
                    (instrument &&
                        `Available: ${available} ${instrument.instrument!.symbol}`)
                }
            />
            <TextField
                label="Receiver party"
                value={form.receiver}
                onChange={update('receiver')}
                error={!!shown(errors.receiver)}
                helperText={shown(errors.receiver)}
            />
            <TextField
                label="Expires"
                type="datetime-local"
                value={form.expiry}
                onChange={update('expiry')}
                error={!!shown(errors.expiry)}
                helperText={
                    shown(errors.expiry) ??
                    'The receiver must accept the transfer by then'
                }
                slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
                label="Memo"
                value={form.memo}
                onChange={update('memo')}
                multiline
                minRows={2}
            />
            <RadioGroup row value={form.version} onChange={update('version')}>
                <FormControlLabel
                    value="v1"
                    control={<Radio />}
                    label="Token standard v1"
                />
                <FormControlLabel
                    value="v2"
                    control={<Radio />}
                    label="v2, if the registry supports it"
                />
            </RadioGroup>
            {error && (
                <Alert severity="error">
                    The transfer wasn't sent, so you can review it again.{' '}
                    {error.message}
                </Alert>
            )}
            <Button type="submit" variant="contained">
                Review
            </Button>
        </Stack>
    )
}

function Review({
    transfer: { form, instrument, expiry },
    prepared,
    isSubmitting,
    onConfirm,
    onReject,
}: {
    transfer: ReviewedTransfer
    prepared: PreparedTransfer
    isSubmitting: boolean
    onConfirm: () => void
    onReject: () => void
}) {
    const { name, symbol } = instrument.instrument!

    const rows: [string, string][] = [
        ['From', form.sender],
        ['To', form.receiver],
        ['Amount', `${form.amount} ${symbol} (${name})`],
        ['Instrument', instrument.instrumentId.id],
        ['Admin', instrument.instrumentId.admin],
        ['Expires', expiry.toLocaleString()],
        ['Memo', form.memo || '-'],
        ['Token standard', form.version],
    ]

    return (
        <Stack spacing={2}>
            <Typography variant="h6" component="h2">
                Review the transfer
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1}>
                    {rows.map(([label, value]) => (
                        <div key={label}>
                            <Typography variant="body2" color="text.secondary">
                                {label}
                            </Typography>
                            <Typography sx={{ wordBreak: 'break-all' }}>
                                {value}
                            </Typography>
                        </div>
                    ))}
                </Stack>
            </Paper>
            <Alert severity="info" sx={{ color: 'text.primary' }}>
                Approving signs this transaction as the sender and submits it to
                the ledger.
            </Alert>
            <TransactionReview
                transaction={{ ...prepared, origin: EXTENSION_ORIGIN }}
                actions={{
                    isApproving: isSubmitting,
                    isRejecting: false,
                    disabled: isSubmitting,
                    onApprove: onConfirm,
                    onReject,
                }}
            />
        </Stack>
    )
}
