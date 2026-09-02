# Financial (`financial`)

Read-only ledger access. Transactions record every billable action
(registrations, renewals, transfers, restores, SSL issuance, etc.) as a
set of `billables` whose amounts are in the smallest currency unit
(cents). Exchange rates are published daily for EUR/USD conversion.

**Base URL:** `https://api.yoursrs.com`  
**Docs:** `https://dm.realtimeregister.com/docs/api`

## Operations

### `getTransaction`

`GET /v2/billing/financialtransactions/{transactionId}`

Retrieve a single financial transaction.

- **Docs:** `https://dm.realtimeregister.com/docs/api/transactions/get`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `transactionId` | `integer` | yes |  |  |

**Query params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `fields` | `string` | no |  |  |

**Responses**

- `200` - { id, customer, date, amount, currency,
  processId, processType, processIdentifier, processAction,
  chargesPerAccount?: { <currency>: <cents> },
  billables?: [{ product, action, quantity, amount, providerName }] }
`amount` is an integer in cents. `action` uses the BillableAction enum
(CREATE, REQUEST, TRANSFER, RENEW, RESTORE, TRANSFER_RESTORE, UPDATE,
REGISTRANT_CHANGE, LOCAL_CONTACT, NEGATIVE_MARKUP, PRIVACY_PROTECT,
EXTRA_WILDCARD, EXTRA_DOMAIN, REGISTRY_LOCK).


**Errors:** `ObjectDoesNotExist`

**Gotchas**

- All monetary amounts are integers in cents (smallest currency unit).
- `currency` is ISO 4217 alpha-3 (EUR or USD only today).
- `processType` is a free-form string (e.g. `domain`, `contact`); join against `/v2/processes` for full process detail.


### `listTransactions`

`GET /v2/billing/financialtransactions`

List financial transactions.

- **Docs:** `https://dm.realtimeregister.com/docs/api/transactions/list`
- **Auth scope:** `customer`

**Query params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `limit` | `integer` | no | 10 | Number of entities to return; use 0 for a count-only request. Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 See [common listing rules](listings.md). |
| `offset` | `integer` | no | 0 | Zero-based result offset. Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 See [common listing rules](listings.md). |
| `order` | `string` | no |  | Sort field; prefix with `-` for descending order. Repeat to sort by multiple fields. Default order differs per listing; set order explicitly when paginating with offset. See [common listing rules](listings.md). |
| `total` | `boolean` | no | true | Set to false to omit the total match count and improve performance. See [common listing rules](listings.md). |
| `q` | `string` | no |  | Plain-text substring search across entity fields;  Values are NOT filter expressions: `q=status:OK` is matched literally and returns HTTP 200 with an empty `entities` array; filter with `status=OK` instead. See [common listing rules](listings.md). |
| `fields` | `string` | no |  | Comma-separated fields to include. Identifying fields remain included; properties without a value may be omitted from each entity. See [common listing rules](listings.md). |
| `export` | `boolean` | no |  | Return all records. Cannot be combined with limit or offset; default projection contains identifying fields only. See [common listing rules](listings.md). |

**Responses**

- `200` - Paginated envelope of transaction objects.

**Errors:** `InvalidParameter`

**Gotchas**

- For accounting exports, prefer `export=true` + `fields=` to stream all records without pagination.


### `getExchangeRates`

`GET /v2/exchangerates/{currency}`

Retrieve the exchange-rate set for a specific date (defaults to latest).

- **Docs:** `https://dm.realtimeregister.com/docs/api/exchangerates`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `currency` | `string` | yes |  | The ISO 4217 alphabetic currency code (EUR or USD). |

**Query params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `date` | `string` | no |  | Effective date (YYYY-MM-DD). Defaults to today. |
| `fields` | `string` | no |  |  |

**Responses**

- `200` - { date, rates: { <currencyFrom>: { <currencyTo>: <rate> } } }
Rates are decimals (e.g. 1.0823 for EUR\u2192USD). Only EUR and USD
are quoted today.


**Errors:** `InvalidParameter`

**Gotchas**

- All monetary amounts elsewhere in the API are in cents; divide by 100 before multiplying by a rate.


### `listExchangeRates`

`GET /v2/exchangerates`

List all available exchange rates.

- **Docs:** `https://dm.realtimeregister.com/docs/api/exchangerates/list`
- **Auth scope:** `customer`

**Responses**

- `200` - Array of objects containing the base currency (`currency`), and a currency-to-rate map (`exchangerates`).

**Errors:** `InvalidParameter`


