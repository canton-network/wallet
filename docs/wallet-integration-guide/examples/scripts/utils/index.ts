import { JSContractEntry } from '@canton-network/core-ledger-client'
import type { Provider as Ops } from '@canton-network/core-ledger-client-types'
import {
    TokenProviderConfig,
    localNetStaticConfig,
    TokenConfig,
    AmuletConfig,
    AssetConfig,
} from '@canton-network/wallet-sdk'

export {
    logAllContracts,
    type ContractReadSpec as ContractSpec,
} from './acs-logger.js'
export function getActiveContractCid(entry: JSContractEntry) {
    if ('JsActiveContract' in entry) {
        return entry.JsActiveContract.createdEvent.contractId
    }
}

/** Maps the two synchronizer roles used in multi-synchronizer setups. */
export type KnownSynchronizers = {
    globalSynchronizerId: string
    appSynchronizerId: string
}

/**
 * Resolve the global synchronizer ID from the list returned by the ledger API.
 *
 * Looks for the entry whose alias is `'global'` and returns its synchronizer ID.
 * `synchronizers` is the `connectedSynchronizers` array from the Ledger API
 * `GET /v2/state/connected-synchronizers` method
 * ({@link Ops.GetV2StateConnectedSynchronizers}), exposed via the SDK as
 * `sdk.ledger.connectedSynchronizers()`.
 *
 * @throws {Error} When no entry with alias `'global'` is present.
 */
export function resolveGlobalSynchronizerId(
    synchronizers: NonNullable<
        Ops.GetV2StateConnectedSynchronizers['ledgerApi']['result']['connectedSynchronizers']
    >
): string {
    const global = synchronizers.find((s) => s.synchronizerAlias === 'global')
    if (!global) throw new Error('Global synchronizer not found')
    return global.synchronizerId
}

export const TOKEN_PROVIDER_CONFIG_DEFAULT: TokenProviderConfig = {
    method: 'self_signed',
    issuer: 'unsafe-auth',
    credentials: {
        clientId: localNetStaticConfig.LOCALNET_USER_ID,
        clientSecret: 'unsafe',
        audience: 'https://canton.network.global',
        scope: '',
    },
}
export const TOKEN_NAMESPACE_CONFIG: TokenConfig = {
    validatorUrl: localNetStaticConfig.LOCALNET_APP_VALIDATOR_URL,
    registries: [localNetStaticConfig.LOCALNET_REGISTRY_API_URL],
    auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
}

export const TOKEN_NAMESPACE_CONFIG_SIMPLE: TokenConfig = {
    registries: [localNetStaticConfig.LOCALNET_REGISTRY_API_URL],
    auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
}

export const AMULET_NAMESPACE_CONFIG: AmuletConfig = {
    validatorUrl: localNetStaticConfig.LOCALNET_APP_VALIDATOR_URL,
    scanApiUrl: localNetStaticConfig.LOCALNET_SCAN_API_URL,
    auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
    registryUrl: localNetStaticConfig.LOCALNET_REGISTRY_API_URL,
}

export const AMULET_NAMESPACE_CONFIG_SIMPLE: AmuletConfig = {
    scanApiUrl: localNetStaticConfig.LOCALNET_SCAN_API_URL,
    auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
    registryUrl: localNetStaticConfig.LOCALNET_REGISTRY_API_URL,
}

export const ASSET_CONFIG: AssetConfig = {
    registries: [localNetStaticConfig.LOCALNET_REGISTRY_API_URL],
    auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
}
