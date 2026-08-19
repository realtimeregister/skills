import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseOperationHtml } from "../src/lib/scraper.js";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = (name: string): string =>
  readFileSync(join(here, "fixtures", name), "utf8");

describe("parseOperationHtml", () => {
  it("parses a GET operation page (domains/get fixture)", () => {
    const parsed = parseOperationHtml(fixture("domains-get.html"));

    expect(parsed.method).toBe("GET");
    expect(parsed.url).toContain("/v2/domains/");
    expect(parsed.urlFields.length).toBeGreaterThan(0);
  });

  it("parses a POST operation page (domains/create fixture)", () => {
    const parsed = parseOperationHtml(fixture("domains-create.html"));

    expect(parsed.method).toBe("POST");
    expect(parsed.bodyFields.length).toBeGreaterThan(0);

    const registrant = parsed.bodyFields.find((f) => f.name === "registrant");
    expect(registrant).toBeDefined();
    expect(registrant?.required).toBe(true);
  });

  it("surfaces parse failure as null method instead of silently defaulting to GET", () => {
    const parsed = parseOperationHtml(
      "<html><body><p>maintenance</p></body></html>",
    );

    expect(parsed.method).toBeNull();
    expect(parsed.url).toBe("");
  });

  it("refuses to guess columns when a labelled table lacks name/type headers", () => {
    const html = [
      "<html><body>",
      "<h3>Request content fields</h3>",
      "<table>",
      "<thead><tr><th>foo</th><th>bar</th></tr></thead>",
      "<tbody><tr><td>alpha</td><td>beta</td></tr></tbody>",
      "</table>",
      "</body></html>",
    ].join("\n");

    const parsed = parseOperationHtml(html);

    expect(parsed.bodyFields).toEqual([]);
  });
});
