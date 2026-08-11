// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    GatewayClient,
    GatewayError,
    type GatewayAccount,
} from './gateway-client.js'

const BASE = 'http://gateway.test'

type RpcHandler = (method: string, params: unknown) => unknown // {result} | {error}

function rpcResponse(body: unknown, id: unknown) {
    return {
        ok: true,
        status: 200,
        json: async () => ({ jsonrpc: '2.0', id, ...(body as object) }),
        text: async () => '',
    }
}

/** Mock global fetch: routes /jsonrpc to `rpc`. */
function stubFetch(opts: { rpc?: RpcHandler }) {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
        if (url.endsWith('/jsonrpc')) {
            const req = JSON.parse(String(init?.body)) as {
                method: string
                params: unknown
                id: unknown
            }
            return rpcResponse(opts.rpc!(req.method, req.params), req.id)
        }
        throw new Error(`unexpected url ${url}`)
    })
    vi.stubGlobal('fetch', fetchMock)
    return fetchMock
}

afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
})

const account: GatewayAccount = {
    partyId: 'alice::ns1',
    status: 'allocated',
    prefix: 'alice',
    publicKey: 'pub-alice',
    namespace: 'ns1',
    networkId: 'canton:test',
    signingProviderId: 'taurus-protect',
}

describe('GatewayClient JSON-RPC', () => {
    it('connects lazily and lists accounts', async () => {
        const fetchMock = stubFetch({
            rpc: (method) => {
                if (method === 'connect')
                    return { result: { isConnected: true } }
                if (method === 'listAccounts') return { result: [account] }
                throw new Error(`unexpected ${method}`)
            },
        })
        const client = new GatewayClient({ baseUrl: BASE + '/', token: 't' })
        const accounts = await client.listAccounts()
        expect(accounts).toEqual([account])
        // connect (lazy) + listAccounts
        expect(fetchMock).toHaveBeenCalledTimes(2)
        // a second call reuses the session (no extra connect)
        await client.listAccounts()
        expect(fetchMock).toHaveBeenCalledTimes(3)
    })

    it('prepareExecute returns requestId and enables the RPC fallback', async () => {
        const fetchMock = stubFetch({
            rpc: (method) => {
                if (method === 'connect')
                    return { result: { isConnected: true } }
                if (method === 'prepareExecute')
                    return { result: { userUrl: 'u', requestId: '99' } }
                if (method === 'getTransactionStatus')
                    return { result: { status: 'pending' } }
                throw new Error(`unexpected ${method}`)
            },
        })
        const client = new GatewayClient({ baseUrl: BASE, token: 't' })
        const res = await client.prepareExecute({
            commands: [{ CreateCommand: {} }],
            actAs: ['alice::ns1'],
            commandId: 'cmd1',
        })
        expect(res.requestId).toBe('99')

        // getStatus has no cache → RPC fallback using the remembered requestId.
        const info = await client.getStatus('cmd1')
        expect(info).toEqual({ status: 'pending' })
        const statusCall = fetchMock.mock.calls.find(
            (c) =>
                String(
                    (
                        JSON.parse(String((c[1] as RequestInit).body)) as {
                            method: string
                        }
                    ).method
                ) === 'getTransactionStatus'
        )
        expect(statusCall).toBeDefined()
    })

    it('getStatus returns undefined when neither cache nor requestId is known', async () => {
        stubFetch({ rpc: () => ({ result: {} }) })
        const client = new GatewayClient({ baseUrl: BASE, token: 't' })
        expect(await client.getStatus('unknown')).toBeUndefined()
    })

    it('reconnects once on a 4900 (disconnected) and retries', async () => {
        let listCalls = 0
        const fetchMock = stubFetch({
            rpc: (method) => {
                if (method === 'connect')
                    return { result: { isConnected: true } }
                if (method === 'listAccounts') {
                    listCalls++
                    if (listCalls === 1)
                        return {
                            error: { code: 4900, message: 'disconnected' },
                        }
                    return { result: [account] }
                }
                throw new Error(`unexpected ${method}`)
            },
        })
        const client = new GatewayClient({ baseUrl: BASE, token: 't' })
        const accounts = await client.listAccounts()
        expect(accounts).toEqual([account])
        expect(listCalls).toBe(2)
        // connect, listAccounts(4900), connect(reconnect), listAccounts(ok)
        expect(fetchMock).toHaveBeenCalledTimes(4)
    })

    it('throws GatewayError carrying the JSON-RPC code (e.g. 4100 unauthorized)', async () => {
        stubFetch({
            rpc: (method) =>
                method === 'connect'
                    ? { error: { code: 4100, message: 'unauthorized' } }
                    : { result: {} },
        })
        const client = new GatewayClient({ baseUrl: BASE, token: 't' })
        await expect(client.listAccounts()).rejects.toMatchObject({
            name: 'GatewayError',
            code: 4100,
        })
    })

    it('throws GatewayError on a non-2xx HTTP response', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => ({
                ok: false,
                status: 502,
                statusText: 'Bad Gateway',
                text: async () => 'upstream down',
            }))
        )
        const client = new GatewayClient({ baseUrl: BASE, token: 't' })
        await expect(client.connect()).rejects.toBeInstanceOf(GatewayError)
    })

    it('rejects a connect that succeeds with isConnected:false', async () => {
        // Refusal arrives as a successful result, not an error.
        stubFetch({
            rpc: () => ({
                result: {
                    isConnected: false,
                    reason: 'authentication required',
                },
            }),
        })
        const client = new GatewayClient({ baseUrl: BASE, token: 't' })
        await expect(client.connect()).rejects.toMatchObject({
            name: 'GatewayError',
            message: expect.stringContaining('authentication required'),
        })
    })

    it('keeps polling an executed status until the updateId lands', async () => {
        let statusCalls = 0
        stubFetch({
            rpc: (method) => {
                if (method === 'connect')
                    return { result: { isConnected: true } }
                if (method === 'prepareExecute')
                    return { result: { userUrl: 'u', requestId: '99' } }
                if (method === 'getTransactionStatus') {
                    statusCalls++
                    // updateId lags: the first executed read has only contractId.
                    return statusCalls === 1
                        ? { result: { status: 'executed', contractId: 'c1' } }
                        : {
                              result: {
                                  status: 'executed',
                                  contractId: 'c1',
                                  updateId: 'u1',
                              },
                          }
                }
                throw new Error(`unexpected ${method}`)
            },
        })
        const client = new GatewayClient({ baseUrl: BASE, token: 't' })
        await client.prepareExecute({ commands: [], commandId: 'cmd1' })

        const first = await client.getStatus('cmd1')
        expect(first).toEqual({ status: 'executed', contractId: 'c1' })

        // Not complete without an updateId, so this must hit the network again.
        const second = await client.getStatus('cmd1')
        expect(second).toEqual({
            status: 'executed',
            contractId: 'c1',
            updateId: 'u1',
        })
        expect(statusCalls).toBe(2)

        // Now complete — further reads are served from cache.
        expect(await client.getStatus('cmd1')).toEqual(second)
        expect(statusCalls).toBe(2)
    })

    it('stops polling a failed status', async () => {
        let statusCalls = 0
        stubFetch({
            rpc: (method) => {
                if (method === 'connect')
                    return { result: { isConnected: true } }
                if (method === 'prepareExecute')
                    return { result: { userUrl: 'u', requestId: '99' } }
                if (method === 'getTransactionStatus') {
                    statusCalls++
                    return { result: { status: 'failed' } }
                }
                throw new Error(`unexpected ${method}`)
            },
        })
        const client = new GatewayClient({ baseUrl: BASE, token: 't' })
        await client.prepareExecute({ commands: [], commandId: 'cmd1' })
        await client.getStatus('cmd1')
        await client.getStatus('cmd1')
        expect(statusCalls).toBe(1)
    })

    /** Captures the params of the single prepareExecute call. */
    function stubPrepareExecute(requestId = '7') {
        const seen: { params?: Record<string, unknown> } = {}
        stubFetch({
            rpc: (method, params) => {
                if (method === 'connect')
                    return { result: { isConnected: true } }
                if (method === 'prepareExecute') {
                    seen.params = params as Record<string, unknown>
                    return { result: { userUrl: 'u', requestId } }
                }
                if (method === 'getTransactionStatus')
                    return { result: { status: 'pending' } }
                throw new Error(`unexpected ${method}`)
            },
        })
        return seen
    }

    it('sends a commandId even when the caller omits one, and reports it back', async () => {
        // The gateway forwards commandId as validatord's externalRequestId idempotency key;
        // without one it mints a fresh uuid per attempt and a retry double-submits.
        const seen = stubPrepareExecute()
        const client = new GatewayClient({ baseUrl: BASE, token: 't' })
        const res = await client.prepareExecute({ commands: [] })

        expect(res.commandId).toEqual(expect.any(String))
        expect(res.commandId).not.toHaveLength(0)
        expect(seen.params?.commandId).toBe(res.commandId)
        // Keyed off the effective id, so the status fallback works without the caller's help.
        expect(await client.getStatus(res.commandId)).toBeDefined()
    })

    it('keeps the caller-supplied commandId', async () => {
        const seen = stubPrepareExecute()
        const client = new GatewayClient({ baseUrl: BASE, token: 't' })
        const res = await client.prepareExecute({
            commands: [],
            commandId: 'cmd1',
        })
        expect(res.commandId).toBe('cmd1')
        expect(seen.params?.commandId).toBe('cmd1')
    })

    it('normalises a real token-standard command on the encoded path', async () => {
        // A registry templateId with no '#', plus a choiceArgument carrying
        // bare arrays and a bare null — untouched, the gateway rejects all
        // three before it ever looks at preparedTransaction.
        const seen = stubPrepareExecute()
        const client = new GatewayClient({ baseUrl: BASE, token: 't' })
        await client.prepareExecute({
            preparedTransaction: 'CgVoZWxsbw==',
            commands: [
                {
                    ExerciseCommand: {
                        templateId:
                            '6c5802f86709a0ad4784af81f0bab40f3070b2f58128d8843da1e1784c147802:Splice.AmuletRules:TransferPreapproval',
                        contractId: '00ab',
                        choice: 'TransferPreapproval_Renew',
                        choiceArgument: {
                            context: {
                                issuingMiningRounds: [],
                                featuredAppRight: null,
                            },
                            inputs: [{ tag: 'InputAmulet', value: 'cid1' }],
                        },
                    },
                },
            ],
        })

        expect(seen.params?.commands).toEqual([
            {
                ExerciseCommand: {
                    templateId:
                        '#6c5802f86709a0ad4784af81f0bab40f3070b2f58128d8843da1e1784c147802:Splice.AmuletRules:TransferPreapproval',
                    contractId: '00ab',
                    choice: 'TransferPreapproval_Renew',
                    choiceArgument: {},
                },
            },
        ])
        // The PTX carries the substance and must survive verbatim.
        expect(seen.params?.preparedTransaction).toBe('CgVoZWxsbw==')
    })

    it('leaves an already-#-prefixed templateId alone', async () => {
        const seen = stubPrepareExecute()
        const client = new GatewayClient({ baseUrl: BASE, token: 't' })
        await client.prepareExecute({
            preparedTransaction: 'CgVoZWxsbw==',
            commands: [
                {
                    CreateCommand: {
                        templateId: '#splice-amulet:Splice.AmuletRules:Amulet',
                        createArguments: { owner: 'alice::ns1' },
                    },
                },
            ],
        })
        expect(seen.params?.commands).toEqual([
            {
                CreateCommand: {
                    templateId: '#splice-amulet:Splice.AmuletRules:Amulet',
                    createArguments: {},
                },
            },
        ])
    })

    // The guard that stops this being dangerous: with no PTX the gateway takes the structured
    // path, where the arguments ARE the submission. Blanking them there would put an
    // argument-less contract in front of an approver.
    it('does NOT touch the command when there is no preparedTransaction', async () => {
        const original = {
            CreateCommand: {
                templateId: 'pkg:M:E',
                createArguments: { owner: 'alice::ns1' },
            },
        }
        for (const ptx of [undefined, '']) {
            const seen = stubPrepareExecute()
            const client = new GatewayClient({ baseUrl: BASE, token: 't' })
            await client.prepareExecute({
                commands: [original],
                ...(ptx === undefined ? {} : { preparedTransaction: ptx }),
            })
            expect(seen.params?.commands).toEqual([original])
        }
    })

    it('passes a non-array commands through so the gateway can reject it', async () => {
        const seen = stubPrepareExecute()
        const client = new GatewayClient({ baseUrl: BASE, token: 't' })
        await client.prepareExecute({
            commands: { CreateCommand: {} },
            preparedTransaction: 'CgVoZWxsbw==',
        })
        expect(seen.params?.commands).toEqual({ CreateCommand: {} })
    })

    it('names the commandId as retryable when prepareExecute fails', async () => {
        // The gateway submits before registering its poller, so a capacity rejection can arrive
        // with the request already live and its requestId discarded.
        stubFetch({
            rpc: (method) =>
                method === 'connect'
                    ? { result: { isConnected: true } }
                    : {
                          error: {
                              code: -32005,
                              message: 'max concurrent polls exceeded',
                          },
                      },
        })
        const client = new GatewayClient({ baseUrl: BASE, token: 't' })
        await expect(
            client.prepareExecute({ commands: [], commandId: 'cmd1' })
        ).rejects.toMatchObject({
            name: 'GatewayError',
            code: -32005,
            message: expect.stringContaining('cmd1 may already be submitted'),
        })
    })

    it('refuses a request over the gateway body limit instead of letting it truncate', async () => {
        // The gateway's io.LimitReader silently truncates past 1 MiB and the reply is a bare
        // -32700, so the size has to be caught here.
        const fetchMock = stubFetch({
            rpc: (method) =>
                method === 'connect'
                    ? { result: { isConnected: true } }
                    : { result: { userUrl: 'u', requestId: '7' } },
        })
        const client = new GatewayClient({ baseUrl: BASE, token: 't' })
        await expect(
            client.prepareExecute({
                commands: [],
                commandId: 'cmd1',
                preparedTransaction: 'A'.repeat((1 << 20) + 1),
            })
        ).rejects.toMatchObject({
            name: 'GatewayError',
            message: expect.stringContaining('over the gateway'),
        })
        // connect only — the oversized call never left the process.
        expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('rejects a prepareExecute reply without a numeric requestId', async () => {
        // Persisting a non-numeric id gets every later poll rejected.
        stubFetch({
            rpc: (method) =>
                method === 'connect'
                    ? { result: { isConnected: true } }
                    : { result: { userUrl: 'u' } },
        })
        const client = new GatewayClient({ baseUrl: BASE, token: 't' })
        await expect(
            client.prepareExecute({ commands: [], commandId: 'cmd1' })
        ).rejects.toMatchObject({ name: 'GatewayError' })
    })

    it('throws GatewayError (not SyntaxError) on a non-JSON 2xx body', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => ({
                ok: true,
                status: 200,
                statusText: 'OK',
                json: async () => {
                    throw new SyntaxError("Unexpected token '<'")
                },
                text: async () => '<html>proxy</html>',
            }))
        )
        const client = new GatewayClient({ baseUrl: BASE, token: 't' })
        await expect(client.connect()).rejects.toBeInstanceOf(GatewayError)
    })

    it('surfaces a timed-out request as a GatewayError', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => {
                const err = new Error('The operation was aborted')
                err.name = 'TimeoutError'
                throw err
            })
        )
        const client = new GatewayClient(
            { baseUrl: BASE, token: 't' },
            { timeoutMs: 5 }
        )
        await expect(client.connect()).rejects.toMatchObject({
            name: 'GatewayError',
            message: expect.stringContaining('no response within 5ms'),
        })
    })

    it('reconnects when the session is lost via HTTP 401', async () => {
        let calls = 0
        vi.stubGlobal(
            'fetch',
            vi.fn(async (_url: string, init?: RequestInit) => {
                const method = (
                    JSON.parse(String(init?.body)) as { method: string }
                ).method
                if (method === 'connect') {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => ({ result: { isConnected: true } }),
                        text: async () => '',
                    }
                }
                calls++
                if (calls === 1) {
                    return {
                        ok: false,
                        status: 401,
                        statusText: 'Unauthorized',
                        text: async () => 'session expired',
                    }
                }
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({ result: [account] }),
                    text: async () => '',
                }
            })
        )
        const client = new GatewayClient({ baseUrl: BASE, token: 't' })
        await expect(client.listAccounts()).resolves.toEqual([account])
        expect(calls).toBe(2)
    })
})
