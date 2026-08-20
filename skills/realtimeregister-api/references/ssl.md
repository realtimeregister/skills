# SSL (`ssl`)

Order, validate, reissue, renew, and revoke SSL certificates. DCV
(Domain Control Validation) is the critical hand-off; see the DcvType enum
in _shared.yaml for accepted methods.

**Base URL:** `https://api.yoursrs.com`  
**Docs:** `https://dm.realtimeregister.com/docs/api`

## Operations

### `getCertificate`

`GET /v2/ssl/certificates/{certificateId}`

Retrieve a certificate order and its current state.

- **Docs:** `https://dm.realtimeregister.com/docs/api/ssl/get`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `certificateId` | `string` | yes |  |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `fields` | `string` | no | Comma-separated field selector. |

**Responses**

- `200` - Certificate object with `status`, `commonName`, `sans`, `dcv`, `validFrom`, `validUntil`.

**Errors:** `ObjectDoesNotExist`, `AuthorizationFailed`


### `listCertificates`

`GET /v2/ssl/certificates`

List certificate orders.

- **Docs:** `https://dm.realtimeregister.com/docs/api/ssl/list`
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

- `200` - Paginated envelope of Certificate objects.

**Errors:** `InvalidParameter`


### `getProduct`

`GET /v2/ssl/products/{product}`

Retrieve SSL product metadata (validation type, SAN limits, warranty).

- **Docs:** `https://dm.realtimeregister.com/docs/api/ssl/products/get`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `product` | `string` | yes |  |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `fields` | `string` | no | Comma-separated field selector. |

**Responses**

- `200` - Product object with `brand`, `validationType`, `maxSans`, `periods`.

**Errors:** `ObjectDoesNotExist`


### `listProducts`

`GET /v2/ssl/products`

List SSL products available to the authenticated customer.

- **Docs:** `https://dm.realtimeregister.com/docs/api/ssl/products/list`
- **Auth scope:** `customer`

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `fields` | `string` | no |  |
| `q` | `string` | no | Filter, e.g. validationType:EV. |
| `limit` | `integer` | no |  |
| `offset` | `integer` | no |  |

**Responses**

- `200` - Paginated envelope of Product objects.

**Errors:** `InvalidParameter`


### `requestCertificate`

`POST /v2/ssl/certificates`  _async_

Place a new certificate order.

- **Docs:** `https://dm.realtimeregister.com/docs/api/ssl/request`
- **Auth scope:** `customer`

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `quote` | `boolean` | no |  |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `customer` | `string` | yes | The customer handle. |
| `product` | `string` | yes | SSL product identifier. |
| `period` | `integer` | yes | Validity period in MONTHS. |
| `csr` | `string` | yes | PEM-encoded PKCS#10 CSR. |
| `domainName` | `string` | no | Overrides the common name in the CSR; see requiredFields/optionalFields in SSL product metadata. |
| `san` | `string[]` | no | SAN domains, overrides the alternative names in the CSR. Only applicable for multi-domain certificates. Set to an empty list to exclude the free www/non-www name. |
| `organization` | `string` | no | Overrides the Organization field in the CSR. |
| `department` | `string` | no | Deprecated. Overrides the Organisational Unit field in the CSR. |
| `country` | `CountryCode` | no | Taken from the CSR when not explicitly passed. |
| `state` | `string` | no | Taken from the CSR when not explicitly passed. |
| `address` | `string` | no | See requiredFields/optionalFields in SSL product metadata for supported usage. |
| `postalCode` | `string` | no | See requiredFields/optionalFields in SSL product metadata for supported usage. |
| `city` | `string` | no | Overrides the City field in the CSR. |
| `coc` | `string` | no | Chamber of Commerce identifier. |
| `saEmail` | `string` | no | Recipient for the Subscriber Agreement. |
| `saLanguage` | `string` | no | Deprecated. Use `language`; kept for backward compatibility when `language` is not supplied. |
| `language` | `string` | no | Preferred language for validations. Defaults based on country; falls back to English if unsupported by the provider. |
| `uniqueValue` | `string` | no | Alphanumeric DCV validation value; a random string is generated if omitted. |
| `authKey` | `boolean` | no | Use auth key validation for direct issuance. |
| `approver` | `Approver` | no | Approver of the certificate. |
| `dcv` | `Dcv[]` | no | DCV method per FQDN. |
| `billables` | `Billable[]` | no |  |

