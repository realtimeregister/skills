import { describe, expect, it } from "bun:test";
import { loadSpec, findOperation } from "../src/lib/spec.js";

/**
 * A full crawl of dm.realtimeregister.com/docs/api (136 pages, tables parsed
 * with this repo's own scraper) found 21 operations whose body/query contract
 * disagreed with the live docs (plans/notes/011-field-drift-report.json,
 * 2026-07-04). These tests pin the highest-risk corrections so a regression
 * back to the stale contract fails CI.
 */
describe("Field-level spec reconciliation (plan 011)", () => {
  it("requestCertificate requires customer and uses san, not sans", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "requestCertificate");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    const customerField = op.requestBody?.fields?.customer;
    expect(customerField).toBeDefined();
    expect(customerField?.required).toBe(true);

    const sanField = op.requestBody?.fields?.san;
    expect(sanField).toBeDefined();

    expect(op.requestBody?.fields?.sans).toBeUndefined();
  });

  it("generateAuthKey requires product and csr in the request body", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "generateAuthKey");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    const productField = op.requestBody?.fields?.product;
    expect(productField).toBeDefined();
    expect(productField?.required).toBe(true);

    const csrField = op.requestBody?.fields?.csr;
    expect(csrField).toBeDefined();
    expect(csrField?.required).toBe(true);
  });

  it("addNoteDeprecated uses message (required), not note", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "addNoteDeprecated");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    const messageField = op.requestBody?.fields?.message;
    expect(messageField).toBeDefined();
    expect(messageField?.required).toBe(true);

    expect(op.requestBody?.fields?.note).toBeUndefined();
  });

  it("createContact includes a verifications field", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "createContact");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    expect(op.requestBody?.fields?.verifications).toBeDefined();
  });

  it("updateContact includes a verifications field", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "updateContact");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    expect(op.requestBody?.fields?.verifications).toBeDefined();
  });

  it("createBrand includes contactEmail and replyToEmail", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "createBrand");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    expect(op.requestBody?.fields?.contactEmail).toBeDefined();
    expect(op.requestBody?.fields?.replyToEmail).toBeDefined();
  });

  it("updateBrand includes contactEmail and replyToEmail", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "updateBrand");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    expect(op.requestBody?.fields?.contactEmail).toBeDefined();
    expect(op.requestBody?.fields?.replyToEmail).toBeDefined();
  });

  it("reissueCertificate exposes the quote query parameter", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "reissueCertificate");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    const quoteParam = op.queryParams?.find((p) => p.name === "quote");
    expect(quoteParam).toBeDefined();
  });

  it("renewCertificate exposes the quote query parameter", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "renewCertificate");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    const quoteParam = op.queryParams?.find((p) => p.name === "quote");
    expect(quoteParam).toBeDefined();
  });

  it("updateAcmeSubscription exposes the quote query parameter", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "updateAcmeSubscription");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    const quoteParam = op.queryParams?.find((p) => p.name === "quote");
    expect(quoteParam).toBeDefined();
  });
});
