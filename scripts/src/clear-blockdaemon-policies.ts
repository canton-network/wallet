// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { error, getArgValue } from './lib/utils.js'

// this clears policies, with each deployment blockdaemon re-enables them
const POLICY_IDS = [12, 29]

function getPolicyBaseUrl(apiUrl: string): string {
    const normalizedUrl = apiUrl.replace(/\/+$/, '')
    const suffix = '/api/cwp/canton'

    return normalizedUrl.endsWith(suffix)
        ? normalizedUrl.slice(0, -suffix.length)
        : normalizedUrl
}

async function clearPolicy(
    baseUrl: string,
    apiKey: string,
    policyId: number
): Promise<void> {
    const response = await fetch(`${baseUrl}/api/v2/policies/${policyId}`, {
        method: 'PUT',
        headers: {
            authorization: `Bearer ${apiKey}`,
            'content-type': 'application/json',
            'x-api-version': '2.0',
        },
        body: JSON.stringify({
            entries: [],
            skipConfirmations: true,
        }),
    })

    if (!response.ok) {
        const responseBody = await response.text()

        throw new Error(
            `Failed to clear policy ${policyId}: ` +
                `${response.status} ${response.statusText}\n${responseBody}`
        )
    }

    console.log(`Policy ${policyId} cleared successfully.`)
}

async function main(): Promise<void> {
    const apiUrl = getArgValue('url')
    const apiKey = getArgValue('key')
    if (!apiUrl || !apiKey) throw new Error('Missing --url or --key param')

    const policyBaseUrl = getPolicyBaseUrl(apiUrl)

    for (const policyId of POLICY_IDS) {
        await clearPolicy(policyBaseUrl, apiKey, policyId).catch((e) => {
            // Don't stop on error. Error responses may occur if policy is already removed.
            console.error(error(e.message || e))
        })
    }
}

main().catch((e) => {
    console.error(error(e.message || e))
    process.exit(1)
})
