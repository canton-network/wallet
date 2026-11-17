import { parsePreparedTransaction } from '@canton-network/core-tx-visualizer'
import { popup } from '@canton-network/core-wallet-ui-components'
import * as sdk from '@canton-network/dapp-sdk'
import { useContext, useState } from 'react'

import {
    abortBongCommand,
    abortBongProposalCommand,
    abortCollapseCommand,
    abortExplodeCommand,
    abortMergeCommand,
    acceptBongProposalCommand,
    ackBongCommand,
    createBongProposalCommand,
    createPingCommand,
    exercisePongCommand,
    processCollapseCommand,
    processExplodeCommand,
    processMergeCommand,
} from '../commands/createPingCommand.ts'
import { ErrorContext } from '../ErrorContext.ts'
import { useTransactions } from '../hooks/useTransactions.ts'
import { prettyjson } from '../utils.ts'

export function LedgerSubmission(props: {
    primaryParty?: string
    ledgerApiVersion?: string
    connectResult?: sdk.dappAPI.ConnectResult
}) {
    const { setErrorMsg } = useContext(ErrorContext)
    const [loading, setLoading] = useState(false)
    const [previewInput, setPreviewInput] = useState('')

    const transactions = useTransactions(props.connectResult)
    const connected = props.connectResult?.isConnected ?? false

    function createPingContract() {
        setErrorMsg('')
        setLoading(true)

        sdk.prepareExecute(createPingCommand(props.primaryParty!))
            .then(() => {
                setLoading(false)
            })
            .catch((err) => {
                console.error('Error creating ping contract:', err)
                setLoading(false)
                setErrorMsg(
                    err instanceof Error ? err.message : JSON.stringify(err)
                )
            })
    }

    // Accepts the JSON response of /v2/interactive-submission/prepare, or the bare base64
    // preparedTransaction. Opens the approve page, which hashes the bytes and calls clearSign.
    async function openApprovePreview() {
        setErrorMsg('')
        const input = previewInput.trim()
        let tx = input
        if (input.startsWith('{')) {
            try {
                const response = JSON.parse(input) as {
                    preparedTransaction?: string
                }
                tx = response.preparedTransaction ?? ''
            } catch {
                setErrorMsg('The prepare response is not valid JSON.')
                return
            }
        }
        if (!tx) {
            setErrorMsg('No preparedTransaction to preview.')
            return
        }
        try {
            const status = await sdk.status()
            const userUrl = status.provider.userUrl
            if (!userUrl) {
                setErrorMsg('The wallet did not report its address.')
                return
            }
            const base = userUrl.replace(/\/login\/?$/, '')
            const fragment = new URLSearchParams({ preview: tx })
            popup.open(`${base}/approve/index.html#${fragment}`)
        } catch (err) {
            setErrorMsg(
                err instanceof Error ? err.message : JSON.stringify(err)
            )
        }
    }

    function createBongProposal() {
        setErrorMsg('')
        setLoading(true)

        sdk.prepareExecute(createBongProposalCommand(props.primaryParty!))
            .then(() => {
                setLoading(false)
            })
            .catch((err) => {
                console.error('Error creating bong proposal:', err)
                setLoading(false)
                setErrorMsg(
                    err instanceof Error ? err.message : JSON.stringify(err)
                )
            })
    }

    function createPingContractAndWait() {
        setErrorMsg('')
        setLoading(true)

        sdk.prepareExecuteAndWait(createPingCommand(props.primaryParty!))
            .then(() => {
                setLoading(false)
            })
            .catch((err) => {
                console.error('Error creating ping contract:', err)
                setLoading(false)
                setErrorMsg(
                    err instanceof Error ? err.message : JSON.stringify(err)
                )
            })
    }

    async function getByUpdateId(updateId: string) {
        const response = await sdk.ledgerApi({
            requestMethod: 'post',
            resource: `/v2/updates/update-by-id`,
            body: {
                updateId,
                updateFormat: {
                    includeTransactions: {
                        eventFormat: {
                            filtersByParty: {
                                [props.primaryParty!]: {
                                    cumulative: [
                                        {
                                            identifierFilter: {
                                                TemplateFilter: {
                                                    value: {
                                                        templateId:
                                                            '#canton-builtin-admin-workflow-ping:Canton.Internal.Ping:Ping',
                                                        includeInterfaceView: true,
                                                        includeCreatedEventBlob: true,
                                                    },
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                            verbose: false,
                        },
                        transactionShape: 'TRANSACTION_SHAPE_ACS_DELTA',
                    },
                },
            },
        })

        return response
    }

    async function createdBongContracts(updateId: string, entities: string[]) {
        const response = await sdk.ledgerApi({
            requestMethod: 'post',
            resource: `/v2/updates/update-by-id`,
            body: {
                updateId,
                updateFormat: {
                    includeTransactions: {
                        eventFormat: {
                            filtersByParty: {
                                [props.primaryParty!]: {
                                    cumulative: entities.map((entity) => ({
                                        identifierFilter: {
                                            TemplateFilter: {
                                                value: {
                                                    templateId: `#canton-builtin-admin-workflow-ping:Canton.Internal.Bong:${entity}`,
                                                    includeInterfaceView: true,
                                                    includeCreatedEventBlob: true,
                                                },
                                            },
                                        },
                                    })),
                                },
                            },
                            verbose: false,
                        },
                        transactionShape: 'TRANSACTION_SHAPE_ACS_DELTA',
                    },
                },
            },
        })
        const update = response.update
        if (!update || !('Transaction' in update)) {
            throw new Error('Expected transaction update')
        }
        const events = update.Transaction.value.events ?? []
        return events.flatMap(
            (event: {
                CreatedEvent?: { contractId: string; templateId: string }
            }) => {
                const created = event.CreatedEvent
                if (!created) return []
                return [created]
            }
        )
    }

    function contractsOf(
        created: { contractId: string; templateId: string }[],
        entity: string
    ) {
        const suffix = `:Canton.Internal.Bong:${entity}`
        return created
            .filter((contract) => contract.templateId.endsWith(suffix))
            .map((contract) => contract.contractId)
    }

    function exerciseBong(
        label: string,
        command: Parameters<typeof sdk.prepareExecute>[0]
    ) {
        setErrorMsg('')
        setLoading(true)
        sdk.prepareExecute(command)
            .then(() => {
                setLoading(false)
            })
            .catch((err) => {
                console.error(label, err)
                setLoading(false)
                setErrorMsg(
                    err instanceof Error ? err.message : JSON.stringify(err)
                )
            })
    }

    async function onBongChoice(
        label: string,
        updateId: string,
        entities: string[],
        commandFor: (
            created: { contractId: string; templateId: string }[]
        ) => Parameters<typeof sdk.prepareExecute>[0]
    ) {
        setErrorMsg('')
        setLoading(true)
        try {
            const created = await createdBongContracts(updateId, entities)
            exerciseBong(label, commandFor(created))
        } catch (err) {
            console.error(label, err)
            setLoading(false)
            setErrorMsg(
                err instanceof Error ? err.message : JSON.stringify(err)
            )
        }
    }

    function party() {
        const acting = props.primaryParty
        if (!acting) {
            throw new Error('No primary party')
        }
        return acting
    }

    function oneContract(
        created: { contractId: string; templateId: string }[],
        entity: string
    ) {
        const ids = contractsOf(created, entity)
        if (ids.length !== 1) {
            throw new Error(
                `Expected one ${entity} contract in the update, found ${ids.length}`
            )
        }
        return ids[0]!
    }

    function acceptBong(updateId: string) {
        return onBongChoice(
            'Accept bong',
            updateId,
            ['BongProposal'],
            (created) =>
                acceptBongProposalCommand(
                    oneContract(created, 'BongProposal'),
                    party()
                )
        )
    }

    function abortProposal(updateId: string) {
        return onBongChoice(
            'Abort bong proposal',
            updateId,
            ['BongProposal'],
            (created) =>
                abortBongProposalCommand(
                    oneContract(created, 'BongProposal'),
                    party()
                )
        )
    }

    function processExplode(updateId: string) {
        return onBongChoice(
            'Process explode',
            updateId,
            ['Explode'],
            (created) =>
                processExplodeCommand(oneContract(created, 'Explode'), party())
        )
    }

    function abortExplode(updateId: string) {
        return onBongChoice('Abort explode', updateId, ['Explode'], (created) =>
            abortExplodeCommand(oneContract(created, 'Explode'), party())
        )
    }

    function processMerge(updateId: string) {
        return onBongChoice(
            'Process merge',
            updateId,
            ['Merge', 'Collapse'],
            (created) => {
                const collapses = contractsOf(created, 'Collapse')
                if (collapses.length !== 2) {
                    throw new Error(
                        `Expected two Collapse contracts in the update, found ${collapses.length}`
                    )
                }
                return processMergeCommand(
                    oneContract(created, 'Merge'),
                    party(),
                    collapses[0]!,
                    collapses[1]!
                )
            }
        )
    }

    function abortMerge(updateId: string) {
        return onBongChoice('Abort merge', updateId, ['Merge'], (created) =>
            abortMergeCommand(oneContract(created, 'Merge'), party())
        )
    }

    function collapseChoice(updateId: string, index: number, abort: boolean) {
        const label = `${abort ? 'Abort' : 'Process'} collapse ${index + 1}`
        return onBongChoice(label, updateId, ['Collapse'], (created) => {
            const contractId = contractsOf(created, 'Collapse')[index]
            if (!contractId) {
                throw new Error(
                    `Expected a Collapse contract at index ${index}`
                )
            }
            const acting = party()
            return abort
                ? abortCollapseCommand(contractId, acting)
                : processCollapseCommand(contractId, acting)
        })
    }

    function ackBong(updateId: string) {
        return onBongChoice('Acknowledge bong', updateId, ['Bong'], (created) =>
            ackBongCommand(oneContract(created, 'Bong'))
        )
    }

    function abortBong(updateId: string) {
        return onBongChoice('Abort bong', updateId, ['Bong'], (created) =>
            abortBongCommand(oneContract(created, 'Bong'), party())
        )
    }

    async function exercisePong(updateId: string) {
        setErrorMsg('')
        setLoading(true)

        const responseByUpdateId = await getByUpdateId(updateId)
        const update = responseByUpdateId.update
        if (!update || !('Transaction' in update)) {
            throw new Error('Expected transaction update')
        }
        const contractId =
            update.Transaction.value.events[0].CreatedEvent.contractId
        sdk.prepareExecute(exercisePongCommand(contractId))
            .then(() => {
                setLoading(false)
            })
            .catch((err) => {
                console.error('Error exercising pong contract:', err)
                setLoading(false)
                setErrorMsg(
                    err instanceof Error ? err.message : JSON.stringify(err)
                )
            })
    }

    return (
        connected && (
            <div className="card">
                <h2>Ledger Submission</h2>
                <button
                    disabled={!props.primaryParty || loading}
                    onClick={createPingContract}
                >
                    create Ping contract
                </button>
                <button
                    disabled={!props.primaryParty || loading}
                    onClick={createPingContractAndWait}
                >
                    create Ping contract and wait
                </button>
                <textarea
                    rows={3}
                    placeholder="Prepare response JSON or base64 preparedTransaction"
                    value={previewInput}
                    onChange={(e) => setPreviewInput(e.target.value)}
                />
                <button
                    disabled={!connected || !previewInput.trim()}
                    onClick={openApprovePreview}
                >
                    preview on approve page
                </button>
                <button
                    disabled={!props.primaryParty || loading}
                    onClick={createBongProposal}
                >
                    create Bong proposal
                </button>
                {transactions.length > 0 && (
                    <div>
                        <p>Total transactions: {transactions.length}</p>
                        <div className="terminal-display">
                            <pre>
                                {transactions.map((msg) => {
                                    const preparedTransaction = (
                                        'preparedTransaction' in msg
                                            ? msg.preparedTransaction
                                            : ''
                                    ) as string

                                    const parsed =
                                        parsePreparedTransaction(
                                            preparedTransaction
                                        )
                                    return (
                                        <>
                                            {msg.status === 'executed' &&
                                                parsed.isCreate &&
                                                parsed.entityName ===
                                                    'Ping' && (
                                                    <button
                                                        onClick={() =>
                                                            exercisePong(
                                                                msg.payload
                                                                    .updateId
                                                            )
                                                        }
                                                    >
                                                        Exercise Pong
                                                    </button>
                                                )}
                                            {msg.status === 'executed' &&
                                                !parsed.choiceId &&
                                                parsed.entityName ===
                                                    'BongProposal' && (
                                                    <>
                                                        <button
                                                            disabled={loading}
                                                            onClick={() =>
                                                                acceptBong(
                                                                    msg.payload
                                                                        .updateId
                                                                )
                                                            }
                                                        >
                                                            Accept bong
                                                        </button>
                                                        <button
                                                            disabled={loading}
                                                            onClick={() =>
                                                                abortProposal(
                                                                    msg.payload
                                                                        .updateId
                                                                )
                                                            }
                                                        >
                                                            Abort bong proposal
                                                        </button>
                                                    </>
                                                )}
                                            {msg.status === 'executed' &&
                                                parsed.choiceId ===
                                                    'Accept' && (
                                                    <>
                                                        <button
                                                            disabled={loading}
                                                            onClick={() =>
                                                                processExplode(
                                                                    msg.payload
                                                                        .updateId
                                                                )
                                                            }
                                                        >
                                                            Process explode
                                                        </button>
                                                        <button
                                                            disabled={loading}
                                                            onClick={() =>
                                                                abortExplode(
                                                                    msg.payload
                                                                        .updateId
                                                                )
                                                            }
                                                        >
                                                            Abort explode
                                                        </button>
                                                    </>
                                                )}
                                            {msg.status === 'executed' &&
                                                parsed.choiceId ===
                                                    'ProcessExplode' && (
                                                    <>
                                                        <button
                                                            disabled={loading}
                                                            onClick={() =>
                                                                processMerge(
                                                                    msg.payload
                                                                        .updateId
                                                                )
                                                            }
                                                        >
                                                            Process merge
                                                        </button>
                                                        <button
                                                            disabled={loading}
                                                            onClick={() =>
                                                                abortMerge(
                                                                    msg.payload
                                                                        .updateId
                                                                )
                                                            }
                                                        >
                                                            Abort merge
                                                        </button>
                                                        <button
                                                            disabled={loading}
                                                            onClick={() =>
                                                                collapseChoice(
                                                                    msg.payload
                                                                        .updateId,
                                                                    0,
                                                                    false
                                                                )
                                                            }
                                                        >
                                                            Process collapse 1
                                                        </button>
                                                        <button
                                                            disabled={loading}
                                                            onClick={() =>
                                                                collapseChoice(
                                                                    msg.payload
                                                                        .updateId,
                                                                    1,
                                                                    false
                                                                )
                                                            }
                                                        >
                                                            Process collapse 2
                                                        </button>
                                                        <button
                                                            disabled={loading}
                                                            onClick={() =>
                                                                collapseChoice(
                                                                    msg.payload
                                                                        .updateId,
                                                                    0,
                                                                    true
                                                                )
                                                            }
                                                        >
                                                            Abort collapse 1
                                                        </button>
                                                        <button
                                                            disabled={loading}
                                                            onClick={() =>
                                                                collapseChoice(
                                                                    msg.payload
                                                                        .updateId,
                                                                    1,
                                                                    true
                                                                )
                                                            }
                                                        >
                                                            Abort collapse 2
                                                        </button>
                                                    </>
                                                )}
                                            {msg.status === 'executed' &&
                                                parsed.choiceId ===
                                                    'ProcessMerge' && (
                                                    <>
                                                        <button
                                                            disabled={loading}
                                                            onClick={() =>
                                                                ackBong(
                                                                    msg.payload
                                                                        .updateId
                                                                )
                                                            }
                                                        >
                                                            Ack bong
                                                        </button>
                                                        <button
                                                            disabled={loading}
                                                            onClick={() =>
                                                                abortBong(
                                                                    msg.payload
                                                                        .updateId
                                                                )
                                                            }
                                                        >
                                                            Abort bong
                                                        </button>
                                                    </>
                                                )}
                                            <p>{prettyjson(msg)}</p>
                                            <p>{prettyjson(parsed)}</p>
                                        </>
                                    )
                                })}
                            </pre>
                        </div>
                    </div>
                )}{' '}
            </div>
        )
    )
}
