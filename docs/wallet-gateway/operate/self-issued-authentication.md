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
