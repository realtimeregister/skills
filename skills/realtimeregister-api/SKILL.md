---
name: realtime-register
description: Realtime Register REST API v2 reference. Use when operating on domains, DNS zones, contacts, SSL certificates, hosts, brands, notifications, billing, or processes against api.yoursrs.com. Includes machine-readable specifications and per-operation reference documentation for every non-SiteLock endpoint.
---

# Realtime Register

## Resources

- `assets/spec/_shared.yaml` - enums, reusable types, and the global error catalog
- `assets/spec/<category>.yaml` - machine-readable API contracts grouped by category and indexed by `operationId`
- `references/<category>.md` - human-readable operation reference grouped by category

## When to use

Use this skill for tasks involving the Realtime Register REST API, including:

- Registering, renewing, transferring, or updating domains
- Creating or modifying DNS zones and records
- Managing contacts, hosts, brands, and customers
- Issuing or reissuing SSL certificates
- Reading notifications or processes
- Constructing requests to `https://api.yoursrs.com/v2/...`

## Hard rules

- Authentication is `Authorization: ApiKey <key>`.
- Request and response fields use camelCase.
- `period` values are expressed in months; `12` means one year.
- Contact roles are `ADMIN`, `BILLING`, and `TECH`.
- DNSSEC uses `keyData` XOR `dsData`; never provide both.
- `renewDomain` requires the current `expiryDate`.
- Endpoints with `authScope: gateway` require registry-account credentials rather than customer credentials.
- Never invent enum values. Read them from the relevant operation or `_shared.yaml`.

## Workflow

1. **Find the operation.**
   Search `references/<category>.md` for the relevant operation or `operationId`.

   For exact machine-readable details, inspect the matching operation in
   `assets/spec/<category>.yaml`.

2. **Authenticate.**
   Every request carries:

   `Authorization: ApiKey <your-api-key>`

   Do not use `X-API-KEY`, Basic authentication, or session keys.

3. **Build the request.**
   Follow the method, path, parameters, and request schema documented for the operation.

   Request fields use camelCase.

4. **Validate the payload.**
   Before sending a request, compare the payload against the operation schema in
   `assets/spec/<category>.yaml`.

   Check:

   - required fields
   - enum values
   - nested object structure
   - mutually exclusive fields
   - documented constraints

5. **Handle billable acknowledgements.**
   Billable mutations may initially return HTTP 400 with
   `BillableAcknowledgmentNeededException`.

   Copy the returned `billables` array unchanged into the request body and submit
   the request again.

6. **Handle asynchronous operations.**
   Mutations may return HTTP 202 with:

   `{ "processId": "..." }`

   Poll:

   `GET /v2/processes/{processId}`

   until the process reaches `COMPLETED` or `FAILED`.

## Fidelity markers

Operations may contain a `verified` field:

- `docs` - reconciled against the live Realtime Register documentation
- `sdk` - derived from the public TypeScript SDK and not yet reconciled against the live documentation

Repository tooling maintains the specs and generated references. Consumers of this skill do not need that tooling.

## Reference

- Documentation: `https://dm.realtimeregister.com/docs/api`
- API root: `https://api.yoursrs.com`