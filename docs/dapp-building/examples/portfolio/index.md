# Splice Portfolio

The Splice Portfolio is a dApp for managing token standard assets and allocations. The app is a static single-page application that can be hosted anywhere. It allows you to connect to your own Wallet Gateway, or any CIP-103 compatible wallet, to sign transactions.

There are two supported ways of running an instance the app UI:

1. Docker: `ghcr.io/digital-asset/splice-portfolio/docker/splice-portfolio`
2. Helm: `ghcr.io/digital-asset/splice-portfolio/helm/splice-portfolio`

The official images are hosted on GitHub Container Registry. We don't use latest tags, so check the release pages to see the latest tag:

- https://github.com/digital-asset/wallet-gateway/pkgs/container/splice-portfolio%2Fdocker%2Fsplice-portfolio
- https://github.com/digital-asset/wallet-gateway/pkgs/container/splice-portfolio%2Fhelm%2Fsplice-portfolio

It is also possible to host the UI directly on any webserver by downloading the NPM package (`@canton-network/example-portfolio`) and serving the files from `dist/`.

## Configuration

The app uses a simple configuration file, `config.json`. The only required option currently is `validatorUrl` which must point to a publicly accessible Validator API using the same authentication setup as the Wallet Gateway user.

```json
{
    "validatorUrl": "http://localhost:2000/api/validator",
    "registries": [] // not currently used
}
```

## Deployment

### Docker

To start the UI with Docker, create a `config.json` in your current directory and set your validatorUrl. Then, run the container:

```sh
docker run --rm \
    -p 3333:80 \
    -v "config.json:/usr/share/nginx/html:ro" \
    ghcr.io/digital-asset/splice-portfolio/docker/splice-portfolio:v1.5.0
```

and the UI is accessible on http://localhost:3333

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
