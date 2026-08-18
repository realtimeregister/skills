# DNS Templates (`dnsTemplates`)

DNS templates bundle a common record set for reuse across zones. Linking a
zone to a template keeps its records in sync with later template edits
unless the zone is created with `link: false`.

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

### `getDnsTemplate`

`GET /v2/customers/{customer}/dnstemplates/{template}`

Retrieve a DNS template.

- **Docs:** `https://dm.realtimeregister.com/docs/api/templates/get`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `customer` | `string` | yes |  |
| `template` | `string` | yes |  |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `fields` | `string` | no | Comma-separated field selector. |

**Responses**

- `200` — Template object with `records`, SOA metadata, and DNSSEC flag.

**Errors:** `ObjectDoesNotExist`


### `listDnsTemplates`

`GET /v2/customers/{customer}/dnstemplates`

List DNS templates for the authenticated customer.

- **Docs:** `https://dm.realtimeregister.com/docs/api/templates/list`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `customer` | `string` | yes |  |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `fields` | `string` | no |  |
| `q` | `string` | no |  |
| `limit` | `integer` | no |  |
| `offset` | `integer` | no |  |
| `order` | `string` | no |  |

**Responses**

- `200` — Paginated envelope.

**Errors:** `InvalidParameter`

**Gotchas**

- Filter/order parameters follow the generic listing format (see /docs/api/listings#filtering).


### `createDnsTemplate`

`POST /v2/customers/{customer}/dnstemplates/{template}`

Create a DNS template.

- **Docs:** `https://dm.realtimeregister.com/docs/api/templates/create`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `customer` | `string` | yes |  |
| `template` | `string` | yes |  |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `hostMaster` | `string` | yes | Hostmaster email address used in SOA. |
| `refresh` | `integer` | yes | SOA refresh in seconds. |
| `retry` | `integer` | yes |  |
| `expire` | `integer` | yes |  |
| `ttl` | `integer` | yes |  |
| `records` | `DnsRecord[]` | no |  |

**Responses**

- `201` — Template created.

**Errors:** `InvalidParameter`, `DnsConfigurationException`, `ObjectExists`


### `updateDnsTemplate`

`POST /v2/customers/{customer}/dnstemplates/{template}/update`

Update template metadata and/or records. All SOA fields remain required on update.

- **Docs:** `https://dm.realtimeregister.com/docs/api/templates/update`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `customer` | `string` | yes |  |
| `template` | `string` | yes |  |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `hostMaster` | `string` | yes |  |
| `refresh` | `integer` | yes |  |
| `retry` | `integer` | yes |  |
| `expire` | `integer` | yes |  |
| `ttl` | `integer` | yes |  |
| `records` | `DnsRecord[]` | no | If provided, replaces the full record set. |

**Responses**

- `200` — Template updated.

**Errors:** `InvalidParameter`, `DnsConfigurationException`, `ObjectDoesNotExist`

**Gotchas**

- Zones with `link: true` inherit the change immediately.
- All SOA fields (hostMaster, refresh, retry, expire, ttl) must be sent on every update; omitting one rejects the request.


### `deleteDnsTemplate`

`DELETE /v2/customers/{customer}/dnstemplates/{template}`

Delete a DNS template.

- **Docs:** `https://dm.realtimeregister.com/docs/api/templates/delete`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `customer` | `string` | yes |  |
| `template` | `string` | yes |  |

**Responses**

- `204` — Template deleted.

**Errors:** `ObjectDoesNotExist`, `InvalidParameter`

**Gotchas**

- Registry rejects deletion while any zone is still linked to the template.


