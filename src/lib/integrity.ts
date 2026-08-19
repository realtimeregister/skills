// Fidelity fingerprinting for assets/spec/ operations. Produces a
// deterministic hash of an operation's canonical contract (method, path,
// params, required body fields) so a committed lock file
// (assets/spec/_fingerprints.json) can detect contract edits that would
// otherwise silently invalidate a `verified: docs` marker.
//
// Pure functions, no I/O - see scripts/audit-refs.ts for the orchestration
// that loads/writes the lock file.

import { createHash } from "node:crypto";
import type { Operation, Param, Spec } from "./types.js";

export interface OperationFingerprint {
  operationId: string;
  hash: string;
}

interface CanonicalParam {
  name: string;
  type: Param["type"];
  required: boolean;
}

function canonicalParams(params: Param[] | undefined): CanonicalParam[] {
  if (!params) return [];
  return params.map((p) => ({ name: p.name, type: p.type, required: p.required === true }));
}

function requiredBodyFieldNames(op: Operation): string[] {
  const fields = op.requestBody?.fields ?? {};
  return Object.entries(fields)
    .filter(([, shape]) => shape.required === true)
    .map(([name]) => name)
    .sort();
}

export function canonicalContract(op: Operation): string {
  const canonical = {
    method: op.method,
    path: op.path,
    pathParams: canonicalParams(op.pathParams),
    queryParams: canonicalParams(op.queryParams),
    requiredBodyFields: requiredBodyFieldNames(op),
  };
  return JSON.stringify(canonical);
}

export function fingerprintOperation(op: Operation): string {
  return createHash("sha256").update(canonicalContract(op)).digest("hex");
}

export function fingerprintSpec(spec: Spec): Record<string, string> {
  const entries: Array<[string, string]> = [];
  for (const category of spec.categories.values()) {
    for (const op of category.operations) {
      entries.push([op.operationId, fingerprintOperation(op)]);
    }
  }
  entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return Object.fromEntries(entries);
}