**Responses**

- `201` - Certificate order created; poll for issuance.
- `202` - { processId } - async issuance via SDK-level workflow.

**Errors:** `InvalidParameter`, `BillableAcknowledgmentNeededException`

**Gotchas**

- `period` is MONTHS; industry-standard max is 13.
- DV orders allow DCV via EMAIL/DNS/HTTP/HTTPS; OV/EV typically require EMAIL plus organization verification.
- CSR `commonName` must match the first SAN.
- `customer` is required by the live API even though it does not appear in the URL. `sans` from earlier spec revisions has been renamed to `san` to match the wire format; `organization` is a flat string here, not an object (unlike `SslOrganization` used elsewhere).


### `reissueCertificate`

`POST /v2/ssl/certificates/{certificateId}/reissue`  _async_

Reissue a certificate with a new CSR or SAN set.

- **Docs:** `https://dm.realtimeregister.com/docs/api/ssl/reissue`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `certificateId` | `string` | yes |  |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `quote` | `boolean` | no |  |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `csr` | `string` | yes | A valid Certificate Signing Request. |
| `domainName` | `string` | no | Overrides the common name in the CSR; see requiredFields/optionalFields in SSL product metadata. |
| `san` | `string[]` | no | SAN domains, overrides the alternative names in the CSR. Only applicable for multi-domain certificates. Set to an empty list to exclude the free www/non-www name. |
| `organization` | `string` | no | Overrides the Organization field in the CSR. |
| `department` | `string` | no | Deprecated. Overrides the Organisational Unit field in the CSR. |
| `state` | `string` | no | Taken from the CSR when not explicitly passed. |
| `address` | `string` | no | See requiredFields/optionalFields in SSL product metadata for supported usage. |
| `postalCode` | `string` | no | See requiredFields/optionalFields in SSL product metadata for supported usage. |
| `city` | `string` | no | Overrides the City field in the CSR. |
| `coc` | `string` | no | Chamber of Commerce identifier. |
| `language` | `string` | no | Preferred language for validations. Defaults based on country; falls back to English if unsupported by the provider. |
| `uniqueValue` | `string` | no | Alphanumeric DCV validation value; a random string is generated if omitted. |
| `authKey` | `boolean` | no | Use auth key validation for direct issuance. |
| `approver` | `Approver` | no | Approver of the certificate. |
| `dcv` | `Dcv[]` | no |  |

**Responses**

- `202` - { processId }

**Errors:** `InvalidParameter`, `ObjectDoesNotExist`

**Gotchas**

- `sans` from earlier spec revisions has been renamed to `san` to match the wire format.


### `renewCertificate`

`POST /v2/ssl/certificates/{certificateId}/renew`  _async_

Renew an existing certificate.

