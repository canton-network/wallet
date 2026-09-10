// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    AuthContext,
    AuthService,
    Idp,
    resolveUserEmail,
} from '@canton-network/core-wallet-auth'
import { Store } from '@canton-network/core-wallet-store'
import {
    createRemoteJWKSet,
    decodeJwt,
    decodeProtectedHeader,
    jwtVerify,
} from 'jose'
import { Logger } from 'pino'

function getEmail(value: unknown): string | undefined {
    if (typeof value !== 'string' || value.length === 0) {
        return undefined
    }

    return value
}

// TODO maybe add a nice description
async function verifySelfSignedToken(
    jwt: string,
    idp: Extract<Idp, { type: 'self_signed' }>,
    store: Store,
    logger: Logger
): Promise<AuthContext | undefined> {
    const { kid } = decodeProtectedHeader(jwt)
    if (!kid) {
        logger.warn('Self-signed JWT does not contain a kid header')
        return undefined
    }

    const network = await store.getNetworkByKeyId(kid)
    if (!network || network.auth.method !== 'self_signed') {
        logger.warn({ kid }, 'No self-signed network uses this JWT key id')
        return undefined
    }

    if (network.identityProviderId !== idp.id) {
        logger.warn(
            { kid, networkId: network.id, idpId: idp.id },
            'JWT key id belongs to a network of a different identity provider'
        )
        return undefined
    }

    const auth = network.auth
    const { payload } = await jwtVerify(
        jwt,
        new TextEncoder().encode(auth.clientSecret),
        {
            algorithms: ['HS256'],
            issuer: idp.issuer,
            audience: auth.audience,
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
}

// TODO I probably should adjust the comment for non-JWKS path
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

            // TODO Check if I can divide it nicer per idp type, like each one in it's own method or other kind of block
            if (idp.type == 'self_signed') {
                return await verifySelfSignedToken(jwt, idp, store, logger)
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

            // TODO is this enough for token aud to match any network audience?
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
