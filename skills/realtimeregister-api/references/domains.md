# Domains (`domains`)

Register, update, renew, transfer, restore, push, delete, query, and price
domain names. Mutating operations return HTTP 202 with { processId } and are
completed asynchronously; poll /v2/processes/{id} to confirm.

**Base URL:** `https://api.yoursrs.com`  
**Docs:** `https://dm.realtimeregister.com/docs/api`

**Auth:** `Authorization: ApiKey <your-api-key>`

## Authentication

- Authenticate every REST request with the header `Authorization: ApiKey <your-api-key>`. API keys are generated in the Realtime Register portal.
- There is NO `X-API-KEY` header in this API. Never use it.
- Basic (password-based) authentication is DEPRECATED upstream. Never suggest or generate it.
- Session authentication (`Authorization: Session <key>`) and `POST /v2/session` are deprecated in favor of API keys. Do not use.
- Customer-scope and gateway-scope endpoints (`authScope` on each operation) require different API keys. Never mix them.

## Operations

### `listDomains`

`GET /v2/domains`

List domains owned by the authenticated customer.

- **Docs:** `https://dm.realtimeregister.com/docs/api/domains/list`
- **Auth scope:** `customer`

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `fields` | `string` | no | Comma-separated top-level fields to include. |
| `q` | `string` | no | Filter expression, e.g. status:OK AND name:*.nl |
| `limit` | `integer` | no |  |
| `offset` | `integer` | no |  |
| `order` | `string` | no |  |

**Responses**

- `200` — Paginated envelope with an `entities` array of Domain objects.

**Errors:** `InvalidParameter`, `AuthenticationFailed`

**Gotchas**

