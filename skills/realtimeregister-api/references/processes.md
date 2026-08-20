# Processes (`processes`)

Processes represent asynchronous work items. Poll `/v2/processes/{id}` until
`status` is one of COMPLETED, FAILED, or CANCELLED. See _shared.ProcessStatus.

**Base URL:** `https://api.yoursrs.com`  
**Docs:** `https://dm.realtimeregister.com/docs/api`

## Operations

### `getProcess`

`GET /v2/processes/{processId}`

Retrieve a single process and its current status.

- **Docs:** `https://dm.realtimeregister.com/docs/api/processes/get`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `processId` | `integer` | yes | processId returned from the originating mutation. |

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `fields` | `string` | no | Comma-separated field selector. |

**Responses**

- `200` - Process object with `status`, `type`, `createdDate`, `result`, and `errors`.

**Errors:** `ObjectDoesNotExist`, `AuthorizationFailed`

**Gotchas**

- Poll with exponential backoff (start 1s, cap 30s). Most processes complete within 10s.


### `getProcessInfo`

`GET /v2/processes/{processId}/info`

Retrieve process-type specific info (e.g. certificate request validation state).

- **Docs:** `https://dm.realtimeregister.com/docs/api/processes/info`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `processId` | `integer` | yes |  |

**Responses**

- `200` - Type-specific info response. Currently defined for `certificate` and `acme` processes; includes `requiresAttention`, `validations`, and (non-ACME) `notes`/`dcv` lists.

**Errors:** `ObjectDoesNotExist`, `InvalidParameter`

**Gotchas**

- Call this when `detailStatus=SSL_REQUIRES_ATTENTION` surfaces in listProcesses to discover which validation step is blocking.


### `listProcesses`

`GET /v2/processes`

List recent processes scoped to the authenticated customer.

- **Docs:** `https://dm.realtimeregister.com/docs/api/processes/list`
- **Auth scope:** `customer`

**Query params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `fields` | `string` | no |  |
| `q` | `string` | no | Filter expression, e.g. status:RUNNING AND type:CREATE_DOMAIN. |
| `limit` | `integer` | no |  |
| `offset` | `integer` | no |  |
| `order` | `string` | no |  |

**Responses**

- `200` - Paginated envelope of Process objects.

**Errors:** `InvalidParameter`


### `resendProcess`

`POST /v2/processes/{processId}/resend`

Resend the request a process is pending on (e.g. a FOA mail to a registrant).

- **Docs:** `https://dm.realtimeregister.com/docs/api/processes/resend`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `processId` | `integer` | yes |  |

**Responses**

- `200` - Resend accepted.

**Errors:** `ObjectDoesNotExist`, `InvalidParameter`

**Gotchas**

- Only applicable when the process's `resumeType` is `RESEND`.
- For certificate request DCV a process-type-specific request body is accepted; consult the live docs.


### `cancelProcess`

`DELETE /v2/processes/{processId}`

Request cancellation of a PENDING or RUNNING process.

- **Docs:** `https://dm.realtimeregister.com/docs/api/processes/cancel`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `processId` | `integer` | yes |  |

**Responses**

- `200` - Cancellation accepted; poll getProcess to confirm final status.

**Errors:** `ObjectDoesNotExist`, `InvalidParameter`

**Gotchas**

- Not all process types are cancellable; COMPLETED/FAILED processes return InvalidParameter.
- DELETE on the bare process resource, not POST .../cancel. The live docs page slug (`/processes/cancel`) is retained for docUrl fidelity even though the HTTP method is DELETE.


