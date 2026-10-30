// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readFileSync, existsSync } from 'fs'
import { type Config, type RawConfig, rawConfigSchema } from './Config.js'
import type { ServerNotices } from '../notices/server-notices.js'
import { Env } from '../env.js'
import { resolveAuthIdentityProviderId } from '@canton-network/core-wallet-auth'

export interface LoadedConfig {
    config: Config
    // The config as written in the config file, with inline secrets redacted
    displayConfig: Record<string, unknown>
}

export class ConfigUtils {
    /**
     * Loads and validates the config file. Invalid configs throw, while
     * configs that work but need attention are reported to `notices`.
     */
    static loadConfigFile(
        filePath: string,
        notices?: ServerNotices
    ): LoadedConfig {
        if (!existsSync(filePath)) {
            throw new Error("Supplied file path doesn't exist " + filePath)
        }
        return ConfigUtils.parseConfig(
            JSON.parse(readFileSync(filePath, 'utf-8')),
            notices
        )
    }

    static parseConfig(json: unknown, notices?: ServerNotices): LoadedConfig {
        const rawConfig = rawConfigSchema.parse(json)
        if (notices) {
            reportConfigNotices(rawConfig, notices)
        }
        return {
            config: resolveConfig(rawConfig),
            displayConfig: toDisplayConfig(rawConfig),
        }
    }
}

// Config fields that can hold a secret written directly into the config file.
// The postgres connection passes unknown fields on to the driver, hence the
// driver's secret options are listed as well.
export const SECRET_CONFIG_KEYS = new Set([
    'clientSecret',
    'password',
    'connectionString',
    'key',
    'passphrase',
    'pfx',
])

function toDisplayConfig(rawConfig: RawConfig): Record<string, unknown> {
    return JSON.parse(
        JSON.stringify(rawConfig, (key, value) =>
            SECRET_CONFIG_KEYS.has(key) ? '*****' : value
        )
    )
}

function reportConfigNotices(rawConfig: RawConfig, notices: ServerNotices) {
    if (rawConfig.server.host !== undefined) {
        notices.report({
            id: 'deprecated-config:server.host',
            severity: 'warning',
            message:
                'server.host has no effect, the Wallet Gateway always binds to the local network interface. Remove server.host from the config file.',
        })
    }

    if (rawConfig.server.tls !== undefined) {
        notices.report({
            id: 'deprecated-config:server.tls',
            severity: 'warning',
            message:
                'server.tls has no effect, TLS has to be terminated in front of the Wallet Gateway, e.g. by a load balancer. Remove server.tls from the config file.',
        })
    }

    const stores = [
        ['store', rawConfig.store],
        ['signingStore', rawConfig.signingStore],
    ] as const
    for (const [name, store] of stores) {
        if (
            store?.connection.type === 'postgres' &&
            'password' in store.connection
        ) {
            reportInlineSecret(
                notices,
                `${name}.connection.password`,
                'passwordEnv'
            )
        }
    }

    rawConfig.bootstrap.networks.forEach((network, index) => {
        const auths = {
            auth: network.auth,
            adminAuth: network.adminAuth,
            serviceAccountAuth: network.serviceAccountAuth,
        }
        for (const [name, auth] of Object.entries(auths)) {
            if (auth && 'clientSecret' in auth) {
                reportInlineSecret(
                    notices,
                    `bootstrap.networks[${index}].${name}.clientSecret`,
                    'clientSecretEnv'
                )
            }
        }
    })
}

function reportInlineSecret(
    notices: ServerNotices,
    path: string,
    envField: string
) {
    notices.report({
        id: `inline-secret:${path}`,
        severity: 'warning',
        message: `${path} is written in the config file. Prefer ${envField} so the secret comes from the environment (or a Kubernetes secret) rather than the config file: replace ${path} with ${envField}, set to the name of the environment variable that holds the secret.`,
    })
}

function resolveConfig(rawConfig: RawConfig): Config {
    const config = resolveRawConfig(rawConfig)

    /**
     * Perform extra config validation beyond schema validation.
     * We want to enforce the following constraints:
     *
     * 1. IDP IDs are unique
     * 2. Network IDs are unique
     * 3. Self-issued network audiences are unique
     * 4. Each Network's identityProviderId maps to an existing IDP (in config)
     * 5. Each Network's auth method is compatible with its IDP type
     */
    const duplicateIdpId = hasDuplicateElement(
        config.bootstrap.idps.map((idp) => idp.id)
    )
    if (duplicateIdpId) {
        throw new Error(
            `Non-unique IDP IDs found in config file: ${duplicateIdpId}`
        )
    }

    const duplicateNetworkId = hasDuplicateElement(
        config.bootstrap.networks.map((network) => network.id)
    )
    if (duplicateNetworkId) {
        throw new Error(
            `Non-unique Network IDs found in config file: ${duplicateNetworkId}`
        )
    }

    const duplicateSelfIssuedAudience = hasDuplicateElement(
        config.bootstrap.networks
            .filter((network) => network.auth.method === 'self_issued')
            .map((network) => network.auth.audience)
    )
    if (duplicateSelfIssuedAudience) {
        throw new Error(
            `Non-unique self-issued audience found in config file: ${duplicateSelfIssuedAudience}`
        )
    }

    const invalidMapping = validateNetworkToIdpMapping(config)
    if (invalidMapping) {
        throw new Error(
            `Network ${invalidMapping.networkId} references unknown Identity Provider ID ${invalidMapping.idpId}`
        )
    }

    const invalidAuthMethod = validateNetworkAuthMethods(config)
    if (invalidAuthMethod) {
        throw new Error(
            `Network ${invalidAuthMethod.networkId} has invalid auth method ${invalidAuthMethod.invalidAuthMethod} for its Identity Provider`
        )
    }

    return config
}

