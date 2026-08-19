#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { renderCategory } from "../src/lib/generator.ts";
import { loadSpec, REFERENCES_DIR } from "../src/lib/spec.ts";

const spec = loadSpec();
mkdirSync(REFERENCES_DIR, { recursive: true });

for (const category of spec.categories.values()) {
  const rendered = renderCategory(category, spec.shared);
  writeFileSync(join(REFERENCES_DIR, `${category.category}.md`), rendered + "\n");
}

console.log(`generated ${spec.categories.size} reference files`);
