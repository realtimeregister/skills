#!/usr/bin/env node
// Scrape every documented operation and compare the path + HTTP method and
// required-field count against the shipped spec. Designed to run weekly in
// CI - writes a JSON report to stdout and exits non-zero on unfixed drift so
// the wrapping workflow can open/update an issue.
//
// This is intentionally narrow: we only flag things that would break a user
// of the CLI (wrong URL, wrong method, field removed). Descriptions /
// restriction strings evolve constantly and are not diff targets.
//
// --fix: auto-correct method/path drift in place, using the value already
// scraped from the live page (format-preserving; see src/lib/patch-spec.ts).
// required-count/fetch/parse drift is never auto-fixed: the scraper doesn't
// know *which* field changed, only that the count differs, so that always
// needs a human to reconcile against the live operation page.

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { applySpecFixes } from "../src/lib/patch-spec.ts";
import { parseOperationHtml, fetchHtml } from "../src/lib/scraper.ts";
import { SPEC_DIR } from "../src/lib/spec.ts";
import type { Operation } from "../src/lib/types.ts";
import type { SpecFix } from "../src/lib/patch-spec.ts";

const specDir = SPEC_DIR;
const fix = process.argv.includes("--fix");

const shared = parseYaml(readFileSync(join(specDir, "_shared.yaml"), "utf8")) as { docsBaseUrl?: string };
const base = shared.docsBaseUrl;
if (!base) {
  console.error("docsBaseUrl missing from _shared.yaml");
  process.exit(2);
}

const files = readdirSync(specDir)
  .filter((f) => f.endsWith(".yaml") && !f.startsWith("_"));

type FetchOrParseDrift = { operationId: string; kind: "fetch" | "parse"; detail: string };
type MethodDrift = { operationId: string; kind: "method"; spec: string; live: string; fixed?: boolean };
type PathDrift = { operationId: string; kind: "path"; spec: string; live: string; fixed?: boolean };
type RequiredCountDrift = { operationId: string; kind: "required-count"; spec: number; live: number };
type Drift = FetchOrParseDrift | MethodDrift | PathDrift | RequiredCountDrift;

const drifts: Drift[] = [];
const fixedFiles: Array<{ file: string; operationIds: string[] }> = [];
let checked = 0;
let skipped = 0;

for (const f of files) {
  const raw = readFileSync(join(specDir, f), "utf8");
  const cat = parseYaml(raw) as { operations?: Operation[] };
  const fileFixes: SpecFix[] = [];

  for (const op of cat.operations ?? []) {
    // liveDiff: false marks pages that cannot be machine-diffed (WebSocket
    // docs, webhook description pages, human-readable reference tables, and
    // REST pages whose method is not present in the DOM). Skip them rather
    // than let them fire as permanent noise.
    if (op.liveDiff === false) {
      skipped += 1;
      continue;
    }
    checked += 1;
    const url = base + op.docUrl;
    let scraped;
    try {
      scraped = parseOperationHtml(await fetchHtml(url));
    } catch (err) {
      drifts.push({ operationId: op.operationId, kind: "fetch", detail: String(err) });
      continue;
    }

    // Method drift. A null scraped method means the page markup no longer
    // matches what the scraper understands — surface that as a parse failure
    // instead of a false match (old code silently defaulted to GET).
    if (op.method && scraped.method === null) {
      drifts.push({
        operationId: op.operationId,
        kind: "parse",
        detail: "method not found on page",
      });
    } else if (scraped.method && op.method && scraped.method !== op.method) {
      const entry: MethodDrift = { operationId: op.operationId, kind: "method", spec: op.method, live: scraped.method };
      if (fix) {
        fileFixes.push({ operationId: op.operationId, field: "method", value: scraped.method });
        entry.fixed = true;
      }
      drifts.push(entry);
    }

    // Path drift (ignore live template casing and trailing slash quirks).
    if (scraped.url && op.path) {
      const live = scraped.url.replace(/\/$/, "");
      const spec = op.path.replace(/\/$/, "");
      if (live !== spec) {
        const entry: PathDrift = { operationId: op.operationId, kind: "path", spec, live };
        if (fix) {
          fileFixes.push({ operationId: op.operationId, field: "path", value: live });
          entry.fixed = true;
        }
        drifts.push(entry);
      }
    }

    // Required-field count drift (body only — URL fields are template-driven).
    // Body fields live at op.requestBody.fields as a name -> shape mapping.
    const specFields = op.requestBody?.fields;
    if (specFields && scraped.bodyFields.length > 0) {
      const specRequired = Object.values(specFields).filter((f) => f && f.required === true).length;
      const liveRequired = scraped.bodyFields.filter((f) => f.required).length;
      if (specRequired !== liveRequired) {
        drifts.push({
          operationId: op.operationId,
          kind: "required-count",
          spec: specRequired,
          live: liveRequired,
        });
      }
    }
  }

  if (fix && fileFixes.length > 0) {
    const { text, applied } = applySpecFixes(raw, fileFixes);
    writeFileSync(join(specDir, f), text);
    fixedFiles.push({ file: f, operationIds: applied });
  }
}

const report = { checked, skipped, drifts, ...(fix ? { fixedFiles } : {}) };
console.log(JSON.stringify(report, null, 2));
const unfixed = drifts.filter((d) => !("fixed" in d && d.fixed));
process.exit(unfixed.length === 0 ? 0 : 1);
