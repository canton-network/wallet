// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    AuthContext,
    AuthService,
    Idp,
    SelfSignedAuth,
    resolveUserEmail,
} from '@canton-network/core-wallet-auth'
import { Network, Store } from '@canton-network/core-wallet-store'
import { createRemoteJWKSet, decodeJwt, jwtVerify, JWTPayload } from 'jose'
import { Logger } from 'pino'

function getEmail(value: unknown): string | undefined {
    if (typeof value !== 'string' || value.length === 0) {
        return undefined
    }

    return value
}

// TODO maybe share this util with addSession instead of copy paste?
function normalizeAudienceClaim(value: JWTPayload['aud']): string[] {
    if (typeof value === 'string') {
        return [value]
    }

    if (Array.isArray(value)) {
        return value
    }

    return []
}

function isSelfSignedNetwork(
    network: Network
): network is Network & { auth: SelfSignedAuth } {
    return network.auth.method === 'self_signed'
}

async function verifySelfSignedToken(
    jwt: string,
    decoded: JWTPayload,
    idp: Extract<Idp, { type: 'self_signed' }>,
    store: Store,
    logger: Logger
): Promise<AuthContext | undefined> {
    const tokenAudiences = normalizeAudienceClaim(decoded.aud)
    if (tokenAudiences.length === 0) {
        logger.warn('JWT does not contain an audience claim')
        return undefined
    }

    const networks = await store.listNetworks()
    const candidates = networks.filter(
        (network): network is Network & { auth: SelfSignedAuth } =>
            isSelfSignedNetwork(network) &&
            network.identityProviderId === idp.id &&
            tokenAudiences.includes(network.auth.audience)
    )

    if (candidates.length === 0) {
        logger.warn(
            {
                tokenAudiences,
                idpId: idp.id,
            },
            'No self-signed networks match the JWT audience'
        )
        return undefined
    }

    for (const network of candidates) {
        try {
            const { payload } = await jwtVerify(
                jwt,
                new TextEncoder().encode(network.auth.clientSecret),
                {
                    algorithms: ['HS256'],
                    issuer: idp.issuer,
                    audience: network.auth.audience,
                }
            )

            if (!payload.sub) {
                logger.warn('JWT does not contain a subject')
                return undefined
            }

            const email = getEmail(payload.email)
            return {
                userId: payload.sub,
                accessToken: jwt,
                ...(email ? { email } : {}),
            }
        } catch {
            // Token may belong to another candidate that shares this audience.
        }
    }

    logger.warn(
        {
            tokenAudiences,
            candidateNetworkIds: candidates.map((network) => network.id),
        },
        'Failed to verify self-signed JWT against any matching network secret'
    )
    return undefined
}

/**
 * Creates an AuthService that verifies JWT tokens using a remote JWK set.
 * @param store - The Store instance to access network configurations.
 * @param logger - Logger instance for logging debug and warning messages.
 * @returns An AuthService implementation that verifies JWT tokens.
 */
export const jwtAuthService = (store: Store, logger: Logger): AuthService => ({
    verifyToken: async (accessToken?: string) => {
        if (!accessToken || !accessToken.startsWith('Bearer ')) {
            return undefined
        }

        const jwt = accessToken.split(' ')[1]
        logger.debug({ jwt }, 'Verifying JWT token')

        try {
            const decoded = decodeJwt(jwt)
            const iss = decoded.iss
            if (!iss) {
                logger.warn('JWT does not contain an issuer')
                return undefined
            }

            const idps = await store.listIdps()
            const idp = idps.find((i) => i.issuer === iss)

            if (!idp) {
                logger.warn(`No identity provider found for issuer: ${iss}`)
                return undefined
            }

            if (!decoded.scope && !decoded.scp) {
                logger.warn('JWT does not contain a scope claim')
                return undefined
            }

            if (idp.type == 'self_signed') {
                return verifySelfSignedToken(jwt, decoded, idp, store, logger)
            }
            logger.debug({ idp }, 'Using IDP')
            const response = await fetch(idp.configUrl)
            const config = await response.json()
            const jwks = createRemoteJWKSet(new URL(config.jwks_uri))

            const { payload } = await jwtVerify(jwt, jwks, {
                algorithms: ['RS256'],
            })

            if (!payload.sub) {
                return undefined
            }

            const networks = await store.listNetworks()
            const networksForIdp = networks.filter(
                (n) => n.identityProviderId === idp.id
            )
            const expectedAudiences = networksForIdp
                .map((n) => n.auth.audience)
                .filter((aud): aud is string => aud !== undefined && aud !== '')

            if (expectedAudiences.length === 0) {
                logger.warn(
                    `No networks configured for IDP ${idp.id}, cannot validate audience`
                )
                return undefined
            }

            const tokenAudience = payload.aud
            if (!tokenAudience) {
                logger.warn('JWT does not contain an audience claim')
                return undefined
            }

            const tokenAudiences = Array.isArray(tokenAudience)
                ? tokenAudience
                : [tokenAudience]

            const audMatch = tokenAudiences.some((aud) =>
                expectedAudiences.includes(aud)
            )
            if (!audMatch) {
                logger.warn(
                    {
                        tokenAudiences,
                        expectedAudiences,
                    },
                    'JWT audience does not match any configured network'
                )
                return undefined
            }

            logger.debug(
                {
                    userId: payload.sub,
                    accessToken: jwt,
                    email: getEmail(decoded.email),
                },
                'JWT verified'
            )

            const authContext = {
                userId: payload.sub,
                accessToken: jwt,
            }

            const email =
                getEmail(decoded.email) ??
                (await resolveUserEmail(authContext, idp, logger))
            return email ? { ...authContext, email } : authContext
        } catch (error) {
            if (error instanceof Error) {
                logger.warn(error, `Failed to verify token: ${error.message}`)
            }
            return undefined
        }
    },
})
