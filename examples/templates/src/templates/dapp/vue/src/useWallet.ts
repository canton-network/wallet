// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Ping } from '@canton-network/core-splice-codegen'
import * as sdk from '@canton-network/dapp-sdk'
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'

function errorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String(error.message)
    }
    return String(error)
}

export function useWallet() {
    const status = shallowRef<sdk.StatusEvent | null>(null)
    const accounts = shallowRef<sdk.Wallet[] | null>(null)
    const transactions = shallowRef<sdk.TxChangedEvent[]>([])
    const running = ref(false)
    const error = ref('')
    const connected = computed(
        () => status.value?.connection.isConnected ?? false
    )
    const busy = computed(
        () => running.value || (connected.value && accounts.value === null)
    )

    let restoring = true
    onMounted(async () => {
        try {
            await sdk.init()
            if (restoring && sdk.getConnectedProvider()) {
                const restored = await sdk.status()
                if (restoring) status.value = restored
            }
        } catch (err) {
            if (restoring) error.value = errorMessage(err)
        }
    })
    onUnmounted(() => {
        restoring = false
    })

    watch(connected, async (isConnected, _, onCleanup) => {
        if (!isConnected) return
        const provider = sdk.getConnectedProvider()
        if (!provider) return

        let needsAccounts = true
        function onAccounts(next: sdk.Wallet[]) {
            needsAccounts = false
            accounts.value = next
        }
        function onStatus(next: sdk.StatusEvent) {
            status.value = next
            if (!next.connection.isConnected) {
                needsAccounts = false
                accounts.value = null
            }
        }
        function onTransaction(next: sdk.TxChangedEvent) {
            transactions.value = [next, ...transactions.value]
        }

        provider.on('statusChanged', onStatus)
        provider.on('accountsChanged', onAccounts)
        provider.on('txChanged', onTransaction)
        onCleanup(() => {
            needsAccounts = false
            provider.removeListener('statusChanged', onStatus)
            provider.removeListener('accountsChanged', onAccounts)
            provider.removeListener('txChanged', onTransaction)
        })

        try {
            const initial = await sdk.listAccounts()
            if (needsAccounts) onAccounts(initial)
        } catch (err) {
            if (needsAccounts) {
                accounts.value = []
                error.value = errorMessage(err)
            }
        }
    })

    async function run(action: () => Promise<unknown>) {
        running.value = true
        error.value = ''
        try {
            await action()
        } catch (err) {
            error.value = errorMessage(err)
        } finally {
            running.value = false
        }
    }

    function connect() {
        restoring = false
        return run(async () => {
            await sdk.connect()
            status.value = await sdk.status()
        })
    }

    function disconnect() {
        return run(async () => {
            await sdk.disconnect()
            status.value = null
            accounts.value = null
        })
    }

    function ping() {
        const partyId = accounts.value?.find(
            (account) => account.primary
        )?.partyId
        if (!partyId) return
        return run(() =>
            sdk.prepareExecute({
                commands: [Ping.commands.create.ping(partyId)],
            })
        )
    }

    return {
        status,
        accounts,
        transactions,
        busy,
        error,
        connect,
        disconnect,
        openWallet: () => run(sdk.open),
        ping,
    }
}
