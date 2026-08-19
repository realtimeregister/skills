import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  canonicalContract,
  fingerprintOperation,
  fingerprintSpec,
} from "../src/lib/integrity.js";
import { loadSpec, allOperations, SPEC_DIR } from "../src/lib/spec.js";
import type { Operation } from "../src/lib/types.js";

/**
 * Minimal fixture modeled after a real operation (see createDomain in
 * assets/spec/domains.yaml) — enough surface to exercise every part of the
 * canonical contract: method, path, pathParams, queryParams, and
 * requestBody.fields with a mix of required/optional entries.
 */
function baseOp(overrides: Partial<Operation> = {}): Operation {
  return {
    operationId: "pingDemo",
    method: "POST",
    path: "/v2/demo/{demoId}",
    docUrl: "/demo/ping",
    async: false,
    authScope: "customer",
    summary: "Ping the demo endpoint.",
    pathParams: [{ name: "demoId", type: "string", required: true }],
    queryParams: [{ name: "quote", type: "boolean" }],
    requestBody: {
      contentType: "application/json",
      fields: {
        customer: { type: "string", required: true },
        note: { type: "string" },
      },
    },
    ...overrides,
  };
}

describe("canonicalContract", () => {
  it("produces a deterministic string for the same operation", () => {
    const a = canonicalContract(baseOp());
    const b = canonicalContract(baseOp());
    expect(a).toBe(b);
  });
});

describe("fingerprintOperation", () => {
  it("returns the same hash for the same op twice", () => {
    const h1 = fingerprintOperation(baseOp());
    const h2 = fingerprintOperation(baseOp());
    expect(h1).toBe(h2);
  });

  it("changes the hash when method changes", () => {
    const original = fingerprintOperation(baseOp());
    const changed = fingerprintOperation(baseOp({ method: "GET" }));
    expect(changed).not.toBe(original);
  });

  it("changes the hash when a required body field name changes", () => {
    const original = fingerprintOperation(baseOp());
    const changed = fingerprintOperation(
      baseOp({
        requestBody: {
          contentType: "application/json",
          fields: {
            customerId: { type: "string", required: true },
            note: { type: "string" },
          },
        },
      }),
    );
    expect(changed).not.toBe(original);
  });

  it("does not change the hash when only a description changes", () => {
    const original = fingerprintOperation(baseOp());
    const changed = fingerprintOperation(baseOp({ summary: "A totally different summary." }));
    expect(changed).toBe(original);
  });

  it("does not change the hash when only a non-required body field's description changes", () => {
    const original = fingerprintOperation(baseOp());
    const changed = fingerprintOperation(
      baseOp({
        requestBody: {
          contentType: "application/json",
          fields: {
            customer: { type: "string", required: true },
            note: { type: "string", description: "New description text." },
          },
        },
      }),
    );
    expect(changed).toBe(original);
  });
});

describe("fingerprintSpec", () => {
  it("returns exactly one entry per operation in the real spec", () => {
    const spec = loadSpec();
    const fingerprints = fingerprintSpec(spec);
    const ops = allOperations(spec);
    expect(Object.keys(fingerprints)).toHaveLength(ops.length);
  });

  it("returns sorted keys", () => {
    const spec = loadSpec();
    const fingerprints = fingerprintSpec(spec);
    const keys = Object.keys(fingerprints);
    const sorted = [...keys].sort();
    expect(keys).toEqual(sorted);
  });
});

describe("committed fidelity lock", () => {
  it("assets/spec/_fingerprints.json matches every current operation's hash", () => {
    const lockRaw = readFileSync(join(SPEC_DIR, "_fingerprints.json"), "utf8");
    const lock = JSON.parse(lockRaw) as { fingerprints: Record<string, string> };

    const spec = loadSpec();
    const current = fingerprintSpec(spec);

    expect(Object.keys(lock.fingerprints).sort()).toEqual(Object.keys(current).sort());
    for (const [operationId, hash] of Object.entries(current)) {
      expect(lock.fingerprints[operationId]).toBe(hash);
    }
  });
});
