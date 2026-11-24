<script setup lang="ts">
// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

defineProps<{ title: string }>()
</script>

<template>
    <div class="card">
        <h1>{{ title }}</h1>
        <div><slot /></div>
    </div>
</template>
