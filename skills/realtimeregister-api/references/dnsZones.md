# DNS Zones (`dnsZones`)

Managed DNS zones hosted by Realtime Register. Only one zone can exist per
service per domain name. Modifying a zone that is pending deletion triggers
immediate re-creation.

**Base URL:** `https://api.yoursrs.com`  
**Docs:** `https://dm.realtimeregister.com/docs/api`

## Operations

### `getDnsZone`

`GET /v2/dns/zones/{zoneId}`

Retrieve a single DNS zone and its records.

- **Docs:** `https://dm.realtimeregister.com/docs/api/dns/zones/get`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `zoneId` | `integer` | yes |  | Numeric DNS zone ID returned by createDnsZone/listDnsZones. |

**Query params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `fields` | `string` | no |  | Comma-separated field selector. |

**Responses**

- `200` - Zone with `records`, SOA metadata, and DNSSEC state.

**Errors:** `ObjectDoesNotExist`, `AuthorizationFailed`

**Gotchas**

- Zones are addressed by numeric `zoneId`, not by domain name.


### `listDnsZones`

`GET /v2/dns/zones`

List managed DNS zones.

- **Docs:** `https://dm.realtimeregister.com/docs/api/dns/zones/list`
- **Auth scope:** `customer`

**Query params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `limit` | `integer` | no | 10 | Number of entities to return; use 0 for a count-only request. Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 Min: 0 Max: 250 See [common listing rules](listings.md). |
| `offset` | `integer` | no | 0 | Zero-based result offset. Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 Min: 0 See [common listing rules](listings.md). |
| `order` | `string` | no |  | Sort field; prefix with `-` for descending order. Repeat to sort by multiple fields. Default order differs per listing; set order explicitly when paginating with offset. See [common listing rules](listings.md). |
| `total` | `boolean` | no | true | Set to false to omit the total match count and improve performance. See [common listing rules](listings.md). |
| `q` | `string` | no |  | Plain-text substring search across entity fields;  Values are NOT filter expressions: `q=status:OK` is matched literally and returns HTTP 200 with an empty `entities` array; filter with `status=OK` instead. See [common listing rules](listings.md). |
| `fields` | `string` | no |  | Comma-separated fields to include. Identifying fields remain included; properties without a value may be omitted from each entity. See [common listing rules](listings.md). |
| `export` | `boolean` | no |  | Return all records. Cannot be combined with limit or offset; default projection contains identifying fields only. See [common listing rules](listings.md). |

**Responses**

- `200` - Paginated envelope.

**Errors:** `InvalidParameter`


### `createDnsZone`

`POST /v2/dns/zones`

Create an unmanaged or template-linked DNS zone.

- **Docs:** `https://dm.realtimeregister.com/docs/api/dns/zones/create`
- **Auth scope:** `customer`

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | `string` | yes |  |
| `service` | `DnsService` | no | Defaults to BASIC. |
| `template` | `string` | no | Template name to clone records from. |
| `link` | `boolean` | no | Unless false, zone is linked to the template. |
| `master` | `string` | no | IP of a hidden master (secondary-zone setup). |
| `ns` | `string[]` | no | Custom nameservers. |
| `dnssec` | `boolean` | no | Provision with DNSSEC. |
| `hostMaster` | `string` | no | SOA MNAME email contact. |
| `refresh` | `integer` | no | SOA REFRESH in seconds. |
| `retry` | `integer` | no |  |
| `expire` | `integer` | no |  |
| `ttl` | `integer` | no |  |
| `records` | `DnsRecord[]` | no |  |
| `billables` | `Billable[]` | no | Copy verbatim from BillableAcknowledgmentNeededException and re-submit. |

**Responses**

- `201` - Zone created; response includes `id`.

**Errors:** `InvalidParameter`, `DnsConfigurationException`, `ObjectExists`, `BillableAcknowledgmentNeededException`

**Gotchas**

- Set `link: false` when cloning from a template but intending to diverge.
- `prio` is required on MX and SRV records.
- When `service` is PREMIUM, pricing is billable; expect BillableAcknowledgmentNeededException on first call.


### `updateDnsZone`

`POST /v2/dns/zones/{zoneId}/update`

Replace zone metadata and/or records.

- **Docs:** `https://dm.realtimeregister.com/docs/api/dns/zones/update`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `zoneId` | `integer` | yes |  |  |

**Request body** (`application/json`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `template` | `string` | no | Name of a template to clone records from. |
| `link` | `boolean` | no | Unless false, keep the zone linked to the template. |
| `master` | `string` | no | IP of the hidden master. Send empty string to convert a slave zone to a master zone. |
| `ns` | `string[]` | no | Custom nameservers (FQDNs). |
| `dnssec` | `boolean` | no |  |
| `hostMaster` | `string` | no | Hostmaster email address used in SOA. |
| `refresh` | `integer` | no | SOA refresh in seconds. |
| `retry` | `integer` | no |  |
| `expire` | `integer` | no |  |
| `ttl` | `integer` | no |  |
| `records` | `DnsRecord[]` | no | If provided, replaces the full record set. |

**Responses**

- `200` - Zone updated.

**Errors:** `InvalidParameter`, `DnsConfigurationException`, `ObjectDoesNotExist`


### `deleteDnsZone`

`DELETE /v2/dns/zones/{zoneId}`

Delete a managed DNS zone.

- **Docs:** `https://dm.realtimeregister.com/docs/api/dns/zones/delete`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `zoneId` | `integer` | yes |  |  |

**Responses**

- `204` - Zone deleted.

**Errors:** `ObjectDoesNotExist`

**Gotchas**

- Deletion is soft; re-creating the zone cancels the pending delete.


### `getDnsZoneStatistics`

`GET /v2/dns/zones/{zoneId}/stats`

Query traffic counters for a managed zone.

- **Docs:** `https://dm.realtimeregister.com/docs/api/dns/zones/stats`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `zoneId` | `integer` | yes |  |  |

**Responses**

- `200` - Counts per record type and response code.

**Errors:** `InvalidParameter`, `ObjectDoesNotExist`


### `retrieveDnsZone`

`POST /v2/dns/zones/{zoneId}/retrieve`

Re-fetch zone contents from the configured master (secondary zones).

- **Docs:** `https://dm.realtimeregister.com/docs/api/dns/zones/retrieve`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `zoneId` | `integer` | yes |  |  |

**Responses**

- `200` - Current zone contents after retrieval.

**Errors:** `ObjectDoesNotExist`


### `dnsZoneKeyRollover`

`POST /v2/dns/zones/{zoneId}/key-rollover`  _async_

Trigger a DNSSEC key rollover for the zone.

- **Docs:** `https://dm.realtimeregister.com/docs/api/dns/zones/key-rollover`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `zoneId` | `integer` | yes |  |  |

**Responses**

- `202` - { processId } - rollover is staged.

**Errors:** `ObjectDoesNotExist`, `InvalidParameter`

**Gotchas**

- Only permitted once the previous rollover has completed.


### `dnsZoneAckDsUpdate`

`POST /v2/processes/{processId}/ack-ds-update`

Acknowledge that the registry DS record matches the current DNSKEY.

- **Docs:** `https://dm.realtimeregister.com/docs/api/dns/ack-ds-update`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `processId` | `integer` | yes |  | Process ID returned by dnsZoneKeyRollover. |

**Responses**

- `200` - Rollover advanced to the next stage.

**Errors:** `ObjectDoesNotExist`

**Gotchas**

- Endpoint is rooted under /v2/processes/, not /v2/dns/zones/.
- Required mid-rollover; the registry only removes the retired key once the ack is received.


