import { describe, expect, it } from "bun:test";
import { loadSpec, findOperation } from "../src/lib/spec.js";

/**
 * Cross-validation against the live docs (dm.realtimeregister.com, 2026-07-04)
 * found that four SSL "action" operations carried invented
 * /v2/ssl/certificates/{id}/<action> paths. The live API models three of
 * them as process-scoped calls and one as a standalone DCV-address lookup.
 * These tests pin the corrected contracts so a regression back to the
 * invented paths fails CI.
 */
describe("SSL process-scoped operation paths", () => {
  it("getDcvEmails resolves under /v2/ssl/dcvemailaddresslist/{domainName}", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "getDcvEmails");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    expect(op.method).toBe("GET");
    expect(op.path).toBe("/v2/ssl/dcvemailaddresslist/{domainName}");

    const domainNameParam = op.pathParams?.find((p) => p.name === "domainName");
    expect(domainNameParam).toMatchObject({ type: "string", required: true });

    const productParam = op.queryParams?.find((p) => p.name === "product");
    expect(productParam).toMatchObject({ type: "string" });
    expect(productParam?.required).toBeFalsy();
  });

  it("resendDcv resolves under /v2/processes/{processId}/resend", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "resendDcv");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    expect(op.method).toBe("POST");
    expect(op.path).toBe("/v2/processes/{processId}/resend");

    const processIdParam = op.pathParams?.find((p) => p.name === "processId");
    expect(processIdParam).toMatchObject({ type: "integer", required: true });

    const dcvField = op.requestBody?.fields?.dcv;
    expect(dcvField).toBeDefined();
    expect(dcvField?.required).toBe(true);
    expect(dcvField?.type).toBe("array");
  });

  it("scheduleValidationCall resolves under /v2/processes/{processId}/schedule-validation-call", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "scheduleValidationCall");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    expect(op.method).toBe("POST");
    expect(op.path).toBe("/v2/processes/{processId}/schedule-validation-call");

    const processIdParam = op.pathParams?.find((p) => p.name === "processId");
    expect(processIdParam).toMatchObject({ type: "integer", required: true });

    const dateField = op.requestBody?.fields?.date;
    expect(dateField).toBeDefined();
    expect(dateField?.required).toBe(true);
  });

  it("sendSubscriberAgreement resolves under /v2/processes/{processId}/send-subscriber-agreement", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "sendSubscriberAgreement");
    expect(hit).not.toBeNull();
    const { op } = hit!;

    expect(op.method).toBe("POST");
    expect(op.path).toBe("/v2/processes/{processId}/send-subscriber-agreement");

    const processIdParam = op.pathParams?.find((p) => p.name === "processId");
    expect(processIdParam).toMatchObject({ type: "integer", required: true });

    const emailField = op.requestBody?.fields?.email;
    expect(emailField).toBeDefined();
    expect(emailField?.required).toBe(true);
  });

  it("none of the four operations use the invented /v2/ssl/certificates/... action paths", () => {
    const spec = loadSpec();
    const invented = [
      "getDcvEmails",
      "resendDcv",
      "scheduleValidationCall",
      "sendSubscriberAgreement",
    ]
      .map((id) => findOperation(spec, id))
      .filter((hit): hit is NonNullable<typeof hit> => hit !== null)
      .filter(({ op }) => op.path.startsWith("/v2/ssl/certificates/") || op.path === "/v2/ssl/certificates/dcv-email-addresses");

    expect(invented.map(({ op }) => op.operationId)).toEqual([]);
  });
});
