// Fetch and parse a Realtime Register HTML doc page into a spec skeleton.
// Scraping rules derived from the consistent page structure documented in
// the project README.

import { load as loadHtml } from "cheerio";
import type { CheerioAPI, Cheerio } from "cheerio";
import type { AnyNode } from "domhandler";

export interface ScrapedField {
  name: string;
  type: string;
  required: boolean;
  description: string;
  restrictions?: string;
}

export interface ScrapedOperation {
  url: string;
  /** Uppercase HTTP method, or null when the page could not be parsed. */
  method: string | null;
  contentType?: string;
  urlFields: ScrapedField[];
  queryParams: ScrapedField[];
  bodyFields: ScrapedField[];
  nestedTables: Record<string, ScrapedField[]>;
}

export async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.text();
}

export function parseOperationHtml(html: string): ScrapedOperation {
  const $ = loadHtml(html);

  const scripts = $("script").toArray().map((s) => $(s).html() ?? "").join("\n");
  // Older markup declared `var url = '...'`; the current markup assigns the
  // global without the keyword (`url = '...'`), so `var` is optional.
  const urlMatch = scripts.match(/(?:var\s+)?url\s*=\s*['"]([^'"]+)['"]/);
  const method = extractMethod($, scripts);

  // Walk the document in order. Each h3/h4/h5/h6 claims the next <table> that
  // appears after it (and before the next heading). We bucket claimed tables
  // by their label, then project the well-known buckets into the return shape.
  const buckets = collectLabelledTables($);

  const firstByLabel = (re: RegExp): ScrapedField[] => {
    for (const [label, table] of buckets) {
      if (re.test(label)) return rowsToFields($, table);
    }
    return [];
  };

  const consumed = new Set<number>();
  const consumeFirst = (re: RegExp): ScrapedField[] => {
    for (let i = 0; i < buckets.length; i++) {
      if (consumed.has(i)) continue;
      const [label, table] = buckets[i]!;
      if (re.test(label)) {
        consumed.add(i);
        return rowsToFields($, table);
      }
    }
    return [];
  };

  const urlFields = consumeFirst(/^url fields$/i);
  const queryParams = consumeFirst(/^request parameters$/i);
  const bodyFields = consumeFirst(/^request content fields$/i);

  const nestedTables: Record<string, ScrapedField[]> = {};
  const skip = /^(url fields|request parameters|request content fields|response fields|response|request|successful request|failed requests|api tryout)$/i;
  for (let i = 0; i < buckets.length; i++) {
    if (consumed.has(i)) continue;
    const [label, table] = buckets[i]!;
    if (skip.test(label)) continue;
    const fields = rowsToFields($, table);
    if (fields.length > 0) nestedTables[label] = fields;
  }

  return {
    url: urlMatch?.[1] ?? "",
    method,
    urlFields,
    queryParams,
    bodyFields,
    nestedTables,
  };
}

const HTTP_METHOD_RE = /^(GET|POST|PUT|PATCH|DELETE)$/i;

/**
 * Extract the HTTP method from a doc page, or null when it cannot be found.
 * Current markup carries `<span id="method">POST</span>`; older markup set a
 * `method`/`METHOD` variable in an inline script. No silent default — a null
 * means "the page no longer looks like we expect" and callers must surface it.
 */
function extractMethod($: CheerioAPI, scripts: string): string | null {
  const domMethod = $("#method").text().trim();
  if (HTTP_METHOD_RE.test(domMethod)) return domMethod.toUpperCase();

  const legacyMatch = scripts.match(/(?:var\s+method|METHOD)\s*=\s*['"]?([A-Z]+)['"]?/i);
  if (legacyMatch) return legacyMatch[1]!.toUpperCase();

  return null;
}

function collectLabelledTables($: CheerioAPI): Array<[string, Cheerio<AnyNode>]> {
  const out: Array<[string, Cheerio<AnyNode>]> = [];
  const all = $("h3, h4, h5, h6, table").toArray();
  let pendingLabel: string | null = null;
  for (const el of all) {
    const tag = (el as unknown as { tagName?: string }).tagName?.toLowerCase() ?? "";
    if (tag === "table") {
      if (pendingLabel !== null) {
        out.push([pendingLabel, $(el)]);
        pendingLabel = null;
      }
    } else {
      pendingLabel = $(el).text().trim();
    }
  }
  return out;
}

function rowsToFields($: CheerioAPI, table: Cheerio<AnyNode>): ScrapedField[] {
  // Read header labels so we handle both 3-column (GET: name/type/desc[/restr])
  // and 5-column (POST: name/type/required/desc/restr) layouts uniformly.
  const headers = table
    .find("thead tr th")
    .toArray()
    .map((th) => $(th).text().trim().toLowerCase());
  const idx = (re: RegExp): number => headers.findIndex((h) => re.test(h));
  const nameIdx = idx(/^name$/);
  const typeIdx = idx(/^type$/);
  // Refuse to guess: a table without explicit name/type headers is not a
  // field table we understand, so it contributes no fields.
  if (nameIdx < 0 || typeIdx < 0) return [];
  const reqIdx = idx(/required/);
  const descIdx = idx(/description/);
  const restrIdx = idx(/restriction/);

  const rows = table.find("tbody tr").toArray();
  const out: ScrapedField[] = [];
  for (const row of rows) {
    const tds = $(row).find("td").toArray();
    if (tds.length < 2) continue;
    const name = $(tds[nameIdx]!).text().trim();
    const type = $(tds[typeIdx]!).text().trim();
    const required = reqIdx >= 0 && tds[reqIdx]
      ? /required|true|yes/i.test($(tds[reqIdx]!).text().trim())
      : true;
    const description = descIdx >= 0 && tds[descIdx] ? $(tds[descIdx]!).text().trim().replace(/\s+/g, " ") : "";
    const restrictions = restrIdx >= 0 && tds[restrIdx] ? $(tds[restrIdx]!).text().trim().replace(/\s+/g, " ") : undefined;
    if (name) {
      const field: ScrapedField = { name, type, required, description };
      if (restrictions) field.restrictions = restrictions;
      out.push(field);
    }
  }
  return out;
}

export async function checkLink(url: string): Promise<{ ok: boolean; status: number }> {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}
