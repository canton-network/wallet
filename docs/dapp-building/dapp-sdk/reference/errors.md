---
title: "Errors"
description: "Standard error codes returned by the dApp API."
---

The dApp API adopts standardized error codes from
[EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) and
[EIP-1474](https://eips.ethereum.org/EIPS/eip-1474). Branch on the code rather than the
message string.

## Error codes

| Code | Message | Meaning |
| --- | --- | --- |
| `4001` | User Rejected Request | The user rejected the request. |
| `4100` | Unauthorized | The requested method or account has not been authorized. |
| `4200` | Unsupported Method | The provider does not support the requested method. |
| `4900` | Disconnected | The provider is disconnected from all chains. |
| `4901` | Chain Disconnected | The provider is not connected to the requested chain. |
| `-32700` | Parse error | Invalid JSON. |
| `-32600` | Invalid request | JSON is not a valid request object. |
| `-32601` | Method not found | Method does not exist. |
| `-32602` | Invalid params | Invalid method parameters. |
| `-32603` | Internal error | Internal JSON-RPC error. |

For the complete specification, see
[CIP-103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md).

## Related

<Card title="Provider API" href="/sdks-tools/sdks/dapp-sdk/reference/provider-api">
  The methods that can return these errors.
</Card>
