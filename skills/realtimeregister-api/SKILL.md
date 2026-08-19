---
name: realtime-register
description: Realtime Register REST API v2 reference. Use when operating on domains, DNS zones, contacts, SSL certificates, hosts, brands, notifications, billing, or processes against api.yoursrs.com. Provides machine-readable spec, JSON-Schema validation, and per-operation docs for every non-SiteLock endpoint.
---

# Realtime Register skill

Loaded assets:

- `assets/spec/_shared.yaml` - enums, reusable types, global error catalog
- `assets/spec/<category>.yaml` - one file per category, `operationId`-indexed
- `references/<category>.md` - generated, human-readable operation reference

## When to use

Trigger on any task involving the Realtime Register REST API:

- Registering, renewing, transferring, or updating domains
- Creating or modifying DNS zones / records
- Managing contacts, hosts, brands, customers
- Issuing or reissuing SSL certificates
- Reading notifications or processes
- Constructing requests to `https://api.yoursrs.com/v2/...`

## Workflow

1. **Look up the operation.** Use `rtr list` to find an `operationId`, then `rtr describe <operationId>` for the full contract (method, path, fields, errors, gotchas, examples).

   If the `rtr` CLI is not on PATH: run it as
   `npx -y @cave-man/realtime-register-skills rtr <args>`, or read
   `references/<category>.md` in this skill directory directly - every
   operation's contract is fully rendered there.
2. **Authenticate.** Every request carries `Authorization: ApiKey <your-api-key>`. No other scheme: X-API-KEY does not exist, Basic auth is deprecated, sessions are deprecated.
3. **Build the request body** following the camelCase wire format - never snake_case, never kebab-case.
4. **Validate before sending.** Pipe the JSON payload through `rtr validate <operationId> --body payload.json`. All required fields, enums, and nested objects are checked against the JSON Schema derived from the YAML spec.
5. **Handle BillableAcknowledgmentNeededException.** Billable mutations return HTTP 400 with this exception on first call. Copy the exception's `billables` array verbatim (entries are `{product, action, quantity}`) into the request body and re-submit.
6. **Poll processes.** Async mutations return `{ processId }` with HTTP 202. Poll `GET /v2/processes/{processId}` until `status` is `COMPLETED` or `FAILED`.

## Hard rules

- Auth header is **`Authorization: ApiKey <key>`** - never `X-API-KEY`, never `Basic` (deprecated upstream), never session keys.
- Wire format is **camelCase**. No exceptions.
- `period` is always in **months** (12 = one year). Never pass years.
- Contact roles are **ADMIN, BILLING, TECH** only.
- DNSSEC uses **keyData XOR dsData**. Never both.
- `renewDomain` requires the current `expiryDate`; never omit.
- Registry-account endpoints (`authScope: gateway`) require a different credential than customer-scope endpoints; never mix.
- Do not invent enum values; rely on `_shared.yaml` or call `rtr describe`.

## Fidelity markers

Each operation carries a `verified` field:

- `docs` - path, parameters, and request fields reconciled against the live HTML at `dm.realtimeregister.com/docs/api`.
- `sdk` - derived from the public TypeScript SDK; pending `rtr scrape` confirmation.

As of the current release, all 109 operations carry `verified: docs`. Re-run `rtr scrape <operationId>` whenever the live docs are updated upstream.

## Reference

- Docs root: `https://dm.realtimeregister.com/docs/api`
- API root: `https://api.yoursrs.com`
