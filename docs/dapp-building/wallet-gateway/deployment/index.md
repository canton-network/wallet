# Deploying a wallet gateway

This section outlines some recommendations for production deployments of the Wallet Gateway service.

The service is available in both Docker and Helm variants. Images and charts are **public** on GitHub Container Registry — no access request is required.

- **Docker Registry**: `ghcr.io/digital-asset/wallet-gateway/docker/wallet-gateway:<VERSION>`
- **Helm Repository**: `ghcr.io/digital-asset/wallet-gateway/helm/wallet-gateway:<VERSION>`

Replace `<VERSION>` with the version you want to deploy. We don't currently publish `latest` tags. To determine which version to use, check either

- The latest tag on GHCR: https://github.com/digital-asset/wallet-gateway/pkgs/container/wallet-gateway%2Fdocker%2Fwallet-gateway
- The matching NPM package: https://www.npmjs.com/package/@canton-network/wallet-gateway-remote

### Expose the service for users and dApps

The Wallet Gateway must be reachable over HTTPS from browsers that open the **User UI** and from **hosted dApps** that connect via the dApp API. In Kubernetes, expose it with an Ingress or LoadBalancer that terminates TLS and forwards to the pod port (default `3030`). Set `kernel.publicUrl` to that external URL so OAuth redirects and discovery work correctly.

