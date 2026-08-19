import { describe, expect, it } from "bun:test";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCategory, loadSpec } from "../src/lib/spec.js";

const FIXTURES_DIR = join(fileURLToPath(new URL(".", import.meta.url)), "fixtures", "spec-invalid");

describe("loadCategory error paths (committed fixtures)", () => {
  it("throws when the category field doesn't match the file name", () => {
    const dir = join(FIXTURES_DIR, "wrongname");
    expect(() => loadCategory("foo", dir)).toThrow(/'category' must equal 'foo'/);
  });

  it("throws when operations is not an array", () => {
    const dir = join(FIXTURES_DIR, "noops");
    expect(() => loadCategory("noops", dir)).toThrow(/must be an array/);
  });

  it("throws on duplicate operationId within a category", () => {
    const dir = join(FIXTURES_DIR, "dupe");
    expect(() => loadCategory("dupe", dir)).toThrow(/Duplicate operationId/);
  });

  it("throws when an operation is missing operationId", () => {
    const dir = join(FIXTURES_DIR, "missing-id");
    expect(() => loadCategory("missing-id", dir)).toThrow(/missing operationId/);
  });
});

describe("loadSpec surfaces the same errors for a broken spec directory", () => {
  it("propagates the duplicate operationId error", () => {
    const dir = join(FIXTURES_DIR, "dupe");
    expect(() => loadSpec(dir)).toThrow(/Duplicate operationId/);
  });

  it("propagates the missing operationId error", () => {
    const dir = join(FIXTURES_DIR, "missing-id");
    expect(() => loadSpec(dir)).toThrow(/missing operationId/);
  });
});
