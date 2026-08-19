// Static integrity check for assets/spec/. Verifies every enumRef,
// fieldsRef, and itemsRef in every category file resolves against
// _shared.yaml, that each operation carries the required top-level keys
// with valid values, that field/param types are valid, that the billable
// invariant holds, and that every `verified: docs` operation's contract
// still matches the committed fidelity lock (assets/spec/_fingerprints.json).
// Run with: bun scripts/audit-refs.ts
// Regenerate the lock after an intentional, re-verified contract edit with:
//   bun scripts/audit-refs.ts --update-lock

import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { parse } from "yaml";
import { fingerprintSpec } from "../src/lib/integrity.ts";
import { loadSpec, SPEC_DIR } from "../src/lib/spec.ts";
import type { FieldShape, Operation } from "../src/lib/types.ts";

const dir = SPEC_DIR;
const shared = parse(readFileSync(join(dir, "_shared.yaml"), "utf8"));
const enums = new Set(Object.keys(shared.enums ?? {}));
const types = new Set(Object.keys(shared.types ?? {}));

const FINGERPRINT_LOCK_PATH = join(dir, "_fingerprints.json");
const VALID_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "REFERENCE"];
const VALID_FIELD_TYPES = ["string", "integer", "number", "boolean", "array", "object"];
const updateLock = process.argv.includes("--update-lock");

const problems: string[] = [];
let opCount = 0;
const perCategory: Record<string, number> = {};

function walk(pathStr: string, v: unknown, file: string, op: string): void {
  if (!v || typeof v !== "object") return;
  const value = v as FieldShape;
  if (value.enumRef && !enums.has(value.enumRef)) {
    problems.push(`${file} :: ${op} :: ${pathStr} -> unknown enumRef '${value.enumRef}'`);
  }
  if (value.fieldsRef && !types.has(value.fieldsRef)) {
    problems.push(`${file} :: ${op} :: ${pathStr} -> unknown fieldsRef '${value.fieldsRef}'`);
  }
  if (value.itemsRef && !types.has(value.itemsRef)) {
    problems.push(`${file} :: ${op} :: ${pathStr} -> unknown itemsRef '${value.itemsRef}'`);
  }
  const isParamOrFieldScope =
    pathStr.includes(".pathParams") || pathStr.includes(".queryParams") || pathStr.includes(".requestBody");
  if (isParamOrFieldScope && typeof value.type === "string" && !VALID_FIELD_TYPES.includes(value.type)) {
    problems.push(`${file} :: ${op} :: ${pathStr} -> invalid type '${value.type}'`);
  }
  for (const [k, c] of Object.entries(v)) walk(`${pathStr}.${k}`, c, file, op);
}

const required = ["operationId", "method", "path", "docUrl", "authScope", "summary"] as const satisfies ReadonlyArray<keyof Operation>;

for (const f of readdirSync(dir).sort()) {
  if (!f.endsWith(".yaml") || f.startsWith("_")) continue;
  const name = basename(f, ".yaml");
  const cat = parse(readFileSync(join(dir, f), "utf8")) as { category?: string; operations?: Operation[] };
  if (cat.category !== name) problems.push(`${f} :: category '${cat.category}' != filename '${name}'`);
  if (!Array.isArray(cat.operations)) {
    problems.push(`${f} :: 'operations' is not an array`);
    continue;
  }
  perCategory[name] = cat.operations.length;
  const seen = new Set<string>();
  for (const op of cat.operations) {
    opCount++;
    for (const key of required) {
      if (op[key] === undefined || op[key] === null || op[key] === "") {
        problems.push(`${f} :: ${op.operationId ?? "<anon>"} -> missing '${key}'`);
      }
    }
    if (op.async === undefined) problems.push(`${f} :: ${op.operationId} -> missing 'async'`);
    if (op.operationId) {
      if (seen.has(op.operationId)) problems.push(`${f} :: duplicate operationId '${op.operationId}'`);
      seen.add(op.operationId);
    }
    if (op.verified && !["docs", "sdk", "none"].includes(op.verified)) {
      problems.push(`${f} :: ${op.operationId} -> invalid verified '${op.verified}'`);
    }
    if (op.method !== undefined && !VALID_METHODS.includes(op.method)) {
      problems.push(`${f} :: ${op.operationId ?? "<anon>"} -> invalid method '${op.method}'`);
    }
    if (typeof op.docUrl === "string" && (!op.docUrl.startsWith("/") || /\s/.test(op.docUrl))) {
      problems.push(`${f} :: ${op.operationId ?? "<anon>"} -> malformed docUrl '${op.docUrl}'`);
    }
    if (
      typeof op.path === "string" &&
      !op.path.startsWith("/v2/") &&
      !op.path.startsWith("wss://") &&
      !op.path.startsWith("/docs/") &&
      !op.path.startsWith("(")
    ) {
      problems.push(`${f} :: ${op.operationId ?? "<anon>"} -> malformed path '${op.path}'`);
    }
    const hasBillableError = Array.isArray(op.errors) && op.errors.some((e) => typeof e === "string" && e.startsWith("BillableAcknowledgmentNeeded"));
    if (hasBillableError && !op.requestBody?.fields?.billables) {
      problems.push(`${f} :: ${op.operationId ?? "<anon>"} -> declares BillableAcknowledgmentNeeded* error but requestBody.fields.billables is missing`);
    }
    walk("", op, f, op.operationId ?? "<anon>");
  }
}

// --- Fidelity fingerprint lock ---------------------------------------------
const spec = loadSpec();
const currentFingerprints = fingerprintSpec(spec);

if (updateLock) {
  const sortedFingerprints = Object.fromEntries(
    Object.entries(currentFingerprints).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
  );
  const lock = { generatedAt: new Date().toISOString(), fingerprints: sortedFingerprints };
  writeFileSync(FINGERPRINT_LOCK_PATH, JSON.stringify(lock, null, 2) + "\n");
  console.log(`fingerprint lock updated (${Object.keys(sortedFingerprints).length} operations)`);
} else {
  let lock = null;
  if (existsSync(FINGERPRINT_LOCK_PATH)) {
    lock = JSON.parse(readFileSync(FINGERPRINT_LOCK_PATH, "utf8"));
  }
  for (const category of spec.categories.values()) {
    for (const op of category.operations) {
      if (op.verified !== "docs") continue;
      const currentHash = currentFingerprints[op.operationId];
      const lockedHash = lock?.fingerprints?.[op.operationId];
      if (!lock || lockedHash === undefined || lockedHash !== currentHash) {
        problems.push(`${op.operationId}: contract changed since last verification - re-verify against live docs, then run: bun scripts/audit-refs.ts --update-lock`);
      }
    }
  }
}

console.log("=== RTR spec audit ===");
console.log(`categories: ${Object.keys(perCategory).length}`);
console.log(`operations: ${opCount}`);
for (const [k, v] of Object.entries(perCategory)) console.log(`  ${k.padEnd(16)} ${v}`);
console.log(`problems: ${problems.length}`);
for (const p of problems) console.log("  - " + p);
process.exit(problems.length > 0 ? 1 : 0);
