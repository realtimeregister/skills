# Brands (`brands`)

A brand groups customer-facing configuration (branding, support addresses,
mail templates, WHOIS footer). Every customer is assigned a brand; the
`default` brand is auto-provisioned.

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

### `getBrand`

`GET /v2/customers/{customer}/brands/{handle}`

Retrieve a brand.

- **Docs:** `https://dm.realtimeregister.com/docs/api/brands/get`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `customer` | `string` | yes |  |
| `handle` | `string` | yes |  |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `fields` | `string` | no | Comma-separated field selector. |

**Responses**

- `200` - Brand object with contact, mail, and WHOIS settings.

**Errors:** `ObjectDoesNotExist`


### `listBrands`

`GET /v2/customers/{customer}/brands`

List brands for a customer.

- **Docs:** `https://dm.realtimeregister.com/docs/api/brands/list`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `customer` | `string` | yes |  |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `fields` | `string` | no |  |
| `q` | `string` | no |  |
| `limit` | `integer` | no |  |
| `offset` | `integer` | no |  |
| `order` | `string` | no |  |

**Responses**

- `200` - Paginated envelope of Brand objects.

**Errors:** `InvalidParameter`

**Gotchas**

- Filter/order parameters follow the generic listing format (see /docs/api/listings#filtering).


### `createBrand`

`POST /v2/customers/{customer}/brands/{handle}`

Create a brand under a customer.

- **Docs:** `https://dm.realtimeregister.com/docs/api/brands/create`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `customer` | `string` | yes |  |
| `handle` | `string` | yes |  |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `hideOptionalTerms` | `boolean` | no | If true, contact validations under this brand hide optional terms. |
| `locale` | `string` | no | Locale to use for notification templates. |
| `organization` | `string` | yes |  |
| `addressLine` | `string[]` | yes |  |
| `postalCode` | `string` | yes |  |
| `city` | `string` | yes |  |
| `state` | `string` | no |  |
| `country` | `CountryCode` | yes |  |
| `email` | `string` | yes |  |
| `contactEmail` | `string` | no | Contact email address. |
| `replyToEmail` | `string` | no | Reply-to email address. |
| `voice` | `string` | yes | Voice telephone number (E.164 without separator required by some registries). |
| `fax` | `string` | no |  |
| `contactUrl` | `string` | no | URL for the brand's contact page. |
| `url` | `string` | no | Brand website URL. |
| `privacyContact` | `string` | no | Contact handle used for privacy-protected WHOIS records. Requires BRAND_PRIVACY permission. |
| `abuseContact` | `string` | no | Contact handle exposed in WHOIS/RDAP for abuse reports. |

**Responses**

- `201` - Brand created.

**Errors:** `InvalidParameter`, `ObjectExists`

**Gotchas**

- `privacyContact` and `abuseContact` are contact handles, not email addresses.


### `updateBrand`

`POST /v2/customers/{customer}/brands/{handle}/update`

Update a brand. Fields accept an empty string to clear where noted.

- **Docs:** `https://dm.realtimeregister.com/docs/api/brands/update`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `customer` | `string` | yes |  |
| `handle` | `string` | yes |  |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `hideOptionalTerms` | `boolean` | no |  |
| `locale` | `string` | no |  |
| `organization` | `string` | no |  |
| `addressLine` | `string[]` | no |  |
| `postalCode` | `string` | no |  |
| `city` | `string` | no |  |
| `state` | `string` | no | Pass an empty string to remove. |
| `country` | `CountryCode` | no |  |
| `email` | `string` | no |  |
| `contactEmail` | `string` | no | Contact email address. |
| `replyToEmail` | `string` | no | Reply-to email address. |
| `voice` | `string` | no |  |
| `fax` | `string` | no | Pass an empty string to remove. |
| `contactUrl` | `string` | no |  |
| `url` | `string` | no | Pass an empty string to remove. |
| `privacyContact` | `string` | no | Empty string clears the privacy contact. |
| `abuseContact` | `string` | no |  |

**Responses**

- `200` - Brand updated.

**Errors:** `InvalidParameter`, `ObjectDoesNotExist`


### `deleteBrand`

`DELETE /v2/customers/{customer}/brands/{handle}`

Delete a brand.

- **Docs:** `https://dm.realtimeregister.com/docs/api/brands/delete`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `customer` | `string` | yes |  |
| `handle` | `string` | yes |  |

**Responses**

- `204` - Brand deleted.

**Errors:** `ObjectDoesNotExist`, `InvalidParameter`

**Gotchas**

- The `default` brand cannot be deleted.
- Reassign contacts before deleting a brand; orphaned contacts are rejected.


### `getBrandTemplate`

`GET /v2/customers/{customer}/brands/{brand}/templates/{name}`

Retrieve a brand-specific notification/mail template override.

- **Docs:** `https://dm.realtimeregister.com/docs/api/brands/templates/get`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `customer` | `string` | yes |  |
| `brand` | `string` | yes |  |
| `name` | `string` | yes | Template identifier (e.g. TRANSFER_FOA, CONTACT_VERIFICATION). |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `fields` | `string` | no | Comma-separated field selector. |

**Responses**

- `200` - Template object with `subject`, `text`, `html`, `locale`.

**Errors:** `ObjectDoesNotExist`


### `listBrandTemplates`

`GET /v2/customers/{customer}/brands/{brand}/templates`

List configured template overrides for a brand.

- **Docs:** `https://dm.realtimeregister.com/docs/api/brands/templates/list`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `customer` | `string` | yes |  |
| `brand` | `string` | yes |  |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `fields` | `string` | no |  |
| `q` | `string` | no |  |
| `limit` | `integer` | no |  |
| `offset` | `integer` | no |  |
| `order` | `string` | no |  |

**Responses**

- `200` - Paginated envelope of Template objects.

**Errors:** `InvalidParameter`


### `updateBrandTemplate`

`POST /v2/customers/{customer}/brands/{brand}/templates/{name}/update`

Create or update a brand template override. Omit a field to inherit the platform default.

- **Docs:** `https://dm.realtimeregister.com/docs/api/brands/templates/update`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `customer` | `string` | yes |  |
| `brand` | `string` | yes |  |
| `name` | `string` | yes |  |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `subject` | `string` | no | The subject, for mail templates. |
| `text` | `string` | no | Plain-text body with `{{placeholder}}` variables. |
| `html` | `string` | no | HTML body with `{{placeholder}}` variables. |

**Responses**

- `200` - Override saved.

**Errors:** `InvalidParameter`, `ObjectDoesNotExist`

**Gotchas**

- Sending empty strings clears the override for that locale; sending null is rejected.
- The `template` path parameter already scopes the override to a single locale-neutral template name; the live body table has no separate `locale` field.


### `previewBrandTemplate`

`GET /v2/customers/{customer}/brands/{brand}/templates/{name}/preview`

Render a template with sample data to preview the rendered subject/body.

- **Docs:** `https://dm.realtimeregister.com/docs/api/brands/templates/preview`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `customer` | `string` | yes |  |
| `brand` | `string` | yes |  |
| `name` | `string` | yes |  |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `context` | `string` | no | The context to request a preview for. |

**Responses**

- `200` - Rendered `{ subject, text, html }` preview.

**Errors:** `InvalidParameter`, `ObjectDoesNotExist`

**Gotchas**

- GET, not POST; a GET has no request body. The live docs page for this operation has no `locale` field at all (query or body) - the previously spec'd required `locale` body field does not exist on the live page and has been dropped rather than moved to a query param.


### `listBrandLocales`

`GET /v2/brands/locales`

List supported locales for brand templates.

- **Docs:** `https://dm.realtimeregister.com/docs/api/brands/locales`
- **Auth scope:** `customer`

**Responses**

- `200` - Array of locale identifiers (e.g. `en_US`, `nl_NL`, `de_DE`).


