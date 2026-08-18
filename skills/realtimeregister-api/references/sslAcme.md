# SSL (ACME) (`sslAcme`)

ACME subscriptions wrap the RTR-hosted ACME CA. Create a subscription to
obtain ACME credentials (accountKey + hmacKey + directoryUrl), then drive the
standard ACME client against `directoryUrl` for order/challenge/finalize.
Subscriptions are billed up front via `period` (months).

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

### `getAcmeSubscription`

`GET /v2/ssl/acme/{acmeSubscriptionId}`

Retrieve a single ACME subscription.

- **Docs:** `https://dm.realtimeregister.com/docs/api/ssl/acme/get`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `acmeSubscriptionId` | `integer` | yes | Subscription ID. |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `fields` | `string` | no |  |

**Responses**

- `200` — { id, product, domainNames?, organization?, address?, city?, state?,
  postalCode?, country?, createdDate, updatedDate?, expiryDate,
  period, directoryUrl, autoRenew, certValidity?, orgValidUntil?,
  status: AcmeStatus,
  approver?: { firstName, lastName, jobTitle?, email, voice } }


**Errors:** `ObjectDoesNotExist`

**Gotchas**

- `status` enum: ACTIVE, SUSPENDED, REVOKED, PENDING_ORGANIZATION_VALIDATION.
- `accountKey` and `hmacKey` are NOT returned by get; they are only shown at create/recreate.


### `listAcmeSubscriptions`

`GET /v2/ssl/acme`

List ACME subscriptions.

- **Docs:** `https://dm.realtimeregister.com/docs/api/ssl/acme/list`
- **Auth scope:** `customer`

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `fields` | `string` | no |  |
| `q` | `string` | no | Filter expression (e.g. status:ACTIVE). |
| `limit` | `integer` | no |  |
| `offset` | `integer` | no |  |
| `order` | `string` | no |  |
| `export` | `boolean` | no |  |

**Responses**

- `200` — Paginated envelope of ACME subscription objects.

**Errors:** `InvalidParameter`


### `createAcmeSubscription`

`POST /v2/ssl/acme`

Create an ACME subscription; returns directoryUrl + account credentials (once).

- **Docs:** `https://dm.realtimeregister.com/docs/api/ssl/acme/create`
- **Auth scope:** `customer`

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `quote` | `boolean` | no | Validate and price without committing. |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `customer` | `string` | yes | Customer handle. Matches ^[a-zA-Z0-9\-_@.]+$. |
| `product` | `string` | yes | SSL product identifier; see ssl/products/list. |
| `domainNames` | `string[]` | no | FQDNs covered by the subscription (4–255 chars each). |
| `organization` | `string` | no |  |
| `country` | `string` | no | ISO 3166-1 alpha-2. |
| `state` | `string` | no |  |
| `address` | `string` | no |  |
| `postalCode` | `string` | no |  |
| `city` | `string` | no |  |
| `autoRenew` | `boolean` | no | Auto-renew subscription before expiry. |
| `period` | `integer` | yes | Subscription validity in months. |
| `certValidity` | `integer` | no | Per-cert validity in **days**; DigiCert products only. |
| `approver` | `Approver` | no |  |

**Responses**

- `201` — { id, directoryUrl, accountKey, hmacKey }
`accountKey` and `hmacKey` are the External Account Binding credentials
for ACME. They are ONLY returned in this response \u2014 store them now.


**Errors:** `InvalidParameter`, `QuoteOnly`

**Gotchas**

- `period` is in MONTHS; `certValidity` is in DAYS. Do not confuse them.
- `accountKey`/`hmacKey` cannot be retrieved later. Use `recreateAcmeCredentials` if lost.
- Field requirements (organization, address, etc.) vary by SSL product; check ssl/products/get.


### `updateAcmeSubscription`

`POST /v2/ssl/acme/{acmeSubscriptionId}/update`

Update subscription metadata (e.g. autoRenew, approver, domainNames).

- **Docs:** `https://dm.realtimeregister.com/docs/api/ssl/acme/update`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `acmeSubscriptionId` | `integer` | yes |  |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `quote` | `boolean` | no |  |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `domainNames` | `string[]` | no | List of domain names. |
| `organization` | `string` | no |  |
| `country` | `CountryCode` | no |  |
| `state` | `string` | no |  |
| `address` | `string` | no |  |
| `postalCode` | `string` | no |  |
| `city` | `string` | no |  |
| `autoRenew` | `boolean` | no | Automatically renew the subscription. |
| `period` | `integer` | no | Validity period to use for auto-renewal of the subscription. |
| `approver` | `Approver` | no |  |

**Responses**

- `200` — Subscription updated.

**Errors:** `InvalidParameter`, `ObjectDoesNotExist`


### `renewAcmeSubscription`

`POST /v2/ssl/acme/{acmeSubscriptionId}/renew`

Extend subscription validity by another `period` months.

- **Docs:** `https://dm.realtimeregister.com/docs/api/ssl/acme/renew`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `acmeSubscriptionId` | `integer` | yes |  |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `quote` | `boolean` | no |  |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `period` | `integer` | yes | Additional validity in months. |

**Responses**

- `200` — Subscription renewed; new expiryDate returned.

**Errors:** `InvalidParameter`, `ObjectDoesNotExist`


### `deleteAcmeSubscription`

`DELETE /v2/ssl/acme/{acmeSubscriptionId}`

Delete an ACME subscription.

- **Docs:** `https://dm.realtimeregister.com/docs/api/ssl/acme/delete`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `acmeSubscriptionId` | `integer` | yes |  |

**Responses**

- `204` — Subscription deleted.

**Errors:** `ObjectDoesNotExist`


### `recreateAcmeCredentials`

`POST /v2/ssl/acme/{acmeSubscriptionId}/credentials`

Rotate the External Account Binding (accountKey + hmacKey). Invalidates the old pair.

- **Docs:** `https://dm.realtimeregister.com/docs/api/ssl/acme/credentials`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `acmeSubscriptionId` | `integer` | yes |  |

**Responses**

- `200` — { accountKey, hmacKey } — shown once.

**Errors:** `ObjectDoesNotExist`

**Gotchas**

- Old ACME account credentials are revoked immediately; update your ACME client before rotating.


