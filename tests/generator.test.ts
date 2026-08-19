import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { loadSpec, findOperation, REFERENCES_DIR } from "../src/lib/spec.js";
import { renderCategory, renderOperation } from "../src/lib/generator.js";

describe("renderCategory", () => {
  it("includes the createDomain heading and a registrant request-body table row", () => {
    const spec = loadSpec();
    const domains = spec.categories.get("domains");
    expect(domains).toBeDefined();

    const output = renderCategory(domains!, spec.shared);

    expect(output).toContain("### `createDomain`");
    expect(output).toMatch(/\|\s*`registrant`\s*\|/);
  });
});

describe("renderOperation", () => {
  it("renders a Gotchas section for an operation with gotchas (getAcmeSubscription)", () => {
    const spec = loadSpec();
    const hit = findOperation(spec, "getAcmeSubscription");
    expect(hit).not.toBeNull();
    expect(hit!.op.gotchas?.length).toBeGreaterThan(0);

    const lines = renderOperation(hit!.op, spec.shared);
    const output = lines.join("\n");

    expect(output).toContain("**Gotchas**");
    for (const gotcha of hit!.op.gotchas ?? []) {
      expect(output).toContain(gotcha);
    }
  });
});

describe("reference generation sync", () => {
  const spec = loadSpec();
  const categoryNames = Array.from(spec.categories.keys()).sort();

  it("has at least one category to check", () => {
    expect(categoryNames.length).toBeGreaterThan(0);
  });

  for (const name of categoryNames) {
    it(`renderCategory() output for '${name}' matches the committed references/${name}.md exactly`, () => {
      const cat = spec.categories.get(name)!;
      const rendered = renderCategory(cat, spec.shared) + "\n";
      const committed = readFileSync(join(REFERENCES_DIR, `${name}.md`), "utf8");
      expect(rendered).toBe(committed);
    });
  }
});
