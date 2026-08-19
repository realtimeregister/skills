import { describe, expect, it } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  listCategoryFiles,
  loadCategory,
  loadShared,
  loadSpec,
  findOperation,
  allOperations,
} from "../src/lib/spec.js";

/**
 * Build a tiny spec tree on disk so we can exercise the loader independently
 * of the real assets/spec/ payload.
 */
function seedSpecDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "rtr-spec-"));
  writeFileSync(join(dir, "_shared.yaml"), "schemas:\n  ContactHandle:\n    type: string\n");
  writeFileSync(
    join(dir, "demo.yaml"),
    [
      "category: demo",
      "docBaseUrl: https://example.test/docs/demo",
      "operations:",
      "  - operationId: pingDemo",
      "    method: GET",
      "    path: /v2/demo/ping",
      "    summary: Ping",
      "    verified: docs",
      "",
    ].join("\n"),
  );
  return dir;
}

describe("loadShared", () => {
  it("parses _shared.yaml into an object", () => {
    const dir = seedSpecDir();
    try {
      const shared = loadShared(dir);
      expect(shared).toMatchObject({ schemas: { ContactHandle: { type: "string" } } });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("throws if _shared.yaml is malformed", () => {
    const dir = mkdtempSync(join(tmpdir(), "rtr-bad-"));
    writeFileSync(join(dir, "_shared.yaml"), "not: [closed");
    try {
      expect(() => loadShared(dir)).toThrow();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("loadCategory", () => {
  it("parses a single category file and validates the category name", () => {
    const dir = seedSpecDir();
    try {
      const cat = loadCategory("demo", dir);
      expect(cat.category).toBe("demo");
      expect(cat.operations).toHaveLength(1);
      expect(cat.operations[0]!.operationId).toBe("pingDemo");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("throws when category name doesn't match the file name", () => {
    const dir = mkdtempSync(join(tmpdir(), "rtr-mismatch-"));
    writeFileSync(join(dir, "a.yaml"), "category: b\noperations: []\n");
    try {
      expect(() => loadCategory("a", dir)).toThrow(/must equal 'a'/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("rejects duplicate operationIds", () => {
    const dir = mkdtempSync(join(tmpdir(), "rtr-dup-"));
    writeFileSync(
      join(dir, "dup.yaml"),
      "category: dup\noperations:\n  - operationId: x\n    method: GET\n    path: /a\n  - operationId: x\n    method: GET\n    path: /b\n",
    );
    try {
      expect(() => loadCategory("dup", dir)).toThrow(/Duplicate operationId/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("listCategoryFiles", () => {
  it("skips underscore files and sorts alphabetically", () => {
    const dir = seedSpecDir();
    try {
      writeFileSync(join(dir, "abc.yaml"), "category: abc\noperations: []\n");
      expect(listCategoryFiles(dir)).toEqual(["abc", "demo"]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("loadSpec + helpers against the real spec dir", () => {
  it("loads the 109 operations across 16 categories", () => {
    const spec = loadSpec();
    expect(spec.categories.size).toBe(16);
    const ops = allOperations(spec);
    expect(ops.length).toBe(109);
  });

  it("finds a known operation and returns null for a bogus id", () => {
    const spec = loadSpec();
    expect(findOperation(spec, "createDomain")).not.toBeNull();
    expect(findOperation(spec, "doesNotExist123")).toBeNull();
  });
});
