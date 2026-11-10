# canton-traffic-credit

Daml model vendored from [DACH-NY/canton#36785](https://github.com/DACH-NY/canton/pull/36785)
(`community/traffic-enforcement/component/src/main/daml/canton-traffic-credit`).

It defines the Canton-owned `TrafficCreditReporter` interface
(`Canton.Api.Traffic.CreditV1`) that applications selling traffic (e.g. wallet providers) use to
report a credit to a traffic enforcement (TEA) account. It is interface-only: the
`TrafficCreditReporter_PublishCredit` choice is non-consuming and creates nothing, so the exercise
in the transaction tree _is_ the record of the credit, which the participant's TEA reads and
applies.

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
