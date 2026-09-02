#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { renderCategory, renderListingReference } from "../src/lib/generator.ts";
import { loadSpec, REFERENCES_DIR } from "../src/lib/spec.ts";

const spec = loadSpec();
mkdirSync(REFERENCES_DIR, { recursive: true });
writeFileSync(join(REFERENCES_DIR, "listings.md"), renderListingReference(spec.shared.listing, spec.shared) + "\n");

for (const category of spec.categories.values()) {
  const rendered = renderCategory(category, spec.shared);
  writeFileSync(join(REFERENCES_DIR, `${category.category}.md`), rendered + "\n");
}

console.log(`generated ${spec.categories.size} category references and listings.md`);
