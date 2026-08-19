// Surgical, format-preserving patches to a category spec's YAML source.
//
// Used by scripts/diff-live.ts --fix to auto-correct method/path drift
// detected against the live docs. Only `method` and `path` are supported —
// those are the two fields the live-diff scraper can supply an already
// -verified replacement value for directly, without deeper field-level
// reconciliation. Everything else in the file (comments, spacing, key
// order, untouched operations) is left byte-identical.

import { parseDocument, isSeq, isMap } from "yaml";

export interface SpecFix {
  operationId: string;
  field: "method" | "path";
  value: string;
}

export interface ApplyFixesResult {
  /** The full file text with fixes applied (unchanged if nothing matched). */
  text: string;
  /** operationIds that were found and patched. */
  applied: string[];
  /** operationIds from `fixes` that don't exist in this file. */
  notFound: string[];
}

export function applySpecFixes(yamlText: string, fixes: SpecFix[]): ApplyFixesResult {
  const doc = parseDocument(yamlText);
  const operations = doc.get("operations");
  const applied: string[] = [];
  const notFound: string[] = [];

  if (!isSeq(operations)) {
    return { text: yamlText, applied, notFound: fixes.map((f) => f.operationId) };
  }

  for (const fix of fixes) {
    const idx = operations.items.findIndex(
      (item) => isMap(item) && item.get("operationId") === fix.operationId,
    );
    if (idx === -1) {
      notFound.push(fix.operationId);
      continue;
    }
    doc.setIn(["operations", idx, fix.field], fix.value);
    applied.push(fix.operationId);
  }

  return { text: String(doc), applied, notFound };
}
