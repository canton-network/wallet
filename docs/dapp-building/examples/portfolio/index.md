# Splice Portfolio

The Splice Portfolio is a dApp for managing token standard assets and allocations. The app is a static single-page application that can be hosted anywhere. It allows you to connect to your own Wallet Gateway, or any CIP-103 compatible wallet, to sign transactions.

**NOTE:** You currently need to supply a `validatorUrl` for Canton Coin (Amulet) operations.

There are two supported ways of running an instance the app UI:

1. Docker: `ghcr.io/digital-asset/splice-portfolio/docker/splice-portfolio`
2. Helm: `ghcr.io/digital-asset/splice-portfolio/helm/splice-portfolio`

The official images are hosted on GitHub Container Registry. We don't use latest tags, so check the release pages to see the latest tag:

- https://github.com/digital-asset/wallet-gateway/pkgs/container/splice-portfolio%2Fdocker%2Fsplice-portfolio
- https://github.com/digital-asset/wallet-gateway/pkgs/container/splice-portfolio%2Fhelm%2Fsplice-portfolio

It is also possible to host the UI directly on any webserver by downloading the NPM package (`@canton-network/example-portfolio`) and serving the files from `dist/`.

## Configuration

The app uses a simple configuration file, `config.json`. The only required option currently is `validatorUrl` which must point to a Validator API accessible to your browser using the same authentication setup as the Wallet Gateway user.

```json
{
    "validatorUrl": "http://localhost:2000/api/validator",
    "registries": [] // not currently used but still needed in the config.json file
}
```

## Deployment

### Docker

To start the UI with Docker, create a `config.json` in your chosen directory and set your validatorUrl. Then, run the container:

```sh
docker run --rm \
    -p 3333:80 \
    -v "config.json:/usr/share/nginx/html:ro" \
    ghcr.io/digital-asset/splice-portfolio/docker/splice-portfolio:v1.5.0
```

### Helm

With Helm, the configuration can be set directly as Helm chart values:

```yaml
# values.yaml

image:
    repo: ghcr.io/digital-asset/splice-portfolio/docker
    tag: ''

config:
    validatorUrl: 'http://localhost:2000/api/validator' # @schema required
    registries:
        - url: 'https://registry.example.com' # @schema required
          name: '' # (optional)
          partyId: '' # (optional)
```

Then

```sh
helm upgrade --install portfolio ghcr.io/digital-asset/splice-portfolio/helm/splice-portfolio:1.5.0 -f values.yaml
```

## Use

The UI is accessible on http://localhost:3333.

When the Splice Portfolio UI opens, the UI will immediately inform you that a "Registry Configuration Required. No token registries are configured. You need to add at least one registry to use the portfolio."
Click "Go to Settings" where you should add the registry information for the tokens that you want to use.

For Canton Coin, you can use the following information:

- Party ID: DSO::1220b1431ef217342db44d516bb9befde802be7d8899637d290895fa58880f19accc
- Registry URL: any of the Super Validator's Scan URLs from the [Ecosystem website page](https://canton.foundation/sv-network-status-2/)
