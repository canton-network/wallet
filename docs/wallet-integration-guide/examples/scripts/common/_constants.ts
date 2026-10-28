// Port + URL of the local TestToken registry that implements the four
// CIP-56 Token Standard off-ledger APIs (served by

import { defaultConfig as configV1 } from '@canton-network/example-test-token-v1-registry'
import { defaultConfig as configV2 } from '@canton-network/example-test-token-v2-registry'

export const TEST_TOKEN_V1_REGISTRY_PORT = parseInt(
    process.env['REGISTRY_V1_PORT'] ?? configV1.port.toString(),
    10
)

export const TEST_TOKEN_V2_REGISTRY_PORT = parseInt(
    process.env['REGISTRY_V2_PORT'] ?? configV2.port.toString(),
    10
)
