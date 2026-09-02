import { describe, expect, it } from "bun:test";
import { buildOperationSchemas } from "../src/lib/schema.js";
import { findOperation, loadSpec } from "../src/lib/spec.js";

const LISTING_OPERATION_IDS = [
  "listBrands",
  "listBrandTemplates",
  "listContacts",
  "listCountries",
  "listDnsTemplates",
  "listDnsZones",
  "listDomains",
  "listTransactions",
  "listHosts",
  "listNotifications",
  "listProcesses",
  "listProviders",
  "listProviderDowntime",
  "listRegistryAccounts",
  "listCertificates",
  "listProducts",
  "listAcmeSubscriptions",
  "listValidationCategories",
] as const;

const COMMON_PARAM_NAMES = ["limit", "offset", "order", "total", "q", "fields", "export"];

describe("shared listing query semantics", () => {
  const spec = loadSpec();

  for (const operationId of LISTING_OPERATION_IDS) {
    it(`${operationId} expands the shared listing contract`, () => {
      const hit = findOperation(spec, operationId);
      expect(hit).not.toBeNull();
      expect(hit!.op.listing).toBe(true);
      expect(hit!.op.queryParams?.map((param) => param.name)).toEqual(COMMON_PARAM_NAMES);

      const q = hit!.op.queryParams?.find((param) => param.name === "q");
      expect(q?.description).toMatch(/substring search across entity fields/i);
      expect(q?.description).not.toMatch(/^filter expression/i);

      const limit = hit!.op.queryParams?.find((param) => param.name === "limit");
      expect(limit).toMatchObject({ default: 10, minimum: 0, maximum: 250 });
      expect(limit?.description).toMatch(/count-only/i);

      const fields = hit!.op.queryParams?.find((param) => param.name === "fields");
      expect(fields?.description).toMatch(/without a value may be omitted/i);

      const schemas = buildOperationSchemas(hit!.op, spec.shared);
      const queryProperties = schemas.query.properties as Record<string, Record<string, unknown>>;
      expect(queryProperties.limit).toMatchObject({ default: 10, minimum: 0, maximum: 250 });
      expect(queryProperties.total).toMatchObject({ type: "boolean", default: true });
      expect(schemas.query.additionalProperties).toBe(true);
    });
  }

  it("documents every upstream filter operator", () => {
    expect(spec.shared.listing.operators.map((operator) => operator.name)).toEqual([
      "eq",
      "ne",
      "like",
      "not_like",
      "gt",
      "lt",
      "gte",
      "lte",
      "null",
      "not_null",
      "in",
      "not_in",
    ]);
  });

  it("keeps non-generic list operations outside the shared contract", () => {
    for (const operationId of ["listBrandLocales", "listExchangeRates"]) {
      const hit = findOperation(spec, operationId);
      expect(hit).not.toBeNull();
      expect(hit!.op.listing).not.toBe(true);
      expect(hit!.op.queryParams).toBeUndefined();
      expect(buildOperationSchemas(hit!.op, spec.shared).query.additionalProperties).toBe(false);
    }
  });
});
