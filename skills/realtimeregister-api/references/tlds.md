# TLDs (`tlds`)

TLD metadata tells you what a registry supports: valid creation/renewal
periods, DNSSEC algorithms, contact requirements, whois exposure, privacy
posture, IDN handling, launch phases, and more. Always read this dynamically
rather than hard-coding: registries change policies over time.

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

### `getTldInfo`

`GET /v2/tlds/{tld}/info`

Retrieve the metadata envelope for a single TLD.

- **Docs:** `https://dm.realtimeregister.com/docs/api/tlds/info`
- **Auth scope:** `customer`

**Path params**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `tld` | `string` | yes | TLD without the leading dot (e.g. `com`, `co.uk`). |

**Responses**

- `200` - { provider: string,
  applicableFor: string[],   # other extensions that share this metadata (e.g. ["es","com.es"])
  metadata: {
    createDomainPeriods: integer[],        # months
    renewDomainPeriods: integer[],          # months
    autoRenewDomainPeriods: integer[],      # months
    transferDomainPeriods: integer[]?,      # months
    redemptionPeriod: integer?,             # seconds
    pendingDeletePeriod: integer?,          # seconds
    addGracePeriod: integer?,               # seconds
    renewGracePeriod: integer?,             # seconds
    autoRenewGracePeriod: integer?,         # seconds
    transferGracePeriod: integer?,          # seconds
    expiryDateOffset: integer?,             # seconds before expiry to start auto-renew
    transferFOA: boolean,
    adjustableAuthCode: boolean,
    customAuthcodeSupport: boolean,
    transferSupportsAuthcode: boolean,
    transferRequiresAuthcode: boolean,
    creationRequiresPreValidation: boolean,
    zoneCheck: string?,                     # URL to the registry's zone-check form
    possibleClientDomainStatuses: ClientDomainStatus[]?,
    allowedDnssecRecords: integer?,
    allowedDnssecAlgorithms: integer[]?,    # DNSSEC algo numbers (3,5,6,7,8,10,12,13,14,15,16,17,23)
    validationCategory: string?,
    featuresAvailable: TldFeature[],
    registrantChangeApprovalRequired: boolean,
    registrantChangeTransferLock: boolean,
    allowDesignatedAgent: DesignatedAgent?,
    jurisdiction: string?,
    termsOfService: string?,
    privacyPolicy: string?,
    registrationNotice: string?,
    whoisExposure: WhoisExposure,
    gdprCategory: GdprCategory,
    premiumSupport: PremiumSupport,
    restoreIncludesRenew: boolean,
    renewalOnTransfer: RenewalOnTransfer,
    domainSyntax: { minLength, maxLength, idnSupport, idnType?, allowedCharacters?, languageCodes? },
    nameservers:  { min, max, required },
    hosts:        { addressesIPv4:{min,max}, addressesIPv6:{min,max}, addressesTotal:{min,max} },
    registrant:   { organizationRequired, organizationAllowed, allowedCountries?, scope },
    adminContacts:   { min, max, required, organizationRequired, organizationAllowed, allowedCountries?, scope },
    billingContacts: { min, max, required, organizationRequired, organizationAllowed, allowedCountries?, scope },
    techContacts:    { min, max, required, organizationRequired, organizationAllowed, allowedCountries?, scope },
    contactProperties: { name, label, description, type, mandatory, values? }[]?,
    launchPhases: { phase, startDate?, endDate? }[]?
  }
}


**Errors:** `ObjectDoesNotExist`

**Gotchas**

- `tld` path param is dotless (`com`, not `.com`; `co.uk`, not `.co.uk`).
- All `*Period`s in `metadata` except `*DomainPeriods` are expressed in **seconds**. Domain periods are in **months**.
- `whoisExposure`, `gdprCategory`, `premiumSupport`, `renewalOnTransfer`, `allowDesignatedAgent`, `featuresAvailable`, `possibleClientDomainStatuses`, `idnType`, and `contactProperties[].type` are closed enums; see the live doc for exact values.
- Poll this endpoint rather than caching indefinitely: registries add/remove features, algorithms, and launch phases.


### `metadataOverview`

`REFERENCE /docs/api/tlds/metadata`

Human-readable table of every TLD grouped by shared metadata. Not an HTTP endpoint.

- **Docs:** `https://dm.realtimeregister.com/docs/api/tlds/metadata`
- **Auth scope:** `none`

**Responses**

- `200` - HTML reference page listing extensions, provider, domain syntax,
nameservers, hosts, registrant/contact rules, transfer requirements,
DNSSEC, whois exposure and privacy posture for every supported TLD.
Use `getTldInfo` programmatically; this page is for human exploration.


**Gotchas**

- This is a documentation page, not an API call. Do not attempt to fetch it as JSON.
- The grouping changes as registries adjust policies; `getTldInfo` is authoritative.


