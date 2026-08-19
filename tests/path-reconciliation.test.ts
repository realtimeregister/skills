import { describe, expect, it } from "bun:test";
import { loadSpec, findOperation } from "../src/lib/spec.js";

/**
 * Plan 005 revived the path and method checks in scripts/diff-live.ts
 * (previously silent: URL extraction returned "" and method defaulted to
 * GET). The first real live-docs diff found 35 drifts across 109 operations
 * (2026-07-04): 22 path, 4 method, 8 parse, 1 required-count. These tests pin
 * the 24 path/method corrections plus the six (of eight) pseudo-page ops
 * marked non-diffable, so a regression back to the invented contracts fails
 * CI.
 */
describe("Path + method reconciliation (plan 012)", () => {
  it("revokeCertificate is DELETE on the bare certificate resource", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "revokeCertificate");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    expect(op.method).toBe("DELETE");
    expect(op.path).toBe("/v2/ssl/certificates/{certificateId}");
  });

  it("cancelProcess is DELETE on the bare process resource", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "cancelProcess");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    expect(op.method).toBe("DELETE");
    expect(op.path).toBe("/v2/processes/{processId}");
  });

  it("retrieveDnsZone is POST, not GET", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "retrieveDnsZone");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    expect(op.method).toBe("POST");
    expect(op.path).toBe("/v2/dns/zones/{zoneId}/retrieve");
  });

  it("previewBrandTemplate is GET with context as a query param", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "previewBrandTemplate");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    expect(op.method).toBe("GET");
    const contextParam = op.queryParams?.find((p) => p.name === "context");
    expect(contextParam).toBeDefined();
  });

  it("getExchangeRates resolves under /v2/exchangerates/{currency}", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "getExchangeRates");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    expect(op.method).toBe("GET");
    expect(op.path).toBe("/v2/exchangerates/{currency}");

    const currencyParam = op.pathParams?.find((p) => p.name === "currency");
    expect(currencyParam).toMatchObject({ type: "string", required: true });
  });

  it("listExchangeRates resolves under /v2/exchangerates", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "listExchangeRates");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    expect(op.method).toBe("GET");
    expect(op.path).toBe("/v2/exchangerates");
  });

  it("getRegistryAccount resolves under /v2/registryAccounts/{registry}/{loginName}", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "getRegistryAccount");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    expect(op.path).toBe("/v2/registryAccounts/{registry}/{loginName}");

    const registryParam = op.pathParams?.find((p) => p.name === "registry");
    expect(registryParam).toMatchObject({ type: "string", required: true });

    const loginNameParam = op.pathParams?.find((p) => p.name === "loginName");
    expect(loginNameParam).toMatchObject({ type: "string", required: true });

    expect(op.pathParams?.find((p) => p.name === "handle")).toBeUndefined();
  });

  it("listRegistryAccounts resolves under /v2/registryAccounts", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "listRegistryAccounts");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    expect(op.path).toBe("/v2/registryAccounts");
  });

  it("pushTransferDomain resolves under /v2/domains/{domainName}/transfer/push", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "pushTransferDomain");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    expect(op.path).toBe("/v2/domains/{domainName}/transfer/push");
  });

  it("providerInfoDeprecated resolves under /v2/providers/REGISTRY/{name}/info", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "providerInfoDeprecated");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    expect(op.path).toBe("/v2/providers/REGISTRY/{name}/info");
  });

  it("addNoteDeprecated resolves under /v2/processes/{processId}/add-note", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "addNoteDeprecated");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    expect(op.method).toBe("POST");
    expect(op.path).toBe("/v2/processes/{processId}/add-note");

    const processIdParam = op.pathParams?.find((p) => p.name === "processId");
    expect(processIdParam).toMatchObject({ type: "integer", required: true });
  });

  it("importCertificate resolves under /v2/ssl/import", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "importCertificate");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    expect(op.path).toBe("/v2/ssl/import");
  });

  it("decodeCsr resolves under /v2/ssl/decodecsr", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "decodeCsr");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    expect(op.path).toBe("/v2/ssl/decodecsr");
  });

  it("generateAuthKey resolves under /v2/ssl/authkey", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "generateAuthKey");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    expect(op.path).toBe("/v2/ssl/authkey");
  });

  it("brand template operations use {brand} path param, not {handle}", () => {
    const spec = loadSpec();
    for (const id of [
      "getBrandTemplate",
      "listBrandTemplates",
      "updateBrandTemplate",
      "previewBrandTemplate",
    ]) {
      const hit = findOperation(spec, id);
      expect(hit, `${id} should exist`).not.toBeNull();
      const { op } = hit!;

      expect(op.path.includes("{handle}"), `${id} path should not use {handle}`).toBe(false);
      expect(op.path.includes("{brand}"), `${id} path should use {brand}`).toBe(true);
    }
  });

  it("template-scoped brand operations use {name} path param, not {template}", () => {
    const spec = loadSpec();
    for (const id of ["getBrandTemplate", "updateBrandTemplate", "previewBrandTemplate"]) {
      const hit = findOperation(spec, id);
      expect(hit, `${id} should exist`).not.toBeNull();
      const { op } = hit!;

      expect(op.path.includes("{template}"), `${id} path should not use {template}`).toBe(false);
      expect(op.path.includes("{name}"), `${id} path should use {name}`).toBe(true);
    }
  });

  it("getNotification and ackNotification use {notificationId}, not {id}", () => {
    const spec = loadSpec();
    for (const id of ["getNotification", "ackNotification"]) {
      const hit = findOperation(spec, id);
      expect(hit, `${id} should exist`).not.toBeNull();
      const { op } = hit!;

      expect(op.path.includes("{notificationId}"), `${id} path should use {notificationId}`).toBe(true);
      const notificationIdParam = op.pathParams?.find((p) => p.name === "notificationId");
      expect(notificationIdParam).toMatchObject({ type: "integer", required: true });
    }
  });

  it("getCertificate, reissueCertificate, renewCertificate use {certificateId}, not {id}", () => {
    const spec = loadSpec();
    for (const id of ["getCertificate", "reissueCertificate", "renewCertificate"]) {
      const hit = findOperation(spec, id);
      expect(hit, `${id} should exist`).not.toBeNull();
      const { op } = hit!;

      expect(op.path.includes("{certificateId}"), `${id} path should use {certificateId}`).toBe(true);
      const certificateIdParam = op.pathParams?.find((p) => p.name === "certificateId");
      expect(certificateIdParam).toMatchObject({ type: "string", required: true });
    }
  });

  it("getProduct uses {product}, not {id}", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "getProduct");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    expect(op.path).toBe("/v2/ssl/products/{product}");
    const productParam = op.pathParams?.find((p) => p.name === "product");
    expect(productParam).toMatchObject({ type: "string", required: true });
  });

  it("downloadCertificate uses {certificateId}, not {id}", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "downloadCertificate");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    expect(op.path).toBe("/v2/ssl/certificates/{certificateId}/download");
    const certificateIdParam = op.pathParams?.find((p) => p.name === "certificateId");
    expect(certificateIdParam).toBeDefined();
    expect(op.pathParams?.find((p) => p.name === "id")).toBeUndefined();
  });

  it("getBrandTemplate query params do not include locale", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "getBrandTemplate");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    expect(op.queryParams?.find((p) => p.name === "locale")).toBeUndefined();
    expect(op.queryParams?.find((p) => p.name === "fields")).toBeDefined();
  });

  it("pseudo-page operations are marked liveDiff: false", () => {
    const spec = loadSpec();
    for (const id of [
      "adacInput",
      "adacCategories",
      "adacCheck",
      "adacSuggest",
      "webhookNotification",
      "metadataOverview",
    ]) {
      const hit = findOperation(spec, id);
      expect(hit, `${id} should exist`).not.toBeNull();
      const { op } = hit!;

      expect(op.liveDiff, `${id} should have liveDiff === false`).toBe(false);
    }
  });
});
