# Financial (`financial`)

Read-only ledger access. Transactions record every billable action
(registrations, renewals, transfers, restores, SSL issuance, etc.) as a
set of `billables` whose amounts are in the smallest currency unit
(cents). Exchange rates are published daily for EUR/USD conversion.

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

### `getTransaction`

`GET /v2/billing/financialtransactions/{transactionId}`

Retrieve a single financial transaction.

- **Docs:** `https://dm.realtimeregister.com/docs/api/transactions/get`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `transactionId` | `integer` | yes |  |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `fields` | `string` | no |  |

**Responses**

- `200` — { id, customer, date, amount, currency,
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

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `fields` | `string` | no |  |
| `q` | `string` | no | Filter expression, e.g. `date:>=2025-01-01 AND processAction:RENEW`. |
| `limit` | `integer` | no |  |
| `offset` | `integer` | no |  |
| `order` | `string` | no |  |
| `export` | `boolean` | no |  |
| `no-total` | `boolean` | no |  |

**Responses**

- `200` — Paginated envelope of transaction objects.

**Errors:** `InvalidParameter`

**Gotchas**

- For accounting exports, prefer `export=true` + `fields=` to stream all records without pagination.


### `getExchangeRates`

`GET /v2/exchangerates/{currency}`

Retrieve the exchange-rate set for a specific date (defaults to latest).

- **Docs:** `https://dm.realtimeregister.com/docs/api/exchangerates`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `currency` | `string` | yes | The ISO 4217 alphabetic currency code (EUR or USD). |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `date` | `string` | no | Effective date (YYYY-MM-DD). Defaults to today. |
| `fields` | `string` | no |  |

**Responses**

- `200` — { date, rates: { <currencyFrom>: { <currencyTo>: <rate> } } }
Rates are decimals (e.g. 1.0823 for EUR\u2192USD). Only EUR and USD
are quoted today.


**Errors:** `InvalidParameter`

**Gotchas**

- All monetary amounts elsewhere in the API are in cents; divide by 100 before multiplying by a rate.


### `listExchangeRates`

`GET /v2/exchangerates`

List historical exchange rates across a date range.

- **Docs:** `https://dm.realtimeregister.com/docs/api/exchangerates/list`
- **Auth scope:** `customer`

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `fields` | `string` | no |  |
| `q` | `string` | no | Filter on date range, currency pair. |
| `limit` | `integer` | no |  |
| `offset` | `integer` | no |  |
| `order` | `string` | no |  |

**Responses**

- `200` — Paginated envelope of daily exchange-rate records.

**Errors:** `InvalidParameter`


