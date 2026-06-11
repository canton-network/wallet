import { JSContractEntry } from '@canton-network/core-ledger-client'
import {
    TokenProviderConfig,
    localNetStaticConfig,
} from '@canton-network/wallet-sdk'
import {
    TokenConfig,
    AmuletConfig,
    AssetConfig,
} from '@canton-network/wallet-sdk'

export { syncAlias, logAllContracts } from './acs-logger.js'
export type { ContractReadSpec as ContractSpec } from './acs-logger.js'
export function getActiveContractCid(entry: JSContractEntry) {
    if ('JsActiveContract' in entry) {
        return entry.JsActiveContract.createdEvent.contractId
    }
}

/** Maps the two synchronizer roles used in multi-synchronizer setups. */
export type SynchronizerMap = {
    globalSynchronizerId: string
    appSynchronizerId: string
}

/**
 * Returns the ID of the synchronizer aliased `'global'`.
 *
 * The wallet SDK no longer auto-selects a synchronizer, so client code (these
 * examples) resolves it explicitly and passes it to SDK calls that require one.
 * Resolution lives in the SDK (`sdk.ledger.getGlobalSynchronizerId`); this is a
 * thin convenience wrapper over it.
 */
export async function getGlobalSynchronizerId(sdk: {
    ledger: { getGlobalSynchronizerId(): Promise<string> }
}): Promise<string> {
    return sdk.ledger.getGlobalSynchronizerId()
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

export const AMULET_NAMESPACE_CONFIG: AmuletConfig = {
    validatorUrl: localNetStaticConfig.LOCALNET_APP_VALIDATOR_URL,
    scanApiUrl: localNetStaticConfig.LOCALNET_SCAN_API_URL,
    auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
    registryUrl: localNetStaticConfig.LOCALNET_REGISTRY_API_URL,
}

export const ASSET_CONFIG: AssetConfig = {
    registries: [localNetStaticConfig.LOCALNET_REGISTRY_API_URL],
    auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
}