type RawNetworkAuth = NonNullable<
    RawConfig['bootstrap']['networks'][number]['adminAuth']
>
type NetworkAuth = NonNullable<
    Config['bootstrap']['networks'][number]['adminAuth']
>

// The Wallet Gateway can accept adminAuth secrets from environment variables.
// However, the store expects strings. This function resolves the config from env vars
function resolveRawNetworkAuth(n: RawNetworkAuth): NetworkAuth {
    if (n.method === 'authorization_code' || n.method === 'self_issued') {
        return n
    }

    if ('clientSecret' in n) {
        return n
    } else {
        const { clientSecretEnv, ...rest } = n
        const clientSecret = Env.get(clientSecretEnv, { required: true })
        return {
            ...rest,
            clientSecret,
        }
    }
}

function resolvePostgressPassword(s: RawConfig['store']): Config['store'] {
    if (s.connection.type !== 'postgres') {
        return s
    }

    if ('password' in s.connection) {
        return s
    } else {
        const { passwordEnv, ...rest } = s.connection
        const password = Env.get(passwordEnv, { required: true })
        return {
            ...s,
            connection: {
                ...rest,
                password,
            },
        }
    }
}

function resolveRawConfig(rawConfig: RawConfig): Config {
    const rawNetworks = rawConfig.bootstrap.networks
    const networks: Config['bootstrap']['networks'] = rawNetworks.map((n) => {
        return {
            ...n,
            auth: resolveRawNetworkAuth(n.auth),
            adminAuth: n.adminAuth
                ? resolveRawNetworkAuth(n.adminAuth)
                : undefined,
            serviceAccountAuth: n.serviceAccountAuth
                ? resolveRawNetworkAuth(n.serviceAccountAuth)
                : undefined,
        }
    })

    const store: Config['store'] = resolvePostgressPassword(rawConfig.store)

    const signingStore: Config['signingStore'] = rawConfig.signingStore
        ? resolvePostgressPassword(rawConfig.signingStore)
        : undefined

    return {
        ...rawConfig,
        store,
        signingStore,
        bootstrap: {
            ...rawConfig.bootstrap,
            networks,
        },
    }
}

function hasDuplicateElement(list: string[]): string | undefined {
    let duplicate: string | undefined
    list.forEach((item, i) => {
        if (list.indexOf(item) !== i && duplicate === undefined) {
            duplicate = item
        }
    })
    return duplicate
}

function validateNetworkToIdpMapping(
    config: Config
): { networkId: string; idpId: string } | undefined {
    for (const network of config.bootstrap.networks) {
        const authConfigurations = [
            network.auth,
            network.adminAuth,
            network.serviceAccountAuth,
        ].filter((auth) => auth !== undefined)
        const idpIds = new Set([
            network.identityProviderId,
            ...authConfigurations.flatMap((auth) =>
                auth.method === 'client_credentials' && auth.identityProviderId
                    ? [auth.identityProviderId]
                    : []
            ),
        ])

        for (const idpId of idpIds) {
            const idp = config.bootstrap.idps.find((idp) => idp.id === idpId)

            if (typeof idp === 'undefined') {
                return { networkId: network.id, idpId }
            }
        }
    }
}

const SUPPORTED_IDP_METHODS = {
    self_signed: ['self_signed'],
    self_issued: ['self_issued'],
    oauth: ['authorization_code', 'client_credentials'],
}

function validateNetworkAuthMethods(
    config: Config
): { networkId: string; invalidAuthMethod: string } | undefined {
    for (const network of config.bootstrap.networks) {
        const networkAuthIdpId = resolveAuthIdentityProviderId(
            network.auth,
            network.identityProviderId
        )
        const networkAuthIdp = config.bootstrap.idps.find(
            (idp) => idp.id === networkAuthIdpId
        )!

        if (
            !SUPPORTED_IDP_METHODS[networkAuthIdp.type].includes(
                network.auth.method
            )
        ) {
            return {
                networkId: network.id,
                invalidAuthMethod: network.auth.method,
            }
        }

        for (const auth of [network.adminAuth, network.serviceAccountAuth]) {
            if (
                auth?.method === 'client_credentials' &&
                auth.identityProviderId
            ) {
                const idp = config.bootstrap.idps.find(
                    (idp) => idp.id === auth.identityProviderId
                )!
                if (idp.type !== 'oauth') {
                    return {
                        networkId: network.id,
                        invalidAuthMethod: auth.method,
                    }
                }
            }
        }
    }
}

interface Urls {
    serviceUrl: string
    publicUrl: string
    dappApiUrl: string
    userApiUrl: string
}

// Strips duplicate slashes from a URL, except for the protocol part (e.g., "http://")
function stripDuplicateSlashes(path: string): string {
    return path.replace(/(https?:\/\/)|(\/)+/g, '$1$2')
}

export const deriveUrls = (config: Config, port?: number): Urls => {
    const serviceUrl = `http://localhost:${port || config.server.port}`
    const publicUrl = config.kernel.publicUrl || serviceUrl

    const dappApiUrl = stripDuplicateSlashes(
        `${publicUrl}/${config.server.dappPath}`
    )

    const userApiUrl = stripDuplicateSlashes(
        `${publicUrl}/${config.server.userPath}`
    )

    return { dappApiUrl, userApiUrl, publicUrl, serviceUrl }
}
