# Providers (`providers`)

A provider is an upstream registry (e.g. Verisign, SIDN, DENIC). Customer
scope covers provider metadata and downtime windows. Registry-account
configuration (credentials, transport) is gateway-only and lives under a
separate `/v2/registryAccount` root.

**Base URL:** `https://api.yoursrs.com`  
**Docs:** `https://dm.realtimeregister.com/docs/api`

## Operations

### `getProvider`

`GET /v2/providers/REGISTRY/{name}`

Retrieve provider metadata (supported TLDs, type).

- **Docs:** `https://dm.realtimeregister.com/docs/api/providers/get`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | `string` | yes | Provider name. |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `fields` | `string` | no |  |

**Responses**

- `200` - { name, providerType: "REGISTRY", tlds?: [{ name }] }


**Errors:** `ObjectDoesNotExist`

**Gotchas**

- Path segment `REGISTRY` is literal: `providerType` only has one value today.


### `listProviders`

`GET /v2/providers`

Search / list providers.

- **Docs:** `https://dm.realtimeregister.com/docs/api/providers/list`
- **Auth scope:** `customer`

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `limit` | `integer` | no | Number of entities to return; use 0 for a count-only request. See [common listing rules](listings.md). |
| `offset` | `integer` | no | Zero-based result offset. See [common listing rules](listings.md). |
| `order` | `string` | no | Sort field; prefix with `-` for descending order. Repeat to sort by multiple fields. See [common listing rules](listings.md). |
| `total` | `boolean` | no | Set to false to omit the total match count and improve performance. See [common listing rules](listings.md). |
| `q` | `string` | no | Plain-text substring search across entity fields; values are not parsed as filter expressions. See [common listing rules](listings.md). |
| `fields` | `string` | no | Comma-separated fields to include. Identifying fields remain included; properties without a value may be omitted from each entity. See [common listing rules](listings.md). |
| `export` | `boolean` | no | Return all records. Cannot be combined with limit or offset; default projection contains identifying fields only. See [common listing rules](listings.md). |

**Responses**

- `200` - Paginated envelope of Provider objects.

**Errors:** `InvalidParameter`


### `getProviderDowntime`

`GET /v2/providers/downtime/{id}`

Retrieve a single registry downtime window.

- **Docs:** `https://dm.realtimeregister.com/docs/api/providers/downtime/get`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `integer` | yes | Downtime ID. |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `fields` | `string` | no |  |

**Responses**

- `200` - { id, startDate, endDate, reason?, provider }


**Errors:** `ObjectDoesNotExist`


### `listProviderDowntime`

`GET /v2/providers/downtime`

List downtime windows (past + scheduled).

- **Docs:** `https://dm.realtimeregister.com/docs/api/providers/downtime/list`
- **Auth scope:** `customer`

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `limit` | `integer` | no | Number of entities to return; use 0 for a count-only request. See [common listing rules](listings.md). |
| `offset` | `integer` | no | Zero-based result offset. See [common listing rules](listings.md). |
| `order` | `string` | no | Sort field; prefix with `-` for descending order. Repeat to sort by multiple fields. See [common listing rules](listings.md). |
| `total` | `boolean` | no | Set to false to omit the total match count and improve performance. See [common listing rules](listings.md). |
| `q` | `string` | no | Plain-text substring search across entity fields; values are not parsed as filter expressions. See [common listing rules](listings.md). |
| `fields` | `string` | no | Comma-separated fields to include. Identifying fields remain included; properties without a value may be omitted from each entity. See [common listing rules](listings.md). |
| `export` | `boolean` | no | Return all records. Cannot be combined with limit or offset; default projection contains identifying fields only. See [common listing rules](listings.md). |

**Responses**

- `200` - Paginated envelope of downtime records.

**Errors:** `InvalidParameter`


### `getRegistryAccount`

`GET /v2/registryAccounts/{registry}/{loginName}`

Gateway-only. Inspect a registry-account configuration.

- **Docs:** `https://dm.realtimeregister.com/docs/api/registryAccount/get`
- **Auth scope:** `gateway`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `registry` | `string` | yes | The name of the registry. |
| `loginName` | `string` | yes | The registry account login name. |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `fields` | `string` | no |  |

**Responses**

- `200` - RegistryAccount object (transport + masked credentials).

**Errors:** `ObjectDoesNotExist`, `AuthorizationFailed`

**Gotchas**

- Requires gateway credentials; customer-scope API keys are rejected.


### `listRegistryAccounts`

`GET /v2/registryAccounts`

Gateway-only. List registry accounts.

- **Docs:** `https://dm.realtimeregister.com/docs/api/registryAccount/list`
- **Auth scope:** `gateway`

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `limit` | `integer` | no | Number of entities to return; use 0 for a count-only request. See [common listing rules](listings.md). |
| `offset` | `integer` | no | Zero-based result offset. See [common listing rules](listings.md). |
| `order` | `string` | no | Sort field; prefix with `-` for descending order. Repeat to sort by multiple fields. See [common listing rules](listings.md). |
| `total` | `boolean` | no | Set to false to omit the total match count and improve performance. See [common listing rules](listings.md). |
| `q` | `string` | no | Plain-text substring search across entity fields; values are not parsed as filter expressions. See [common listing rules](listings.md). |
| `fields` | `string` | no | Comma-separated fields to include. Identifying fields remain included; properties without a value may be omitted from each entity. See [common listing rules](listings.md). |
| `export` | `boolean` | no | Return all records. Cannot be combined with limit or offset; default projection contains identifying fields only. See [common listing rules](listings.md). |

**Responses**

- `200` - Paginated envelope of RegistryAccount objects.

**Errors:** `InvalidParameter`, `AuthorizationFailed`


### `providerInfoDeprecated`

`GET /v2/providers/REGISTRY/{name}/info`

DEPRECATED. Legacy provider info endpoint; use `getProvider` + `getTldInfo`.

- **Docs:** `https://dm.realtimeregister.com/docs/api/providers/info`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | `string` | yes |  |

**Responses**

- `200` - Legacy provider info envelope.

**Errors:** `ObjectDoesNotExist`

**Gotchas**

- Marked Deprecated in live docs. New integrations MUST NOT use this endpoint.
- No replacement with identical shape; split across `getProvider`, `getTldInfo`, and `listProviderDowntime`.


