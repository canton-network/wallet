# Splice Portfolio

The Splice Portfolio is a dApp for managing token standard assets and allocations. The app is a static single-page application that can be hosted anywhere. It allows you to connect to your own Wallet Gateway, or any CIP-103 compatible wallet, to sign transactions.

**NOTE:** You currently need to supply `amulet.validatorUrl` for Canton Coin (Amulet) operations.

There are two supported ways of running an instance the app UI:

1. Docker: `ghcr.io/digital-asset/splice-portfolio/docker/splice-portfolio`
2. Helm: `ghcr.io/digital-asset/splice-portfolio/helm/splice-portfolio`

The official images are hosted on GitHub Container Registry. We don't use latest tags, so check the release pages to see the latest tag:

- https://github.com/digital-asset/wallet-gateway/pkgs/container/splice-portfolio%2Fdocker%2Fsplice-portfolio
- https://github.com/digital-asset/wallet-gateway/pkgs/container/splice-portfolio%2Fhelm%2Fsplice-portfolio

It is also possible to host the UI directly on any webserver by downloading the NPM package (`@canton-network/example-portfolio`) and serving the files from `dist/`.

## Configuration

The app uses a simple configuration file, `config.json`. `amulet.validatorUrl` must point to a Validator API accessible to your browser using the same authentication setup as the Wallet Gateway user.

```json
{
    "amulet": {
        "validatorUrl": "http://localhost:2000/api/validator",
        "registry": "http://scan.localhost:4000/registry/"
    },
    "token": {
        "validatorUrl": "http://localhost:2000/api/validator",
        "registries": [
            {
                "name": "DA Registry",
                "partyId": "operator::1234567890",
                "url": "https://apps.da.com/registrar/operator::1234567890/"
            }
        ]
    }
}
```

- `amulet.registry` points to the Amulet/Scan registry endpoint.
- `token.validatorUrl` points to the Validator API used for token-standard operations.
- `token.registries` points to Token Standard registry APIs.
    - Registry names are optional.
    - Registry `partyId` values are optional.
    - When a registry omits `partyId`, the app discovers the registry admin party from the registry metadata endpoint.
- Configured registries from `amulet.registry` and `token.registries` are combined with registries saved in browser storage, with saved entries overriding matching configured parties.

## Network defaults

The example above is the file shape. DevNet, TestNet, and MainNet each have a config next to this page:

- [config.devnet.json](config.devnet.json)
- [config.testnet.json](config.testnet.json)
- [config.mainnet.json](config.mainnet.json)

Copy the file for your network to `config.json` and replace both `validatorUrl` values with your own Validator API. `https://validator.example.invalid` does not resolve. This repo does not publish a validator URL for these networks.

`amulet.registry` is one Digital Asset Scan URL for Canton Coin. The other Scan URLs for that same DSO party are in [api-specs/assets.json](https://github.com/canton-network/wallet/blob/main/api-specs/assets.json). `token.registries` lists every other registry in that file, one entry per URL. When several instruments share a URL, `name` is the party hint.

## Deployment

### Docker

To start the UI with Docker, copy one of the network files to `config.json` in your chosen directory and set both `validatorUrl` values. Then, run the container:

```sh
docker run --rm \
    -p 3333:8080 \
    -v "config.json:/usr/share/nginx/html/config.json:ro" \
    ghcr.io/digital-asset/splice-portfolio/docker/splice-portfolio:v1.15.0
```

### Helm

With Helm, the configuration can be set directly as Helm chart values:

```yaml
# values.yaml

image:
    repo: ghcr.io/digital-asset/splice-portfolio/docker
    tag: ''

config:
    amulet:
        validatorUrl: 'http://localhost:2000/api/validator' # @schema required
        registry: 'http://scan.localhost:4000/registry/' # @schema required
    token:
        validatorUrl: 'http://localhost:2000/api/validator' # @schema required
        registries:
            - url: 'https://registry.example.com' # @schema required
              name: '' # (optional)
              partyId: 'party-hint::fingerprint' # (optional)
```

For DevNet, TestNet, or MainNet, use `amulet` and `token` from the matching config file instead of the localhost values.

```sh
helm upgrade --install portfolio ghcr.io/digital-asset/splice-portfolio/helm/splice-portfolio:1.5.0 -f values.yaml
```

## Use

The UI is accessible on http://localhost:3333.

Registries from the mounted `config.json` show up in Settings. A registry saved in the browser overrides a configured party with the same id.
