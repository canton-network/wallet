# Troubleshooting

This section covers common issues when deploying and operating a remote Wallet Gateway, including symptoms seen during initial production rollouts.

## Post-deployment verification

A successful deployment is more than seeing **Logged in!** on the login page. Use this checklist:

| Step | What to check                                                | Healthy signal                                                                                       |
| ---- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| 1    | Open the User UI at `kernel.publicUrl` (or your Ingress URL) | Login page loads over HTTPS                                                                          |
| 2    | Log in with your network and OAuth IDP                       | Redirect completes; **Logged in!** may appear briefly                                                |
| 3    | Open **Parties** (`/parties`)                                | At least one wallet for parties you expect (e.g. validator operator party)                           |
| 4    | Open **Parties** (`/parties`) and use the refresh control    | Parties list loads; **Wallet sync complete** (not an unexpected error)                               |
| 5    | Browser devtools → Network                                   | No persistent `500` on `addSession` or `isWalletSyncNeeded`                                          |
| 6    | Connect from a hosted dApp (if applicable)                   | dApp accepts `{publicUrl}{dappPath}` — see [Hosted dApps](../usage/index.md#connecting-hosted-dapps) |

**Logged in!** only means the Wallet Gateway accepted your OAuth session. If **Wallets** stays empty or the URL shows an error query parameter, the Gateway likely cannot reach the ledger with your token — continue below.

## Docker image pull failures

**Symptoms:** `ErrImagePull`, `not found` for `ghcr.io/digital-asset/wallet-gateway/docker/wallet-gateway:1.3.0`.

**Cause:** Published tags use a **`v` prefix** (`v1.3.0`).

**Fix:** Use `ghcr.io/digital-asset/wallet-gateway/docker/wallet-gateway:v<VERSION>` in Kubernetes `image` fields and Helm `image.tag`. Images are public; see [Deployment](../deployment/index.md#image-tags-use-a-v-prefix).

## Login works but no wallets appear

**Symptoms:** **Logged in!** or a blank page after login; no wallets on `/wallets`; error text in the URL.

**Common causes:**

1. **OAuth client misconfiguration** — `networks[].auth.clientId` must be a client allowed to obtain ledger tokens for your user. Scopes typically include `daml_ledger_api` and `offline_access`; `audience` must match the validator. You can often reuse an existing validator client ID, but it must be authorized for the Wallet Gateway flow (not only machine-to-machine validator automation).

2. **Wrong `ledgerApi.baseUrl`** — Must point at the **same participant** JSON/Ledger API your users authenticate against. Test connectivity:

    ```bash
    curl -sS -H "Authorization: Bearer <access_token>" \
      "<ledgerApi.baseUrl>/v2/version"
    ```

3. **Token lacks ledger rights** — The JWT `sub` user needs **CanActAs** and **CanReadAs** on the target party. Verify with the [JSON API](https://docs.digitalasset.com/build/3.4/explanations/json-api/index.html#list-specific-user-rights):

    ```bash
    curl -sS -H "Authorization: Bearer <access_token>" \
      "<ledgerApi.baseUrl>/v2/users/<sub>/rights"
    ```

    Decode the access token from the browser (Application → Network, or jwt.io) to read `sub`, `aud`, `scope`, and `exp`.

4. **`adminAuth` missing or invalid** — On first login with no wallets stored yet, the Gateway runs an automatic wallet sync using `adminAuth` (client credentials). If `adminAuth` is wrong, `addSession` may return HTTP 500 with `"Failed to add session"` in the console.

5. **`kernel.publicUrl` mismatch** — OAuth redirects and callbacks must match the URL users actually use (including path prefix if routed behind a subpath).

See also [Authentication configuration](../configuration/index.md#authentication-auth-and-adminauth).

## HTTP 500 on `addSession` or `isWalletSyncNeeded`

**Symptoms (browser console / Network tab):**

```json
{
    "jsonrpc": "2.0",
    "method": "addSession",
    "params": { "networkId": "..." },
    "id": "..."
}
```

or

```json
{ "jsonrpc": "2.0", "method": "isWalletSyncNeeded", "id": "..." }
```

with HTTP status **500** and message **Failed to add session**.

**Meaning:** The Gateway could not complete ledger connectivity or wallet sync for the current network.

**What to check:**

1. **`ledgerApi.baseUrl`** — reachable from the Gateway pod; correct host and TLS; no missing path if your ingress requires one.
2. **User token** — call `/v2/version` and `/v2/users/<sub>/rights` with the user's access token (see above).
3. **`adminAuth`** — valid `client_credentials` (or equivalent) with permission to list parties / allocate when sync runs; `clientSecretEnv` resolves to the secret in the container.
4. **Gateway logs** — look for `Ledger unreachable`, OAuth errors, or `No admin auth configured`.

Grab the access token from any authenticated User API request and reproduce ledger calls with `curl` before escalating.

## Wallet sync and the Parties UI

On **Parties**, an empty list can mean:

- No wallets are assigned yet (normal for a fresh user with no party rights), or
- Sync failed (see errors above).

**Wallet sync complete** means the backend returned a full sync response (no 401/404). It does not by itself mean wallets were discovered — only that the call succeeded.

To surface an existing validator operator party, the logged-in user's JWT `sub` must have **CanActAs** and **CanReadAs** on that party on the **same ledger** the Gateway uses. After fixing rights in your identity system, use the refresh control on **Parties** again.

## `networks.auth.clientId` vs `networks.adminAuth.clientId`

| Field       | Purpose                                                                                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth`      | End-user login (`authorization_code`). Token used for normal ledger operations in the User UI and dApp API.                                                    |
| `adminAuth` | Machine credentials (`client_credentials`) for wallet/party sync and party allocation. Required for automatic sync on first session when no wallets exist yet. |

They **may use the same OAuth client ID** if that client supports both flows, but that is not required. `adminAuth` is only needed for elevated sync/allocation operations and may be deprecated in a future release in favor of narrower APIs.

The `auth` client does **not** need a pre-existing wallet or party attached in Keycloak (or your IDP).

## Database connection errors

**Problem:** The Gateway fails to start with database connection errors.

**Solutions:**

1. **PostgreSQL:**
    - Verify the database exists: `psql -U postgres -l`
    - Check connection credentials in your config file
    - Ensure PostgreSQL is running: `pg_isready`
    - Verify network connectivity and firewall rules

2. **SQLite:**
    - Ensure the directory exists for the database file
    - Check file permissions (read/write access required)
    - Verify disk space is available
    - Mount a persistent volume in Kubernetes (see [Deployment](../deployment/index.md#sqlite))

3. **Memory Store:**
    - No configuration needed, but remember: data is lost on restart

## Authentication failures (401)

**Problem:** API calls return 401 Unauthorized errors.

**Solutions:**

1. **Invalid or Expired Token:**
    - Ensure you're using a valid JWT token
    - Check token expiration time
    - Regenerate the token if necessary

2. **Missing Authorization Header:**
    - Include the Authorization header: `Authorization: Bearer <token>`
    - Verify the header format is correct

3. **Session Not Found:**
    - Create a session using `addSession()` method first
    - Ensure the session hasn't expired
    - Check that you're using the correct user context

## Network connection issues

**Problem:** Cannot connect to configured networks or ledger API.

**Solutions:**

1. **Network Unreachable:**
    - Verify the ledger API URL is correct in your network configuration
    - Test connectivity: `curl <ledger-api-url>/v2/version`
    - Check firewall rules and network routing from the **Gateway pod**, not only your laptop

2. **Invalid Network Configuration:**
    - Ensure the identity provider ID matches between network and IDP configs
    - Check that authentication credentials are correct
    - Confirm `kernel.clientType` is `remote` for container deployments (this affects dApp connectivity, not ledger URL selection)

3. **SSL/TLS Issues:**
    - For HTTPS endpoints, verify certificates are valid
    - In development, you may need to use HTTP or configure certificate trust

## Port already in use

**Problem:** Error: `EADDRINUSE: address already in use :::3030`

**Solutions:**

1. Find and stop the process using the port:

    ```bash
    # macOS/Linux
    lsof -ti:3030 | xargs kill -9

    # Or find the process
    lsof -i :3030
    ```

2. Use a different port:

    ```bash
    wallet-gateway -c ./config.json -p 8080
    ```

3. Check if another Gateway instance is running:

    ```bash
    ps aux | grep wallet-gateway
    ```

## Configuration validation errors

**Problem:** Gateway fails to start with configuration errors.

**Solutions:**

1. **Validate your config against the schema:**

    ```bash
    wallet-gateway --config-schema > schema.json
    # Use a JSON schema validator tool
    ```

2. **Check for common mistakes:**
    - Missing required fields
    - Invalid JSON syntax
    - Type mismatches (strings vs numbers)
    - Missing or incorrect IDP references in network configs

3. **Use the example config as a template:**

    ```bash
    wallet-gateway --config-example > my-config.json
    # Edit my-config.json
    ```

## Signing provider issues

**Problem:** Transactions fail with signing errors.

**Solutions:**

1. **Fireblocks:**
    - Verify environment variables are set correctly: `FIREBLOCKS_SECRET` and `FIREBLOCKS_API_KEY`
    - Ensure API keys are valid and have proper permissions
    - Verify Fireblocks API is accessible from your network

2. **Participant:**
    - Ensure the participant node is running and accessible
    - Verify the party exists on the participant
    - Check participant logs for signing errors

3. **Blockdaemon:**
    - Verify environment variables are set: `BLOCKDAEMON_API_URL` and `BLOCKDAEMON_API_KEY`
    - Test API connectivity
    - Ensure API key has signing permissions

4. **Dfns:**
    - Verify environment variables are set: `DFNS_ORG_ID`, `DFNS_BASE_URL`, `DFNS_CRED_ID`, `DFNS_PRIVATE_KEY`, and `DFNS_AUTH_TOKEN`
    - Ensure the service account credentials are correct
    - Confirm the service account has wallet creation and signing permissions

## Debugging

### Enable structured logging

```bash
wallet-gateway -c ./config.json -f json
```

For human-readable local debugging, omit `-f json` (pretty is the default).

### Check logs

Review Gateway logs for `Failed to add session`, `Ledger unreachable`, OAuth, or migration errors. In Kubernetes:

```bash
kubectl logs -f deployment/<wallet-gateway-release>
```

### Verify API endpoints

```bash
# Health check (web UI)
curl -sS https://<your-gateway-host>/

# Ledger via user token
curl -sS -H "Authorization: Bearer <token>" \
  "<ledgerApi.baseUrl>/v2/version"
```

## Multiple hosted dApps and sessions

Centrally hosted registry or partner UIs (for example DA Registry or TradeWeb Utilities) each connect to **your** Wallet Gateway using the dApp URL:

```text
https://<your-gateway-host>/api/v0/dapp
```

Logging into one hosted UI and then another can clear or conflict with cookies when both use the same browser profile. Use **separate browser profiles** (Chrome profiles work well) when testing multiple hosted apps against one Gateway.

## Getting help

If issues persist:

1. Gateway logs around the time of `addSession` / sync failures
2. Redacted JWT claims: `sub`, `aud`, `scope`, `exp` (not the full token in public channels)
3. Output of `/v2/version` and `/v2/users/<sub>/rights` against your `ledgerApi.baseUrl`
4. Helm `values.yaml` or `config.json` with secrets redacted

## Log levels

The Gateway uses structured logging with the following levels:

- **ERROR**: Critical errors that prevent operation
- **WARN**: Warning conditions that may cause issues
- **INFO**: Informational messages about normal operation
- **DEBUG**: Detailed diagnostic information

Adjust log verbosity based on your needs. In production, INFO level is typically sufficient; DEBUG is useful for troubleshooting.
