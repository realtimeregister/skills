# Notifications (`notifications`)

Notifications are platform-generated events (process completion, transfer
status, expiry warnings, registry announcements) deliverable via webhook.

**Base URL:** `https://api.yoursrs.com`  
**Docs:** `https://dm.realtimeregister.com/docs/api`

## Operations

### `getNotification`

`GET /v2/customers/{customer}/notifications/{notificationId}`

Retrieve a single notification.

- **Docs:** `https://dm.realtimeregister.com/docs/api/notifications/get`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `customer` | `string` | yes |  |  |
| `notificationId` | `integer` | yes |  |  |

**Query params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `fields` | `string` | no |  | Comma-separated field selector. |

**Responses**

- `200` - Notification object with `type`, `data`, `createdDate`, optional `acknowledgeDate`.

**Errors:** `ObjectDoesNotExist`, `AuthorizationFailed`


### `listNotifications`

`GET /v2/customers/{customer}/notifications`

List notifications for the customer.

- **Docs:** `https://dm.realtimeregister.com/docs/api/notifications/list`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `customer` | `string` | yes |  |  |

**Query params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `limit` | `integer` | no | 10 | Number of entities to return; use 0 for a count-only request. Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 See [common listing rules](listings.md). |
| `offset` | `integer` | no | 0 | Zero-based result offset. Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 See [common listing rules](listings.md). |
| `order` | `string` | no |  | Sort field; prefix with `-` for descending order. Repeat to sort by multiple fields. Default order differs per listing; set order explicitly when paginating with offset. See [common listing rules](listings.md). |
| `total` | `boolean` | no | true | Set to false to omit the total match count and improve performance. See [common listing rules](listings.md). |
| `q` | `string` | no |  | Plain-text substring search across entity fields;  Values are NOT filter expressions: `q=status:OK` is matched literally and returns HTTP 200 with an empty `entities` array; filter with `status=OK` instead. See [common listing rules](listings.md). |
| `fields` | `string` | no |  | Comma-separated fields to include. Identifying fields remain included; properties without a value may be omitted from each entity. See [common listing rules](listings.md). |
| `export` | `boolean` | no |  | Return all records. Cannot be combined with limit or offset; default projection contains identifying fields only. See [common listing rules](listings.md). |

**Responses**

- `200` - Paginated envelope.

**Errors:** `InvalidParameter`


### `pollNotification`

`GET /v2/customers/{customer}/notifications/poll`

Poll for the next unacknowledged notification.

- **Docs:** `https://dm.realtimeregister.com/docs/api/notifications/poll`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `customer` | `string` | yes |  |  |

**Responses**

- `200` - `{ count, notification }` - `count` is total unacknowledged; `notification` is the next one (same shape as getNotification) or omitted when the queue is empty.

**Gotchas**

- Acknowledge the returned notification via ackNotification to advance the queue; otherwise subsequent polls return the same item.


### `ackNotification`

`POST /v2/customers/{customer}/notifications/{notificationId}/ack`

Acknowledge a notification.

- **Docs:** `https://dm.realtimeregister.com/docs/api/notifications/ack`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `customer` | `string` | yes |  |  |
| `notificationId` | `integer` | yes |  |  |

**Responses**

- `200` - Notification acknowledged.

**Errors:** `ObjectDoesNotExist`


### `webhookNotification`

`POST (customer-configured webhook URL)`

Documentation-only. Describes the POST that Realtime Register delivers to a customer-configured webhook URL.

- **Docs:** `https://dm.realtimeregister.com/docs/api/notifications/webhook`
- **Auth scope:** `customer`

**Responses**

- `200` - Any 200/201/202 response marks the delivery as successful and dequeues the notification.

**Gotchas**

- Webhook URLs are configured in the customer portal (Account details -> Notifications), not via this API.
- Payload is identical to getNotification but omits `acknowledgeDate`.
- Authentication: HMAC-SHA256 of the raw body using the shared key (Base64 encoded) is sent in the `Signature` header. Basic-auth credentials configured in the portal are also supported.
- Retries: up to 5 attempts at 10s / 30s / 2m / 5m / 15m. After the last failure an email alert is sent and the global queue stalls until delivery succeeds.
- The event queue is global per user - a failing webhook blocks delivery of unrelated notifications.


