# Hosts (`hosts`)

Hosts are nameserver objects (with optional glue IP addresses) that domains
can reference in their `ns` array. All operations are synchronous.

**Base URL:** `https://api.yoursrs.com`  
**Docs:** `https://dm.realtimeregister.com/docs/api`

## Operations

### `getHost`

`GET /v2/hosts/{hostName}`

Retrieve a single host and its address records.

- **Docs:** `https://dm.realtimeregister.com/docs/api/hosts/get`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `hostName` | `string` | yes |  |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `fields` | `string` | no | Comma-separated field selector. |

**Responses**

- `200` - Host object with `addresses` array.

**Errors:** `ObjectDoesNotExist`, `AuthorizationFailed`


### `listHosts`

`GET /v2/hosts`

List hosts owned by the authenticated customer.

- **Docs:** `https://dm.realtimeregister.com/docs/api/hosts/list`
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

- `200` - Paginated envelope.

**Errors:** `InvalidParameter`, `AuthenticationFailed`


### `createHost`

`POST /v2/hosts/{hostName}`

Create a new host with one or more glue IP addresses.

- **Docs:** `https://dm.realtimeregister.com/docs/api/hosts/create`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `hostName` | `string` | yes | 4–255 characters; must be a valid FQDN. |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `addresses` | `HostAddress[]` | yes | One entry per glue IP; IpVersion V4 or V6. |

**Responses**

- `201` - Host created.

**Errors:** `InvalidParameter`, `ObjectExists`

**Gotchas**

- Glue records are only required when the host is subordinate to a domain you register (in-bailiwick).

**Examples**

_ipv4-and-ipv6_

```
{
  "method": "POST",
  "path": "/v2/hosts/ns1.example.com",
  "body": {
    "addresses": [
      {
        "ipVersion": "V4",
        "address": "203.0.113.10"
      },
      {
        "ipVersion": "V6",
        "address": "2001:db8::10"
      }
    ]
  }
}
```


### `updateHost`

`POST /v2/hosts/{hostName}/update`

Replace the address set for an existing host.

- **Docs:** `https://dm.realtimeregister.com/docs/api/hosts/update`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `hostName` | `string` | yes |  |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `addresses` | `HostAddress[]` | yes |  |

**Responses**

- `200` - Host updated.

**Errors:** `InvalidParameter`, `ObjectDoesNotExist`

**Gotchas**

- The `addresses` array is authoritative; omit an address to remove it.


### `deleteHost`

`DELETE /v2/hosts/{hostName}`

Delete a host.

- **Docs:** `https://dm.realtimeregister.com/docs/api/hosts/delete`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `hostName` | `string` | yes |  |

**Responses**

- `204` - Host deleted.

**Errors:** `ObjectDoesNotExist`, `AuthorizationFailed`

**Gotchas**

- Registry rejects deletion while the host is referenced by a domain's `ns` array.


