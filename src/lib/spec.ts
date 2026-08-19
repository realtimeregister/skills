import { readFileSync, readdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import type { Category, SharedSpec, Spec, Operation } from "./types.js";

const here = dirname(fileURLToPath(import.meta.url));
export const SKILL_DIR = join(here, "..", "..", "skills", "realtimeregister-api");
export const SPEC_DIR = join(SKILL_DIR, "assets", "spec");
export const REFERENCES_DIR = join(SKILL_DIR, "references");

export function loadShared(dir: string = SPEC_DIR): SharedSpec {
  const raw = readFileSync(join(dir, "_shared.yaml"), "utf8");
  const parsed = parseYaml(raw) as SharedSpec;
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid _shared.yaml: expected mapping at root.");
  }
  return parsed;
}

export function loadCategory(name: string, dir: string = SPEC_DIR): Category {
  const raw = readFileSync(join(dir, `${name}.yaml`), "utf8");
  const parsed = parseYaml(raw) as Category;
  if (!parsed || typeof parsed !== "object" || parsed.category !== name) {
    throw new Error(`Invalid category file ${name}.yaml: 'category' must equal '${name}'.`);
  }
  if (!Array.isArray(parsed.operations)) {
    throw new Error(`Invalid category file ${name}.yaml: 'operations' must be an array.`);
  }
  const seen = new Set<string>();
  for (const op of parsed.operations) {
    if (!op.operationId) {
      throw new Error(`Operation missing operationId in ${name}.yaml.`);
    }
    if (seen.has(op.operationId)) {
      throw new Error(`Duplicate operationId '${op.operationId}' in ${name}.yaml.`);
    }
    seen.add(op.operationId);
  }
  return parsed;
}

export function listCategoryFiles(dir: string = SPEC_DIR): string[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".yaml") && !f.startsWith("_"))
    .map((f) => basename(f, ".yaml"))
    .sort();
}

export function loadSpec(dir: string = SPEC_DIR): Spec {
  const shared = loadShared(dir);
  const categories = new Map<string, Category>();
  for (const name of listCategoryFiles(dir)) {
    categories.set(name, loadCategory(name, dir));
  }
  return { shared, categories };
}

export function findOperation(spec: Spec, operationId: string): { category: Category; op: Operation } | null {
  for (const category of spec.categories.values()) {
    const op = category.operations.find((o) => o.operationId === operationId);
    if (op) return { category, op };
  }
  return null;
}

export function allOperations(spec: Spec): Array<{ category: Category; op: Operation }> {
  const out: Array<{ category: Category; op: Operation }> = [];
  for (const category of spec.categories.values()) {
    for (const op of category.operations) out.push({ category, op });
  }
  return out;
}