- **Docs:** `https://dm.realtimeregister.com/docs/api/ssl/renew`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `certificateId` | `string` | yes |  |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `quote` | `boolean` | no |  |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `product` | `string` | no | Product to renew to; defaults to the current product when omitted. |
| `period` | `integer` | yes | Validity period in MONTHS. |
| `csr` | `string` | yes | A valid Certificate Signing Request. |
| `domainName` | `string` | no | Overrides the common name in the CSR; see requiredFields/optionalFields in SSL product metadata. |
| `san` | `string[]` | no | SAN domains, overrides the alternative names in the CSR. Only applicable for multi-domain certificates. Set to an empty list to exclude the free www/non-www name. |
| `organization` | `string` | no | Overrides the Organization field in the CSR. |
| `department` | `string` | no | Deprecated. Overrides the Organisational Unit field in the CSR. |
| `state` | `string` | no | Taken from the CSR when not explicitly passed. |
| `address` | `string` | no | See requiredFields/optionalFields in SSL product metadata for supported usage. |
| `postalCode` | `string` | no | See requiredFields/optionalFields in SSL product metadata for supported usage. |
| `city` | `string` | no | Overrides the City field in the CSR. |
| `coc` | `string` | no | Chamber of Commerce identifier. |
| `language` | `string` | no | Preferred language for validations. Defaults based on country; falls back to English if unsupported by the provider. |
| `uniqueValue` | `string` | no | Alphanumeric DCV validation value; a random string is generated if omitted. |
| `authKey` | `boolean` | no | Use auth key validation for direct issuance. |
| `approver` | `Approver` | no | Approver of the certificate. |
| `dcv` | `Dcv[]` | no |  |
| `billables` | `Billable[]` | no |  |

**Responses**

- `202` - { processId }

**Errors:** `InvalidParameter`, `BillableAcknowledgmentNeededException`


### `revokeCertificate`

`DELETE /v2/ssl/certificates/{certificateId}`  _async_

Revoke a certificate.

- **Docs:** `https://dm.realtimeregister.com/docs/api/ssl/revoke`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `certificateId` | `string` | yes |  |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `reason` | `string` | no |  |

**Responses**

- `202` - { processId }

**Errors:** `InvalidParameter`, `ObjectDoesNotExist`

**Gotchas**

- DELETE on the bare certificate resource, not POST .../revoke. The live docs page slug (`/ssl/revoke`) is retained for docUrl fidelity even though the HTTP method is DELETE.


### `resendDcv`

`POST /v2/processes/{processId}/resend`

Re-send the DCV email or re-check a DNS/HTTP DCV token for a pending certificate request.

- **Docs:** `https://dm.realtimeregister.com/docs/api/ssl/resenddcv`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `processId` | `integer` | yes | Process ID of the pending certificate request. |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `dcv` | `Dcv[]` | yes | List of DCVs for this certificate. |

**Responses**

- `200` - DCV request re-queued; response may include a `warning` string on partial success.

**Errors:** `InvalidParameter`, `ObjectDoesNotExist`

**Gotchas**

- Specialized form of resendProcess (see processes.yaml) for certificate DCV; same endpoint, DCV-specific body.


### `downloadCertificate`

`GET /v2/ssl/certificates/{certificateId}/download`

Download the issued certificate in PEM or PKCS#7 format.

- **Docs:** `https://dm.realtimeregister.com/docs/api/ssl/download`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `certificateId` | `string` | yes |  |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `format` | `string` | no |  |

**Responses**

- `200` - Certificate chain.

**Errors:** `ObjectDoesNotExist`, `InvalidParameter`

**Gotchas**

- Method verified manually (GET); docs page lacks a machine-readable method span, so it is excluded from the live diff.


### `scheduleValidationCall`

`POST /v2/processes/{processId}/schedule-validation-call`

Schedule an EV validation call with the CA for a pending certificate request.

- **Docs:** `https://dm.realtimeregister.com/docs/api/ssl/schedule-validation-call`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `processId` | `integer` | yes | Process ID of the pending certificate request. |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `date` | `string` | yes | Should be during Dutch office hours; the call can generally be expected within an hour of the planned time. |

**Responses**

- `200` - Validation call scheduled.

**Errors:** `InvalidParameter`, `ObjectDoesNotExist`


### `getDcvEmails`

`GET /v2/ssl/dcvemailaddresslist/{domainName}`

List the approver email addresses accepted for EMAIL DCV on a given domain.

