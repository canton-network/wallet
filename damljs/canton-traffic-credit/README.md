# canton-traffic-credit

Daml model vendored from [DACH-NY/canton#36785](https://github.com/DACH-NY/canton/pull/36785)
(`community/traffic-enforcement/component/src/main/daml/canton-traffic-credit`).

It defines the Canton-owned `TrafficCredit` template and `creditTraffic` helper used by
applications that sell traffic (e.g. wallet providers) to top up a traffic enforcement (TEA)
account.

> This package is a temporary copy. Once Canton publishes `canton-traffic-credit` as a released
> artifact, replace this local project with a `data-dependency` on the published DAR and drop this
> folder.

## Build

```sh
# compile only
cd damljs/canton-traffic-credit && dpm build

# compile + regenerate the JS/TS bindings (run from repo root)
pnpm -w generate:canton-traffic-credit
```
