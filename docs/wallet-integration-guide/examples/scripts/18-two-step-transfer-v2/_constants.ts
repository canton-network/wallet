// Port + URL of the local TestToken registry that implements the four
// CIP-56 Token Standard off-ledger APIs (served by

import { defaultConfig } from '@canton-network/example-test-token-v2-registry'

// `@canton-network/example-test-token-v1-registry`).
export const TEST_TOKEN_REGISTRY_PORT = parseInt(
    process.env['REGISTRY_PORT'] ?? defaultConfig.port.toString(),
    10
)
export const TEST_TOKEN_REGISTRY_URL = new URL(
    `http://localhost:${TEST_TOKEN_REGISTRY_PORT}`
)