After deployment, follow the [verification checklist](../troubleshooting/index.md#post-deployment-verification) in Troubleshooting.

## Docker

To run the Docker container, a configuration file must be supplied for the Wallet Gateway. If you don't have a configuration, you can generate a sample config to serve as a starting point:

```shell
# via Docker
docker run --rm ghcr.io/digital-asset/wallet-gateway/docker/wallet-gateway:<VERSION> --config-example > config.json

# alternatively, generate a sample config file via NPM
npx @canton-network/wallet-gateway-remote@<VERSION> --config-example > config.json
```

With the default config file, start the service:

```shell
docker run -p 3030:3030 \
    -v ${PWD}/config.json:/app/config.json:ro \
    ghcr.io/digital-asset/wallet-gateway/docker/wallet-gateway:<VERSION>
```

If all went well, the Wallet Gateway login page can be opened in a browser at http://localhost:3030.

## Helm

An official Helm chart is available for Kubernetes deployments. The full values.schema is [here](https://github.com/digital-asset/wallet-gateway/blob/main/charts/wallet-gateway/values.schema.json), but the important thing to note is that the Wallet Gateway is configured through the top-level `config:` key in `values.yaml`.

The config is then specified as YAML, but otherwise uses the same schema as `config.json`.

### Signing chart values (`signing: {}`)

The Helm chart `signing` block configures **optional** external signing drivers (Blockdaemon, Dfns, Fireblocks). Leaving it empty is the common case for **participant-based signing**:

```yaml
signing: {}
```

With `signing: {}` (or with external drivers omitted), the Gateway still offers:

- **Participant** — signs via your Canton participant node (typical for validator / operator deployments). Not recommended in production when the User API is accessible; see [Signing Providers](../signing-providers/index.md#participant-based-signing).
- **Wallet Gateway (internal)** — not recommended for production

You do **not** need participant-specific fields under `signing` when the participant node handles keys. Add entries under `signing` only when enabling an external custody provider.

Signing providers can also be configured explicitly in the chart values:

```yaml
signing:
    # optional, define to enable blockdaemon integration -- or omit
    blockdaemon:
        apiUrl: 'http://localhost:5080/api/cwp/canton'
        apiKeyRef:
            name: 'blockdaemon-creds'
            key: 'api-key'
    # optional, define to enable fireblocks integration -- or omit
    fireblocks:
        apiKeyRef:
            name: 'fireblocks-creds'
            key: 'fb-api-key'
        secretRef:
            name: 'fireblocks-creds'
            key: 'fb-secret'
```

The chart also provides a helper for providing OAuth client secrets directly from Kubernetes secrets. This is done by specifying a mapping between a custom environment variable name and the secret reference:

```yaml
oauthSecrets:
    # map a kubernetes secret to a Wallet Gateway network auth config
    MY_OAUTH2_CLIENT_SECRET:
        secretRef:
            name: 'my-oauth'
            key: 'client-secret'
# ...

config:
    # ...
    networks:
        - id: 'my-network'
          # ...
          adminAuth:
              # ...
              # should correlate to a secret provided in oauthSecrets
              clientSecretEnv: 'MY_OAUTH2_CLIENT_SECRET'
```

## Configuration

The [Configuration](../configuration/index.md) section contains a complete breakdown of the options. Please read through that page first, then return here.

The following config is incomplete, but highlights specific fields of note to consider for a production deployment:

```yaml
kernel:
    # Set the publically accessible URL that users would use to connect to the deployed Wallet Gateway.
    # Subpath routing is also supported
    publicUrl: 'https://wallet.example.com/subpath'
server:
    # In a Helm/k8s setup, we recommend leaving the port set to the default `3030` value,
    # and routing the service internally from your Ingress/LoadBalancer (exposed on 443) to the pod's port.

    # We strongly recommend TLS termination of your cluster, so that the Wallet Gateway is accessible to clients over `https`.
    port: 3030

    # Set this to an array of origins corresponding to the set of web dApps that are allowed to call the dApp API.
    allowedOrigins:
        - 'https://dapp1.example.com'
        - 'https://dapp2.example.com'

    # The default value (`5mb`) may need to be bumped for heavy use (large contract payloads may exceed this).
    requestSizeLimit: '5mb'

    # Default is `10000` requests / second / IP address. Bump if encountering HTTP 429 errors during regular use.
    requestRateLimit: 10000
bootstrap:
    networks:
        - adminAuth:
              # For PRODUCTION, we recommend providing OAuth secrets for network admins via the environment.
              # This allows the secret to be stored in a secure secrets manager, and injected into the container at runtime.
              # This field defines the name of the environment variable to use for this network.
              clientSecretEnv: 'OAUTH2_CLIENT_SECRET'
```

### Environment Variables

Aside from the dynamic environment variables supported in config (`networks[].adminAuth.clientSecretEnv`), there are a few static environment variables available to configure external signing providers:

**Fireblocks**

- `FIREBLOCKS_API_KEY`: The API key for the Fireblocks integration
- `FIREBLOCKS_SECRET`: The secret for the Fireblocks integration

**Blockdaemon**

- `BLOCKDAEMON_API_KEY`: The API key for the Blockdaemon integration
- `BLOCKDAEMON_API_URL`: The URL for the Blockdaemon API

See [Signing Providers](../signing-providers/index.md) for more information.

## Database Persistence

### SQLite

The default config uses `sqlite` as a persistent data store for the Wallet Gateway. This is acceptable for evaluation and short-lived environments, but **PostgreSQL is recommended for production** (concurrent access, backups, and operational tooling).

SQLite stores data in local files. Without a persistent volume, all sessions and wallet state are lost when the pod is recreated. Even with a volume, plan backups if you rely on this store in non-dev environments.

First, configure the stores to point somewhere in the container:

```yaml
# config YAML for helm, or equivalent config.json
signingStore:
    connection:
        type: "sqlite",
        database: "/data/signing_store.sqlite"
store:
    connection:
        type: "sqlite",
        database: "/data/store.sqlite"
```

Then start the container with the volume mount

```shell
docker run -p 3030:3030 \
    -v ${PWD}/config.json:/app/config.json:ro \
    -v ${PWD}/data:/data \
    ghcr.io/digital-asset/wallet-gateway/docker/wallet-gateway:<VERSION>
```

### PostgreSQL

Alternatively, the Wallet Gateway can be configured to use a separate PostgreSQL connection:

```yaml
# config YAML for helm, or equivalent config.json
store:
    connection:
        type: "postgres",
        host: "<HOST_NAME>",
        port: 5432,
        database: "<DB_NAME>",
        user: "<DB_USERNAME>",
        password: "<DB_PASSWORD>"
```

### Local PostgreSQL over TLS (Docker)

For local development you can run PostgreSQL in Docker with TLS enabled and point the Wallet Gateway `store` / `signingStore` at it.

> [!NOTE]
> This configures TLS between the Wallet Gateway and PostgreSQL. It does **not** configure HTTPS for browsers. For browser/client HTTPS, terminate TLS in your reverse proxy/ingress and set `kernel.publicUrl` to the external `https://...` URL.

#### 1) Create TLS files for Postgres (self-signed)

```bash
mkdir -p .dev/postgres-tls
cd .dev/postgres-tls

# server key + cert (CN=localhost)
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout server.key -out server.crt -days 365 \
  -subj "/CN=localhost"

# Postgres requires strict key perms
chmod 600 server.key

# pg_hba: allow local socket (for init), enforce TLS for TCP
cat > pg_hba.conf <<'EOF'
# TYPE  DATABASE  USER  ADDRESS       METHOD
local   all       all                 scram-sha-256
hostssl all       all   0.0.0.0/0     scram-sha-256
hostssl all       all   ::/0          scram-sha-256
EOF

cd ../..
```

#### 2) Run Postgres with TLS enabled

```bash
docker rm -f local-postgres 2>/dev/null || true

docker run --name local-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=app_db \
  -e POSTGRES_INITDB_ARGS="--auth-host=scram-sha-256 --auth-local=scram-sha-256" \
  -p 5432:5432 \
  -v "$PWD/.dev/postgres-tls/server.crt:/var/lib/postgresql/server.crt:ro" \
  -v "$PWD/.dev/postgres-tls/server.key:/var/lib/postgresql/server.key:ro" \
  -v "$PWD/.dev/postgres-tls/pg_hba.conf:/var/lib/postgresql/pg_hba.conf:ro" \
  -d postgres:16 \
  -c ssl=on \
  -c ssl_cert_file=/var/lib/postgresql/server.crt \
  -c ssl_key_file=/var/lib/postgresql/server.key \
  -c hba_file=/var/lib/postgresql/pg_hba.conf
```

#### 3) Verify TLS works

```bash
docker exec -e PGPASSWORD=postgres local-postgres \
  psql "host=127.0.0.1 port=5432 user=postgres dbname=app_db sslmode=require" \
  -c "select current_setting('ssl') as ssl_on;"
```

Expected: `ssl_on` = `on`.

#### 4) Configure Wallet Gateway stores to use TLS

```json
{
    "store": {
        "connection": {
            "type": "postgres",
            "host": "localhost",
            "port": 5432,
            "user": "postgres",
            "password": "postgres",
            "database": "app_db",
            "ssl": { "rejectUnauthorized": false }
        }
    },
    "signingStore": {
        "connection": {
            "type": "postgres",
            "host": "localhost",
            "port": 5432,
            "user": "postgres",
            "password": "postgres",
            "database": "app_signing_db",
            "ssl": { "rejectUnauthorized": false }
        }
    }
}
```

If your PostgreSQL server requires TLS/SSL, add an `ssl` block. This is passed through to the underlying Node.js `pg` driver.

```yaml
store:
    connection:
        type: "postgres",
        host: "<HOST_NAME>",
        port: 5432,
        database: "<DB_NAME>",
        user: "<DB_USERNAME>",
        password: "<DB_PASSWORD>",
        # For production, prefer certificate verification (provide your CA bundle).
        ssl:
            rejectUnauthorized: true
            ca: |
                -----BEGIN CERTIFICATE-----
                ...
                -----END CERTIFICATE-----
```

## Logging

JSON logging can be enabled via the `--log-format` CLI flag (values: `"pretty" (default) | "json"`):

```shell
docker run -p 3030:3030 \
    -v ${PWD}/config.json:/app/config.json:ro \
    ghcr.io/digital-asset/wallet-gateway/docker/wallet-gateway:<VERSION> \
    --log-format=json
```
