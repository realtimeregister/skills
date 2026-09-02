# Validation (`validation`)

Pre-validation artifacts are linked to contact handles and re-used across
domain registrations to avoid repeated proof submissions.

**Base URL:** `https://api.yoursrs.com`  
**Docs:** `https://dm.realtimeregister.com/docs/api`

## Operations

### `getValidationCategory`

`GET /v2/validation/categories/{categoryName}`

Retrieve the schema for a validation category.

- **Docs:** `https://dm.realtimeregister.com/docs/api/validation/get`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `categoryName` | `string` | yes |  | Validation category identifier (e.g. `trademark`). |

**Query params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `fields` | `string` | no |  | Comma-separated field selector. |

**Responses**

- `200` - Schema describing required validation fields and accepted evidence types.

**Errors:** `ObjectDoesNotExist`


### `listValidationCategories`

`GET /v2/validation/categories`

List validation categories supported by the platform.

- **Docs:** `https://dm.realtimeregister.com/docs/api/validation/list`
- **Auth scope:** `customer`

**Query params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `limit` | `integer` | no | 10 | Number of entities to return; use 0 for a count-only request. Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 See [common listing rules](listings.md). |
| `offset` | `integer` | no | 0 | Zero-based result offset. Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 See [common listing rules](listings.md). |
| `order` | `string` | no |  | Sort field; prefix with `-` for descending order. Repeat to sort by multiple fields. Default order differs per listing; set order explicitly when paginating with offset. See [common listing rules](listings.md). |
| `total` | `boolean` | no | true | Set to false to omit the total match count and improve performance. See [common listing rules](listings.md). |
| `q` | `string` | no |  | Plain-text substring search across entity fields;  Values are NOT filter expressions: `q=status:OK` is matched literally and returns HTTP 200 with an empty `entities` array; filter with `status=OK` instead. See [common listing rules](listings.md). |
| `fields` | `string` | no |  | Comma-separated fields to include. Identifying fields remain included; properties without a value may be omitted from each entity. See [common listing rules](listings.md). |
| `export` | `boolean` | no |  | Return all records. Cannot be combined with limit or offset; default projection contains identifying fields only. See [common listing rules](listings.md). |

**Responses**

- `200` - Paginated envelope of ValidationCategory objects.

**Errors:** `InvalidParameter`

**Gotchas**

- Required validation categories for a given TLD are listed in /v2/tlds/{name}/info under `validationCategories`.


