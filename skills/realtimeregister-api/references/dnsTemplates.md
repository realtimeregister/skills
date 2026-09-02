# DNS Templates (`dnsTemplates`)

DNS templates bundle a common record set for reuse across zones. Linking a
zone to a template keeps its records in sync with later template edits
unless the zone is created with `link: false`.

**Base URL:** `https://api.yoursrs.com`  
**Docs:** `https://dm.realtimeregister.com/docs/api`

## Operations

### `getDnsTemplate`

`GET /v2/customers/{customer}/dnstemplates/{template}`

Retrieve a DNS template.

- **Docs:** `https://dm.realtimeregister.com/docs/api/templates/get`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `customer` | `string` | yes |  |  |
| `template` | `string` | yes |  |  |

**Query params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `fields` | `string` | no |  | Comma-separated field selector. |

**Responses**

- `200` - Template object with `records`, SOA metadata, and DNSSEC flag.

**Errors:** `ObjectDoesNotExist`


### `listDnsTemplates`

`GET /v2/customers/{customer}/dnstemplates`

List DNS templates for the authenticated customer.

- **Docs:** `https://dm.realtimeregister.com/docs/api/templates/list`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `customer` | `string` | yes |  |  |

**Query params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `limit` | `integer` | no | 10 | Number of entities to return; use 0 for a count-only request. Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 See [common listing rules](listings.md). |
| `offset` | `integer` | no | 0 | Zero-based result offset. Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 See [common listing rules](listings.md). |
| `order` | `string` | no |  | Sort field; prefix with `-` for descending order. Repeat to sort by multiple fields. Default order differs per listing; set order explicitly when paginating with offset. See [common listing rules](listings.md). |
| `total` | `boolean` | no | true | Set to false to omit the total match count and improve performance. See [common listing rules](listings.md). |
| `q` | `string` | no |  | Plain-text substring search across entity fields;  Values are NOT filter expressions: `q=status:OK` is matched literally and returns HTTP 200 with an empty `entities` array; filter with `status=OK` instead. See [common listing rules](listings.md). |
| `fields` | `string` | no |  | Comma-separated fields to include. Identifying fields remain included; properties without a value may be omitted from each entity. See [common listing rules](listings.md). |
| `export` | `boolean` | no |  | Return all records. Cannot be combined with limit or offset; default projection contains identifying fields only. See [common listing rules](listings.md). |

**Responses**

- `200` - Paginated envelope.

**Errors:** `InvalidParameter`


### `createDnsTemplate`

`POST /v2/customers/{customer}/dnstemplates/{template}`

Create a DNS template.

- **Docs:** `https://dm.realtimeregister.com/docs/api/templates/create`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `customer` | `string` | yes |  |  |
| `template` | `string` | yes |  |  |

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

- `201` - Template created.

**Errors:** `InvalidParameter`, `DnsConfigurationException`, `ObjectExists`


### `updateDnsTemplate`

`POST /v2/customers/{customer}/dnstemplates/{template}/update`

Update template metadata and/or records. All SOA fields remain required on update.

- **Docs:** `https://dm.realtimeregister.com/docs/api/templates/update`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `customer` | `string` | yes |  |  |
| `template` | `string` | yes |  |  |

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

- `200` - Template updated.

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

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `customer` | `string` | yes |  |  |
| `template` | `string` | yes |  |  |

**Responses**

- `204` - Template deleted.

**Errors:** `ObjectDoesNotExist`, `InvalidParameter`

**Gotchas**

- Registry rejects deletion while any zone is still linked to the template.


