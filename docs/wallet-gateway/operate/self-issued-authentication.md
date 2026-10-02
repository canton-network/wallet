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
