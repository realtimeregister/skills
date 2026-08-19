# Customers (`customers`)

Customer endpoints expose per-account financial views: the effective
pricelist (with scheduled changes and active promos) and current credit
balance. There is no separate getCustomer/listCustomers endpoint in the
public REST API; customer records are managed through the portal.

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

### `getPricelist`

`GET /v2/customers/{customer}/pricelist`

Retrieve the effective pricelist for a customer, with upcoming price changes and active promos.

- **Docs:** `https://dm.realtimeregister.com/docs/api/customers/pricelist`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `customer` | `string` | yes | Customer handle. |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `currency` | `string` | no | Convert prices to this currency (USD or EUR). Conversion uses daily exchange rates. |

**Responses**

- `200` - { prices: {product, action, currency, price}[],
  priceChanges: {product, action, currency, price, fromDate}[],
  promos: {product, action, currency, price, fromDate, endDate, active}[] }
Prices and promo prices are integers in the smallest currency unit (cents).


**Errors:** `ObjectDoesNotExist`, `AuthorizationFailed`, `InvalidParameter`

**Gotchas**

- All monetary amounts are in cents (integer).
- `currency` query param accepts only USD or EUR (case-insensitive).
- `action` values come from the BillableAction enum (CREATE, RENEW, TRANSFER, …).


### `getCredits`

`GET /v2/customers/{customer}/credit`

Retrieve available credits for a customer, split per currency account.

- **Docs:** `https://dm.realtimeregister.com/docs/api/customers/credits`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `customer` | `string` | yes | Customer handle. |

**Responses**

- `200` - { accounts: {currency, balance, reservation, locked}[] } where balance is
spendable credits, reservation is funds held for in-process transactions,
and locked is pending authorized-person approval.


**Errors:** `ObjectDoesNotExist`, `AuthorizationFailed`

**Gotchas**

- Path ends in `credit` (singular), docs slug is `credits` (plural).
- All amounts are in cents (integer).


