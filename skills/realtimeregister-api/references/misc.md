# Miscellaneous (`misc`)

Low-traffic endpoints grouped to keep the top-level category list focused.

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

### `isProxy`

`GET /v2/isproxy/{ip}`

Check whether an IP is a known proxy/VPN/Tor exit.

- **Docs:** `https://dm.realtimeregister.com/docs/api/isproxy`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `ip` | `string` | yes | IPv4 or IPv6 address. |

**Responses**

- `200` - { proxy: boolean, categories: string[] }

**Errors:** `InvalidParameter`

**Gotchas**

- Method verified manually (GET); docs page lacks a machine-readable method span, so it is excluded from the live diff.


### `adacInput`

`POST wss://adac.api.yoursrs.com/ws?session_id={sessionId}`

ADAC WebSocket action. Perform an availability check and optional suggestion run for a domain-name query.

- **Docs:** `https://dm.realtimeregister.com/docs/api/adac/input`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `sessionId` | `string` | yes | UUID4 unique per session, included as `session_id` query parameter. |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `api_key` | `string` | yes | ADAC API key (separate from REST API key). |
| `action` | `string` | yes |  |
| `data` | `object` | yes | See gotchas; expects `tld_set_token`, `categories`, `input`, plus optional `priority_list_token` and `hints` (per-provider overrides for domainsbot/sidn/rns/prefixes-suffixes/namesuggestion). |

**Responses**

- `200` - WebSocket frame with availability + suggestion results.

**Errors:** `InvalidParameter`

**Gotchas**

- This endpoint is WebSocket, not REST. Connect to `wss://adac.api.yoursrs.com/ws?session_id=<uuid4>` and send the JSON payload as a text frame.
- `api_key` is the ADAC-specific key, not your customer REST key.
- `data.input` minimum length 1; `data.tld_set_token` and `data.priority_list_token` max length 64.


### `adacCategories`

`POST wss://adac.api.yoursrs.com/ws?session_id={sessionId}`

ADAC WebSocket action. Fetch the TLD categories configured for a given TLD set.

- **Docs:** `https://dm.realtimeregister.com/docs/api/adac/categories`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `sessionId` | `string` | yes |  |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `api_key` | `string` | yes |  |
| `action` | `string` | yes |  |
| `data` | `object` | yes | Expects `tld_set_token` (string, max 64). |

**Responses**

- `200` - WebSocket frame with the list of category IDs and labels.

**Errors:** `InvalidParameter`

**Gotchas**

- WebSocket transport; see `adacInput` for connection details.


### `adacCheck`

`POST wss://adac.api.yoursrs.com/ws?session_id={sessionId}`

ADAC WebSocket action. Perform a plain availability check (no suggestions) for one or more FQDNs.

- **Docs:** `https://dm.realtimeregister.com/docs/api/adac/check`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `sessionId` | `string` | yes |  |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `api_key` | `string` | yes |  |
| `action` | `string` | yes |  |
| `data` | `object` | yes | Expects a list of FQDNs under `domains`. |

**Responses**

- `200` - WebSocket frame with per-domain availability status.

**Errors:** `InvalidParameter`

**Gotchas**

- WebSocket transport; see `adacInput` for connection details.
- For pure availability without suggestions, prefer this over `adacInput` to save quota.


### `adacSuggest`

`POST wss://adac.api.yoursrs.com/ws?session_id={sessionId}`

ADAC WebSocket action. Run only the configured suggestion engines (no availability checks) for a query.

- **Docs:** `https://dm.realtimeregister.com/docs/api/adac/suggest`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `sessionId` | `string` | yes |  |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `api_key` | `string` | yes |  |
| `action` | `string` | yes |  |
| `data` | `object` | yes | Expects `tld_set_token`, `input`, and optional per-engine `hints` identical to `adacInput`. |

**Responses**

- `200` - WebSocket frame with suggested domain names grouped by engine.

**Errors:** `InvalidParameter`

**Gotchas**

- WebSocket transport; see `adacInput` for connection details.
- Suggestion engines must be enabled in the ADAC Management Panel for your account.


