---
title: 'Self-issued access token'
description: ''
---

Self issued access token is a way to authenticate to a canton ledger without an external Identity Provider, by signing access token with party private key.
Ledger will accept access token signed by party if following requirements are fulfilled:

1. Ledger User has property `primary_party_authentication` set to `true` and `primary_party` set to ID of the party used to obtain the signature.
2. Participant node Canton version is 3.6 or higher.
3. Participant node configuration contains entry `{ type = party-jwt }` under property `ledger-api.auth-services`.
4. The JWT token contains at least following claims:
   header:

```json
{
    "alg": "EdDSA",
    "typ": "JWT"
}
```

payload:

```json
{
    "aud": "<PARTICIPANT_ID>",
    "iss": "<PARTY_ID>",
    "sub": "<PARTY_ID>",
    "daml.com": {
        "syn": "<SYNCHRONIZER_ID>",
        "usr": "<USER_ID>"
    }
}
```

## Gateway configuration

To use self-issued token auth configure a network with following properties:

`auth.method` is `self_issued`.

`auth.audience` is the participant id alone, with no `https://daml.com/jwt/aud/participant/` prefix.

`network.identityProviderId` on the network points at an IdP whose `type` is `self_issued`. That IdP object is only `id` and `type`.

`adminAuth.method` `client_credentials`, or for development only `self_signed`.

`adminAuth.identityProviderId` is id of IdP with type `oauth` in case of method `client_credentials` or type `self_signed` in case of method `self_signed`. That optional field allows overriding using default network IdP for `adminAuth`.

```json
{
    "bootstrap": {
        "idps": [
            {
                "id": "idp-oauth",
                "type": "oauth",
                "issuer": "https://auth.example.com",
                "configUrl": "https://auth.example.com/.well-known/openid-configuration"
            },
            {
                "id": "idp-self-issued",
                "type": "self_issued"
            }
        ],
        "networks": [
            {
                "id": "canton:self-issued",
                "name": "Self issued",
                "identityProviderId": "idp-self-issued",
                "synchronizerId": "<SYNCHRONIZER_ID>",
                "auth": {
                    "method": "self_issued",
                    "audience": "<PARTICIPANT_ID>",
                    "scope": "openid daml_ledger_api offline_access"
                },
                "adminAuth": {
                    "method": "client_credentials",
                    "identityProviderId": "idp-oauth",
                    "audience": "https://daml.com/jwt/aud/participant/<PARTICIPANT_ID>",
                    "scope": "daml_ledger_api",
                    "clientId": "participant_admin",
                    "clientSecret": "<ADMIN_CLIENT_SECRET>"
                },
                "ledgerApi": {
                    "baseUrl": "https://ledger.example.com"
                }
            }
        ]
    }
}
```

## User API

Wallet Gateway connects to a network using self-issued access token either by onboarding a new user and authenticating party, or using existing ones.
Following user-api methods are used for those flows:

### `addSelfIssuedSession`

Creates the onboarding session. It's a row is sessions table that has empty `access_token` column. When the flow is finalized, `access_token` is added and the session enables regular Wallet Gateway functions and Ledger api usage.
It returns `session_id` which is added to the request when using methods below to provide a use context, unlike other user-api methods that use request header `Authorization` for session context.

### `getSelfIssuedOnboarding`

Returns information about ledger user existence, whether user has `primary_party_authentication` and `primary_party` properties set, and the wallets correlated with authenticating parties stored for this session.
Used to decide whether onboarding or selecting flow is available.

### `createSelfIssuedWallet`

Starts party creation - create Wallet row, prepares topology transaction and requests signature of topology transactions hash from signing provider.
The participant signing provider is rejected, as it's impossible to sign an access token with internal party.
If the ledger user already has primary-party authentication, the call is rejected and nothing is created.
Depending on signing provider it may finalize party allocation, or leave wallet in "initialized" status if signature is not ready - in that case `allocateSelfIssuedWallet` is called to poll signing status from signing provider.

### `allocateSelfIssuedWallet`

Finishes party allocation for a wallet created by the method above.
It polls signing provider API checking for topology transaction signature. If it's signed, it allocates party on the ledger.

### `connectSelfIssuedSession`

Uses authentication party to and the user to prepare access token and calls signing provider's method `signMessage` to sign the token.
If the ledger user does not yet have primary-party authentication, the user is patched: `primary_party` becomes this party id and `primary_party_authentication` becomes true. The wallet is updated with `isAuthParty`.
If the user already has primary-party authentication, nothing is patched. The wallet must already be `isAuthParty` and its party id must equal the user's primary party.
If the participant rejects the token, the session stays tokenless and the call fails. If the participant accepts it, that token is stored on the same session id, other sessions for this user and origin are removed, wallets are synced, and the response includes `wallet`, `accessToken`, and `sessionId`.