- **Docs:** `https://dm.realtimeregister.com/docs/api/ssl/dcvemailaddresslist`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `domainName` | `string` | yes | The domain name. |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `product` | `string` | no | The product to fetch addresses for. |

**Responses**

- `200` - Array of candidate email addresses (WHOIS + constructed).

**Errors:** `InvalidParameter`


### `sendSubscriberAgreement`

`POST /v2/processes/{processId}/send-subscriber-agreement`

Send (or re-send) the CA Subscriber Agreement email to the approver for a pending certificate request that requires explicit acceptance.

- **Docs:** `https://dm.realtimeregister.com/docs/api/ssl/send-subscriber-agreement`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `processId` | `integer` | yes | Process ID of the pending certificate request. |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `email` | `string` | yes | The email address to send the subscriber agreement to. |
| `language` | `string` | no | Language for the subscriber agreement. |

**Responses**

- `200` - Subscriber-agreement email dispatched.

**Errors:** `InvalidParameter`, `ObjectDoesNotExist`

**Gotchas**

- Required for some OV/EV products on first issuance; a no-op once accepted.


### `addNoteDeprecated`

`POST /v2/processes/{processId}/add-note`

Attach a free-form note to a certificate order. DEPRECATED; use a ticketing system instead.

- **Docs:** `https://dm.realtimeregister.com/docs/api/ssl/add-note`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `processId` | `integer` | yes | The process ID. |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `message` | `string` | yes | Message which should be sent to the SSL provider. |

**Responses**

- `200` - Note stored.

**Errors:** `InvalidParameter`, `ObjectDoesNotExist`

**Gotchas**

- Marked Deprecated in the live documentation; new integrations should avoid this endpoint.
- The body field is `message`, not `note`.
- Same process-family fix as resendDcv/scheduleValidationCall/sendSubscriberAgreement (plan 010): endpoint is rooted under /v2/processes/{processId}/, not /v2/ssl/certificates/{id}/.


### `importCertificate`

`POST /v2/ssl/import`

Import an externally issued certificate so it can be tracked and renewed through the platform.

- **Docs:** `https://dm.realtimeregister.com/docs/api/ssl/import`
- **Auth scope:** `customer`

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `customer` | `string` | yes | The customer handle. |
| `certificate` | `string` | yes | PEM-encoded certificate (leaf). |
| `csr` | `string` | no | Original PEM-encoded CSR (if available). |
| `coc` | `string` | no | Chamber of Commerce identifier. |
| `domainName` | `string` | no | Overrides the common name of the certificate; if the certificate's common name differs from this value, it is added as a SAN. Use to choose which SAN becomes the common name for certs issued without one. |

**Responses**

- `201` - Certificate imported; `id` returned for subsequent renew/revoke operations.

**Errors:** `InvalidParameter`


### `decodeCsr`

`POST /v2/ssl/decodecsr`

Decode a PEM-encoded CSR and return its parsed fields (commonName, SANs, organization, keyBits, signatureAlgorithm).

- **Docs:** `https://dm.realtimeregister.com/docs/api/ssl/decocdecsr`
- **Auth scope:** `customer`

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `csr` | `string` | yes | PEM-encoded PKCS#10 CSR. |

**Responses**

- `200` - Decoded CSR object.

**Errors:** `InvalidParameter`

**Gotchas**

- The live-docs slug is `decocdecsr` (sic); preserved for fidelity with the navigation menu.


### `generateAuthKey`

`POST /v2/ssl/authkey`

Generate a new authKey used for ACME external-account-binding (EAB) or programmatic re-key operations.

- **Docs:** `https://dm.realtimeregister.com/docs/api/ssl/generate-authkey`
- **Auth scope:** `customer`

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `product` | `string` | yes | The SSL product. |
| `csr` | `string` | yes | The Certificate Signing Request. |

**Responses**

- `200` - `{ authKey }` - store securely; re-generating invalidates prior keys.


