<script setup lang="ts">
// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Card from './Card.vue'
import { useWallet } from './useWallet'

const {
    status,
    accounts,
    transactions,
    busy,
    error,
    connect,
    disconnect,
    openWallet,
    ping,
} = useWallet()
</script>

<template>
    <main>
        <div v-if="status?.connection.isConnected" class="container">
            <Card :title="`Welcome ${status.session?.userId ?? ''}`">
                <dl>
                    <dt>Wallet</dt>
                    <dd>{{ status.provider.id ?? 'unknown' }}</dd>
                    <dt>Network</dt>
                    <dd>{{ status.network?.networkId ?? 'unknown' }}</dd>
                </dl>
                <div class="actions">
                    <button :disabled="busy" @click="openWallet">
                        Open wallet
                    </button>
                    <button :disabled="busy" @click="disconnect">
                        Disconnect
                    </button>
                    <button :disabled="busy" @click="ping">Ping</button>
                </div>
            </Card>
            <div class="row">
                <Card title="Accounts">
                    <ul v-if="accounts?.length">
                        <li v-for="account in accounts" :key="account.partyId">
                            <code>{{ account.partyId }}</code>
                            <span v-if="account.primary" class="badge"
                                >primary</span
                            >
                        </li>
                    </ul>
                    <p v-else class="muted">No accounts available.</p>
                </Card>
                <Card title="Transactions">
                    <div class="transactions">
                        <details
                            v-for="(transaction, index) in transactions"
                            :key="transactions.length - index"
                        >
                            <summary>
                                {{ transaction.commandId }} -
                                <span>{{ transaction.status }}</span>
                            </summary>
                            <pre><code>{{ JSON.stringify(transaction, undefined, 4) }}</code></pre>
                        </details>
                        <p v-if="!transactions.length">
                            No Transactions found.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
        <div v-else class="disconnected">
            <Card title="Canton dApp">
                <p>Connect a Canton wallet to get started.</p>
                <div class="actions">
                    <button class="primary" :disabled="busy" @click="connect">
                        Connect wallet
                    </button>
                </div>
            </Card>
        </div>
        <p v-if="error" class="error" role="alert">{{ error }}</p>
    </main>
</template>
