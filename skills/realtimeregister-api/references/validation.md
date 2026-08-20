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

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `categoryName` | `string` | yes | Validation category identifier (e.g. `trademark`). |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `fields` | `string` | no | Comma-separated field selector. |

**Responses**

- `200` - Schema describing required validation fields and accepted evidence types.

**Errors:** `ObjectDoesNotExist`


### `listValidationCategories`

`GET /v2/validation/categories`

List validation categories supported by the platform.

- **Docs:** `https://dm.realtimeregister.com/docs/api/validation/list`
- **Auth scope:** `customer`

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `fields` | `string` | no |  |
| `q` | `string` | no |  |
| `limit` | `integer` | no |  |
| `offset` | `integer` | no |  |
| `order` | `string` | no |  |

**Responses**

- `200` - Paginated envelope of ValidationCategory objects.

**Errors:** `InvalidParameter`

**Gotchas**

- Required validation categories for a given TLD are listed in /v2/tlds/{name}/info under `validationCategories`.