- Use `fields` to trim the response; full Domain objects are large.
- Filter/order parameters follow the generic listing format (see /docs/api/listings#filtering).


### `getDomain`

`GET /v2/domains/{domainName}`

Fetch a single domain and all sub-objects.

- **Docs:** `https://dm.realtimeregister.com/docs/api/domains/get`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `domainName` | `string` | yes |  |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `fields` | `string` | no | Comma-separated field selector; identifying fields are always included. |

**Responses**

- `200` — Full Domain object (contacts, nameservers, DNSSEC, status list).

**Errors:** `ObjectDoesNotExist`, `AuthorizationFailed`

**Gotchas**

- `authcode` is present only for domains the caller owns.


### `checkDomain`

`GET /v2/domains/{domainName}/check`

Availability and price check for a domain name.

- **Docs:** `https://dm.realtimeregister.com/docs/api/domains/check`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `domainName` | `string` | yes |  |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `renewPrice` | `boolean` | no | If true, include a renewal price alongside the acquisition price for available premium domains. |

**Responses**

- `200` — { "available": boolean, "premium": boolean, "reason": string, "price": Money, "renewPrice": Integer }

**Errors:** `InvalidParameter`

**Gotchas**

- `reason` populated only when `available` is false.
- `renewPrice` is included only when the `renewPrice=true` query param is set and the domain is a premium name.


### `createDomain`

`POST /v2/domains/{domainName}`  _async_

Register a new domain.

- **Docs:** `https://dm.realtimeregister.com/docs/api/domains/create`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `domainName` | `string` | yes | Domain name (min 3, max 255 chars; lowercase letters/digits/hyphen). |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `quote` | `boolean` | no | If true, only validate and quote the action. |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `customer` | `string` | yes | Owning customer handle. |
| `registrant` | `string` | yes | Registrant contact handle. |
| `privacyProtect` | `boolean` | no | Defaults to the account's Privacy Protect setting. |
| `period` | `integer` | no | Initial registration period in MONTHS. Defaults to registry minimum. |
| `authcode` | `string` | no | Domain auth code; auto-generated if omitted. |
| `languageCode` | `string` | no | TLD-specific IDN language tag. |
| `autoRenew` | `boolean` | no | Defaults to true. |
| `ns` | `string[]` | no | Nameserver FQDNs (min 4, max 255 each). |
| `skipValidation` | `boolean` | no | Skip contact validation; rejects PENDING_VALIDATION domains until resolved. |
| `launchPhase` | `string` | no | Required only when TLD is in a non-GA launch phase. |
| `zone` | `Zone` | no |  |
| `contacts` | `DomainContactRef[]` | no |  |
| `keyData` | `KeyData[]` | no | DNSSEC DNSKEY records. Mutually exclusive with dsData. |
| `billables` | `Billable[]` | no | Copy from BillableAcknowledgmentNeededException to retry. |

**Responses**

- `201` — Domain registered synchronously.
- `202` — { processId } — async; poll /v2/processes/{id}.

**Errors:** `InvalidParameter`, `BillableAcknowledgmentNeededException`, `AuthorizationFailed`

**Gotchas**

- `period` is MONTHS, not years. Pass 12 for one year.
- First call typically returns 400 BillableAcknowledgmentNeededException; re-submit with its `billables` array verbatim.
- `keyData` and `dsData` are mutually exclusive per domain.
- Some TLDs require `languageCode`; others require `launchPhase` while in Sunrise/Landrush.
- Contact roles are ADMIN, BILLING, TECH only.

**Examples**

_minimal_

```
{
  "method": "POST",
  "path": "/v2/domains/example.nl",
  "body": {
    "customer": "MYCUST",
    "registrant": "CUST-001",
    "period": 12,
    "ns": [
      "ns1.example.nl",
      "ns2.example.nl"
    ],
    "contacts": [
      {
        "role": "ADMIN",
        "handle": "CUST-001"
      },
      {
        "role": "TECH",
        "handle": "CUST-001"
      }
    ]
  }
}
```


### `updateDomain`

`POST /v2/domains/{domainName}/update`  _async_

Update contacts, nameservers, DNSSEC, status flags, autoRenew, or privacy protection.

- **Docs:** `https://dm.realtimeregister.com/docs/api/domains/update`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `domainName` | `string` | yes |  |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `quote` | `boolean` | no | Validate and quote only. |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `registrant` | `string` | no |  |
| `privacyProtect` | `boolean` | no |  |
| `authcode` | `string` | no |  |
| `autoRenew` | `boolean` | no |  |
| `autoRenewPeriod` | `integer` | no | Auto-renew length in MONTHS. Defaults to the registry minimum. |
| `ns` | `string[]` | no |  |
| `status` | `DomainStatus` | no | New status list. Only CLIENT_* flags are mutable by default; gateway users with SET_REGISTRAR_STATUS may also manage REGISTRAR_* flags. IRTPC_TRANSFER_PROHIBITED can only be removed. |
| `designatedAgent` | `DesignatedAgent` | no | Requires the DESIGNATED_AGENT permission for any value other than NONE. |
| `zone` | `Zone` | no | DNS zone changes to apply (service, template, link, master, dnssec). |
| `contacts` | `DomainContactRef[]` | no |  |
| `keyData` | `KeyData[]` | no |  |
| `dsData` | `DsData[]` | no |  |
| `billables` | `Billable[]` | no |  |

**Responses**

- `202` — { processId }

**Errors:** `InvalidParameter`, `ObjectDoesNotExist`, `BillableAcknowledgmentNeededException`, `AuthorizationFailed`

**Gotchas**

- Omitted fields are left untouched.
- `status` is the full desired list; the server diffs it against the current status to compute adds/removes.
- `keyData` and `dsData` are mutually exclusive per domain.


### `renewDomain`

`POST /v2/domains/{domainName}/renew`  _async_

Renew a domain for N additional months.

- **Docs:** `https://dm.realtimeregister.com/docs/api/domains/renew`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `domainName` | `string` | yes |  |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `quote` | `boolean` | no | Validate and quote only. |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `period` | `integer` | yes | Months to add (live docs type the field as String but the server accepts the numeric month count). |
| `billables` | `Billable[]` | no |  |

**Responses**

- `202` — { processId }

**Errors:** `InvalidParameter`, `ObjectDoesNotExist`, `BillableAcknowledgmentNeededException`

**Gotchas**

- `period` is MONTHS, not years.


### `transferDomain`

`POST /v2/domains/{domainName}/transfer`  _async_

Initiate an inbound transfer from another registrar.

- **Docs:** `https://dm.realtimeregister.com/docs/api/domains/transfer`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `domainName` | `string` | yes |  |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `quote` | `boolean` | no |  |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `customer` | `string` | yes |  |
| `registrant` | `string` | yes |  |
| `privacyProtect` | `boolean` | no |  |
| `period` | `integer` | no | Optional months to add on top of the transferred expiry. |
| `authcode` | `string` | no | Code obtained from the losing registrar. Some TLDs (e.g. .uk) do not require one. |
| `autoRenew` | `boolean` | no |  |
| `ns` | `string[]` | no |  |
| `designatedAgent` | `DesignatedAgent` | no |  |
| `zone` | `Zone` | no |  |
| `contacts` | `DomainContactRef[]` | no |  |
| `keyData` | `KeyData[]` | no |  |
| `billables` | `Billable[]` | no |  |

**Responses**

- `202` — { processId } — transfer process may remain PENDING for days.

**Errors:** `InvalidParameter`, `ObjectExists`, `AuthorizationFailed`, `BillableAcknowledgmentNeededException`

**Gotchas**

- Some TLDs require out-of-band trade forms; see docs/api/domains/transfer.
- `authcode` is technically optional but required by most registries.


### `pushTransferDomain`

`POST /v2/domains/{domainName}/transfer/push`  _async_

Push a domain to another customer within RTR.

- **Docs:** `https://dm.realtimeregister.com/docs/api/domains/pushtransfer`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `domainName` | `string` | yes |  |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `recipient` | `string` | yes | Target customer handle. |

**Responses**

- `202` — { processId }

**Errors:** `InvalidParameter`, `ObjectDoesNotExist`, `AuthorizationFailed`

**Gotchas**

- Internal only. Use `transferDomain` for inbound transfers from other registrars.


### `transferInfo`

`GET /v2/domains/{domainName}/transfer/{processId}`

Inspect the status of an in-flight transfer by process id.

- **Docs:** `https://dm.realtimeregister.com/docs/api/domains/transferinfo`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `domainName` | `string` | yes |  |
| `processId` | `string` | yes | Process id returned by the original transferDomain call. |

**Responses**

- `200` — Transfer status, type (IN/OUT), requested/completed timestamps, FOA state.

**Errors:** `ObjectDoesNotExist`

**Gotchas**

- Transfer status values: pendingwhois, pendingfoa, pendingvalidation, pending, approved, cancelled, rejected, failed, completed.


### `restoreDomain`

`POST /v2/domains/{domainName}/restore`  _async_

Restore a domain in redemption grace.

- **Docs:** `https://dm.realtimeregister.com/docs/api/domains/restore`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `domainName` | `string` | yes |  |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `quote` | `boolean` | no |  |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `reason` | `string` | yes | Registry-required restore reason. |
| `billables` | `Billable[]` | no |  |

**Responses**

- `202` — { processId }

**Errors:** `InvalidParameter`, `ObjectDoesNotExist`, `BillableAcknowledgmentNeededException`

**Gotchas**

- Restore fees are high; quote via `?quote=true` first.


### `deleteDomain`

`DELETE /v2/domains/{domainName}`  _async_

Delete a domain; enters the registry redemption grace period.

- **Docs:** `https://dm.realtimeregister.com/docs/api/domains/delete`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `domainName` | `string` | yes |  |

**Responses**

- `202` — { processId }

**Errors:** `ObjectDoesNotExist`, `AuthorizationFailed`

**Gotchas**

- Reversible via `restoreDomain` during the redemption grace period (~30 days).


### `transferAuthorize`

`POST /v2/domains/{domainName}/transfer/{processId}/{action}`  _async_

Gateway-only. Approve or reject an outbound transfer request.

- **Docs:** `https://dm.realtimeregister.com/docs/api/domains/transferauth`
- **Auth scope:** `gateway`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `domainName` | `string` | yes |  |
| `processId` | `string` | yes | Process id of the pending outbound transfer. |
| `action` | `TransferAction` | yes | `approve` or `reject` (lowercase). |

**Responses**

- `202` — { processId }

**Errors:** `InvalidParameter`, `ObjectDoesNotExist`, `AuthorizationFailed`

**Gotchas**

- Requires gateway credentials; customer-scope API keys cannot invoke this endpoint.
- `action` is a path segment, not a body field, and must be lowercase.
- No request body; the endpoint is authorised purely by URL.


### `gatewayDomainInfo`

`GET /v2/domains/{domainName}/info`

Gateway-only read of a domain across all customers.

- **Docs:** `https://dm.realtimeregister.com/docs/api/domains/info`
- **Auth scope:** `gateway`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `domainName` | `string` | yes |  |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `authcode` | `string` | no | If set, the endpoint checks the provided auth code against the domain. |
| `type` | `string` | no | Transfer type filter for info lookups (IN, OUT). |

**Responses**

- `200` — Extended Domain object including internal flags.

**Errors:** `ObjectDoesNotExist`, `AuthorizationFailed`


