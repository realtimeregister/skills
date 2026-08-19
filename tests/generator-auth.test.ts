import { describe, expect, it } from "bun:test";
import { loadSpec } from "../src/lib/spec.js";
import { renderCategory } from "../src/lib/generator.js";

describe("renderCategory auth section", () => {
  it("renders the ApiKey auth format and flags Basic auth as deprecated", () => {
    const spec = loadSpec();
    const domains = spec.categories.get("domains");
    expect(domains).toBeDefined();

    const output = renderCategory(domains!, spec.shared);

    expect(output).toContain("**Auth:** `Authorization: ApiKey <your-api-key>`");
    expect(/Basic/i.test(output) && /deprecated/i.test(output)).toBe(true);
  });
});
