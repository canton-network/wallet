// Port + URL of the local TestToken registry that implements the four
// CIP-56 Token Standard off-ledger APIs (served by

import { defaultConfig as configV1 } from '@canton-network/example-test-token-v1-registry'
import { defaultConfig as configV2 } from '@canton-network/example-test-token-v2-registry'

const DEFAULT_REGISTRY_HOSTNAME = 'http://localhost'

const testTokenV1RegistryPort = parseInt(
    process.env['REGISTRY_V1_PORT'] ?? configV1.port.toString(),
    10
)

const testTokenV1RegistryHostname =
    process.env['REGISTRY_V1_HOSTNAME'] ?? DEFAULT_REGISTRY_HOSTNAME

export const TEST_TOKEN_V1_REGISTRY = {
    PORT: testTokenV1RegistryPort,
    URL: new URL(`${testTokenV1RegistryHostname}:${testTokenV1RegistryPort}`),
}

const testTokenV2RegistryPort = parseInt(
    process.env['REGISTRY_V2_PORT'] ?? configV2.port.toString(),
    10
)

const testTokenV2RegistryHostname =
    process.env['REGISTRY_V2_HOSTNAME'] ?? DEFAULT_REGISTRY_HOSTNAME

export const TEST_TOKEN_V2_REGISTRY = {
    PORT: testTokenV2RegistryPort,
    URL: new URL(`${testTokenV2RegistryHostname}:${testTokenV2RegistryPort}`),
}
