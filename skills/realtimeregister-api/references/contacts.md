# Contacts (`contacts`)

Contacts are registrant/admin/tech/billing identities. They live under a
customer and a brand. Use `createContact` first, then reference the returned
handle in domain operations.

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

### `getContact`

`GET /v2/customers/{customer}/contacts/{handle}`

Retrieve a single contact.

- **Docs:** `https://dm.realtimeregister.com/docs/api/contacts/get`
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

- `200` - Full Contact object.

**Errors:** `ObjectDoesNotExist`, `AuthorizationFailed`


### `listContacts`

`GET /v2/customers/{customer}/contacts`

List contacts for a customer.

- **Docs:** `https://dm.realtimeregister.com/docs/api/contacts/list`
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

- `200` - Paginated envelope of Contact objects.

**Errors:** `InvalidParameter`

**Gotchas**

- Filter/order parameters follow the generic listing format (see /docs/api/listings#filtering).


### `createContact`

`POST /v2/customers/{customer}/contacts/{handle}`

Create a new contact under the given customer.

- **Docs:** `https://dm.realtimeregister.com/docs/api/contacts/create`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `customer` | `string` | yes | Customer handle. |
| `handle` | `string` | yes | Desired contact handle. |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `brand` | `string` | no | Brand handle; defaults to 'default'. |
| `organization` | `string` | no |  |
| `name` | `string` | yes |  |
| `addressLine` | `string[]` | yes |  |
| `postalCode` | `string` | yes |  |
| `city` | `string` | yes |  |
| `state` | `string` | no |  |
| `country` | `string` | yes | ISO 3166-1 alpha-2 country code. |
| `email` | `string` | yes |  |
| `voice` | `string` | yes | E164a format, e.g. +31.384530759. |
| `fax` | `string` | no |  |
| `disclosedFields` | `string[]` | no | Fields to disclose in RDAP. `country` and `state` are always public. |
| `validations` | `ContactValidation[]` | no | Pre-validation records; requires CONTACT_VALIDATION permission. |
| `verifications` | `ContactVerification[]` | no | Verifications performed for this contact; requires CONTACT_VERIFICATION permission. |

**Responses**

- `201` - Contact created.

**Errors:** `InvalidParameter`, `ObjectExists`, `AuthorizationFailed`

**Gotchas**

- Contact `handle` is in the URL, not the body.
- `voice` must match `\+[0-9]{1,3}\.[0-9]{1,14}` (E164a format with a dot).
- `country` must be 2 uppercase letters; the SDK incorrectly accepted `countryCode`.
- Allowed claim/method/proof combinations: https://dm.realtimeregister.com/docs/api/contacts/verification-matrix


### `updateContact`

`POST /v2/customers/{customer}/contacts/{handle}/update`

Update mutable contact fields. Omitted fields are preserved.

- **Docs:** `https://dm.realtimeregister.com/docs/api/contacts/update`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `customer` | `string` | yes |  |
| `handle` | `string` | yes |  |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `brand` | `string` | no | Brand handle to move this contact to. |
| `organization` | `string` | no |  |
| `name` | `string` | no |  |
| `addressLine` | `string[]` | no |  |
| `postalCode` | `string` | no |  |
| `city` | `string` | no |  |
| `state` | `string` | no |  |
| `country` | `string` | no |  |
| `email` | `string` | no |  |
| `voice` | `string` | no |  |
| `fax` | `string` | no |  |
| `designatedAgent` | `DesignatedAgent` | no | Requires the DESIGNATED_AGENT permission for any value other than NONE. |
| `disclosedFields` | `DisclosedField` | no |  |
| `validations` | `ContactValidation[]` | no | Optional pre-validation records to attach alongside the update. |
| `verifications` | `ContactVerification[]` | no | Verifications performed for this contact; requires CONTACT_VERIFICATION permission. |

**Responses**

- `200` - Contact updated.

**Errors:** `InvalidParameter`, `ObjectDoesNotExist`

**Gotchas**

- Country and state are always publicly disclosed regardless of `disclosedFields`.
- Allowed claim/method/proof combinations: https://dm.realtimeregister.com/docs/api/contacts/verification-matrix


### `validateContact`

`POST /v2/customers/{customer}/contacts/{handle}/validate`

Submit pre-validation records for a contact.

- **Docs:** `https://dm.realtimeregister.com/docs/api/contacts/validate`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `customer` | `string` | yes |  |
| `handle` | `string` | yes |  |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `categories` | `string[]` | yes | List of validation category names to certify (see listValidationCategories). |

**Responses**

- `200` - Contact validation recorded.

**Errors:** `InvalidParameter`, `ObjectDoesNotExist`, `AuthorizationFailed`

**Gotchas**

- The body is a list of category names; the server attaches the active `termsVersion` automatically.


### `splitContact`

`POST /v2/customers/{customer}/contacts/{handle}/split`

Split a shared contact into a new handle to avoid cross-brand mutation side effects.

- **Docs:** `https://dm.realtimeregister.com/docs/api/contacts/split`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `customer` | `string` | yes |  |
| `handle` | `string` | yes |  |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `newHandle` | `string` | yes |  |
| `registries` | `string[]` | no | Optional list of registry identifiers to scope the split; defaults to all registries using the contact. |

**Responses**

- `201` - New contact created with the split identity.

**Errors:** `InvalidParameter`, `ObjectExists`


### `deleteContact`

`DELETE /v2/customers/{customer}/contacts/{handle}`

Delete a contact.

- **Docs:** `https://dm.realtimeregister.com/docs/api/contacts/delete`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `customer` | `string` | yes |  |
| `handle` | `string` | yes |  |

**Responses**

- `204` - Contact deleted.

**Errors:** `ObjectDoesNotExist`, `AuthorizationFailed`

**Gotchas**

- Registry rejects deletion while the contact is referenced by an active domain.


### `addContactProperties`

`POST /v2/customers/{customer}/contacts/{handle}/{registry}`

Add TLD-specific contact properties for a given registry (e.g. `nl-legalForm`).

- **Docs:** `https://dm.realtimeregister.com/docs/api/contacts/properties/add`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `customer` | `string` | yes |  |
| `handle` | `string` | yes |  |
| `registry` | `string` | yes | Registry identifier (e.g. sidn, dns-be). |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `properties` | `object` | yes | Map of property name to value. See /tlds/{tld}/info contactProperties. |
| `intendedUsage` | `IntendedUsage` | no | Intended usage for the contact; defaults to REGISTRANT. |

**Responses**

- `200` - Properties added.

**Errors:** `InvalidParameter`, `ObjectDoesNotExist`


### `updateContactProperties`

`POST /v2/customers/{customer}/contacts/{handle}/{registry}/update`

Replace existing TLD-specific contact properties for a given registry.

- **Docs:** `https://dm.realtimeregister.com/docs/api/contacts/properties/update`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `customer` | `string` | yes |  |
| `handle` | `string` | yes |  |
| `registry` | `string` | yes |  |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `properties` | `object` | yes |  |

**Responses**

- `200` - Properties updated.

**Errors:** `InvalidParameter`, `ObjectDoesNotExist`


### `getCountry`

`GET /v2/countries/{country}`

Lookup a single country by ISO 3166-1 alpha-2 code.

- **Docs:** `https://dm.realtimeregister.com/docs/api/countries/get`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `country` | `string` | yes | ISO 3166-1 alpha-2 code. |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `fields` | `string` | no | Comma-separated field selector. |

**Responses**

- `200` - Country object (code, name, flags).

**Errors:** `ObjectDoesNotExist`


### `listCountries`

`GET /v2/countries`

List all known countries.

- **Docs:** `https://dm.realtimeregister.com/docs/api/countries/list`
- **Auth scope:** `customer`

**Responses**

- `200` - Paginated envelope of Country objects.


