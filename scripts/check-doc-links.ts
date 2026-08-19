#!/usr/bin/env node

import { checkLink } from "../src/lib/scraper.ts";
import { allOperations, loadSpec } from "../src/lib/spec.ts";

const spec = loadSpec();
const problems = [];

for (const { op } of allOperations(spec)) {
  const url = spec.shared.docsBaseUrl + op.docUrl;
  const result = await checkLink(url);
  const status = result.status === 0 ? "ERR" : result.status;
  console.log(`${result.ok ? "OK " : "BAD"} ${status} ${op.operationId.padEnd(28)} ${url}`);
  if (!result.ok) problems.push({ operationId: op.operationId, status: result.status, url });
}

if (problems.length > 0) {
  console.error(`${problems.length} documentation links failed`);
  process.exit(1);
}
