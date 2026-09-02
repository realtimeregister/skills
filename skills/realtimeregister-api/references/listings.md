# Common listing rules

Shared behavior for API operations marked `listing: true`. Individual
operation pages define which entity fields support filtering.

**Upstream docs:** `https://dm.realtimeregister.com/docs/api/listings`

## Query parameters

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `limit` | `integer` | no | 10 | Number of entities to return; use 0 for a count-only request. Min: 0 Max: 250 |
| `offset` | `integer` | no | 0 | Zero-based result offset. Min: 0 |
| `order` | `string` | no |  | Sort field; prefix with `-` for descending order. Repeat to sort by multiple fields. Default order differs per listing; set order explicitly when paginating with offset. |
| `total` | `boolean` | no | true | Set to false to omit the total match count and improve performance. |
| `q` | `string` | no |  | Plain-text substring search across entity fields;  Values are NOT filter expressions: `q=status:OK` is matched literally and returns HTTP 200 with an empty `entities` array; filter with `status=OK` instead. |
| `fields` | `string` | no |  | Comma-separated fields to include. Identifying fields remain included; properties without a value may be omitted from each entity. |
| `export` | `boolean` | no |  | Return all records. Cannot be combined with limit or offset; default projection contains identifying fields only. |

## Search and filters

- Use `field=value` for equality; omitting the operator defaults to `eq`.
- Use `field:<operator>=value` for an explicit operator. Supported fields and operators depend on the listing and field type.
- Repeat a field parameter to apply multiple filters to that field.
- `q` is independent plain-text search. A value such as `status:OK` is searched literally and can return HTTP 200 with an empty `entities` array.
- Filters and `q` can be combined; the result is their intersection.
- Do not infer a complete `fields` projection from one entity: properties without a value can be absent from that entity.
- Each listing's filterable and sortable fields are listed in the "Filter and order fields" table on its upstream docs page.

## Filter operators

| Operator | Description | Supported field types |
| --- | --- | --- |
| `eq` | Equal to. | `String`, `List<String>`, `Date`, `Integer`, `List<Integer>`, `Enum`, `List<Enum>`, `Boolean` |
| `ne` | Not equal to. | `String`, `Date`, `Integer`, `List<Integer>`, `Enum`, `List<Enum>`, `Boolean` |
| `like` | Matches a wildcard pattern; `%` is the wildcard. | `String`, `List<String>`, `Enum`, `List<Enum>` |
| `not_like` | Does not match a wildcard pattern; `%` is the wildcard. | `String`, `Enum`, `List<Enum>` |
| `gt` | Greater than. | `String`, `List<String>`, `Date`, `Integer`, `List<Integer>` |
| `lt` | Less than. | `String`, `List<String>`, `Date`, `Integer`, `List<Integer>` |
| `gte` | Greater than or equal to. | `String`, `List<String>`, `Date`, `Integer`, `List<Integer>` |
| `lte` | Less than or equal to. | `String`, `List<String>`, `Date`, `Integer`, `List<Integer>` |
| `null` | Does not have a value. | `String`, `List<String>`, `Date`, `Integer`, `List<Integer>`, `Enum`, `List<Enum>`, `Boolean` |
| `not_null` | Has a value. | `String`, `List<String>`, `Date`, `Integer`, `List<Integer>`, `Enum`, `List<Enum>`, `Boolean` |
| `in` | Contained in a comma-separated list. | `String`, `List<String>`, `Integer`, `List<Integer>`, `Enum`, `List<Enum>` |
| `not_in` | Not contained in a comma-separated list. | `String`, `List<String>`, `Integer`, `List<Integer>`, `Enum`, `List<Enum>` |

## Response behavior

- Responses contain `pagination` and normally an `entities` array.
- A count-only request (`limit=0`) omits `entities`.
- `pagination.total` is optional; it is omitted when `total=false`.
- Entity properties without a value may be omitted rather than returned as null.
- With `export=true`, omit `limit` and `offset`; request non-identifying fields explicitly with `fields`.
