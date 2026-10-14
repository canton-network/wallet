// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
    AccessTokenProvider,
    AuthContext,
    ClientCredentials,
} from './auth-service'
import { jwtExpired, jwtUserEmail, jwtUserId } from './auth-utils'
import { clientCredentialsService } from './client-credentials-service'
import { SelfSignedTokenService } from './self-signed-token-service'
import type { Auth, Idp } from './config/schema'
import { getLogger, lazy } from '@logtape/logtape'

export type TokenProviderConfig =
    | {
          method: 'static'
          token: string
      }
    | {
          method: 'self_signed'
          issuer: string
          credentials: ClientCredentials
          keyId?: string
      }
    | {
          method: 'client_credentials'
          configUrl: string
          credentials: ClientCredentials
      }

/**
 * AuthTokenProvider provides some common functionality across token providers.
 *
 *  1. Token caching: tokens are cached in-memory, so long as the token lifespan is not expired.
 *  2. Context retrieval: deriving a user context from the stored access token.
 *
 *
 * The following programmatic methods of token fetching are supported:
 *
 *  - `static`: a fixed, in-memory token. Only used for compatibility, it will totally break for expired tokens.
 *  - `self_signed`: only for development purposes, used for Canton setups that accept HMAC256 self signed tokens.
 *  - `client_credentials`: used to programmatically acquire tokens via oauth2, a.k.a "machine-to-machine" tokens.
 */
export class AuthTokenProvider implements AccessTokenProvider {
    private logger = getLogger([
        'core',
        'wallet-auth',
        'AuthTokenProvider',
    ]).with({
        method: lazy(() => this.config.method),
    })

    /**
     * A cached token is refreshed this many seconds before it expires, so it
     * doesn't expire while a request using it is still in flight.
     */
    static readonly REFRESH_MARGIN_SECONDS = 30

    /** Providers shared by {@link fromGatewayConfig}, keyed by their configuration. */
    private static readonly sharedProviders = new Map<
        string,
        AuthTokenProvider
    >()

    private cachedToken: string | undefined
    private pendingToken: Promise<string> | undefined

    constructor(protected readonly config: TokenProviderConfig) {}

    static fromToken(token: string): AuthTokenProvider {
        return new AuthTokenProvider({ method: 'static', token })
    }

    /**
     * Returns the token provider for an identity provider and auth
     * configuration. Providers are shared between callers with the same
     * configuration, so their tokens are reused until shortly before they
     * expire instead of being fetched from the IDP for every use.
     */
    static fromGatewayConfig(idp: Idp, auth: Auth): AuthTokenProvider {
        const key = JSON.stringify([idp, auth])
        let provider = AuthTokenProvider.sharedProviders.get(key)
        if (!provider) {
            provider = AuthTokenProvider.createFromGatewayConfig(idp, auth)
            AuthTokenProvider.sharedProviders.set(key, provider)
        }
        return provider
    }

    /** Drops all providers shared by {@link fromGatewayConfig}, for tests. */
    static clearSharedProviders(): void {
        AuthTokenProvider.sharedProviders.clear()
    }

    private static createFromGatewayConfig(
        idp: Idp,
        auth: Auth
    ): AuthTokenProvider {
        if (auth.method === 'self_signed') {
            return new AuthTokenProvider({
                method: auth.method,
                issuer: auth.issuer,
                credentials: {
                    clientId: auth.clientId,
                    clientSecret: auth.clientSecret,
                    scope: auth.scope,
                    audience: auth.audience,
                },
            })
        }

        if (auth.method === 'client_credentials') {
            if (idp.type === 'oauth')
                return new AuthTokenProvider({
                    method: auth.method,
                    configUrl: idp.configUrl,
                    credentials: {
                        clientId: auth.clientId,
                        clientSecret: auth.clientSecret,
                        scope: auth.scope,
                        audience: auth.audience,
                    },
                })
            else {
                throw new Error(
                    `IDP type ${idp.type} not supported for client_credentials auth`
                )
            }
        }

        throw new Error(
            `Auth method ${auth.method} not supported for programmatic access token`
        )
    }

    private async _fetchToken(): Promise<string> {
        this.logger.debug('Fetching user auth token')

        switch (this.config.method) {
            case 'static':
                return this.config.token
            case 'self_signed':
                return SelfSignedTokenService.fetchToken(
                    this.config.credentials,
                    this.config.issuer,
                    undefined,
                    this.config.keyId
                )
            case 'client_credentials':
                return clientCredentialsService(
                    this.config.configUrl
                ).fetchToken(this.config.credentials)
        }
    }

    /**
     *
     * @returns A valid JWT token retrieved according to the auth configuration given.
     */
    public async getAccessToken(): Promise<string> {
        if (
            this.cachedToken &&
            !jwtExpired(
                this.cachedToken,
                AuthTokenProvider.REFRESH_MARGIN_SECONDS
            )
        ) {
            return this.cachedToken
        }

        // Share one token request between concurrent callers
        this.pendingToken ??= this.refreshToken().finally(() => {
            this.pendingToken = undefined
        })
        return this.pendingToken
    }

    private async refreshToken(): Promise<string> {
        const newToken = await this._fetchToken()
        if (jwtExpired(newToken)) {
            throw new Error(
                'Attempted to refresh a token, but it came back expired.'
            )
        }

        this.cachedToken = newToken
        return newToken
    }

    /**
     *
     * @returns An AuthContext containing a valid token and userId.
     */
    public async getAuthContext(): Promise<AuthContext> {
        const accessToken = await this.getAccessToken()
        const userId = jwtUserId(accessToken)
        const email = jwtUserEmail(accessToken)

        return {
            accessToken,
            userId,
            ...(email ? { email } : {}),
        }
    }
}
