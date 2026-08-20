// Render a category YAML into a Markdown reference document suitable for
// loading as agent context.

import type { Category, FieldShape, Operation, Param, SharedSpec } from "./types.js";

export function renderCategory(cat: Category, shared: SharedSpec): string {
  const lines: string[] = [];
  lines.push(`# ${cat.label} (\`${cat.category}\`)`);
  lines.push("");
  lines.push(cat.description.trim());
  lines.push("");
  lines.push(`**Base URL:** \`${shared.baseUrl}\`  `);
  lines.push(`**Docs:** \`${shared.docsBaseUrl}\``);
  lines.push("");
  lines.push("## Operations");
  lines.push("");
  for (const op of cat.operations) {
    lines.push(...renderOperation(op, shared));
    lines.push("");
  }
  return lines.join("\n");
}

export function renderOperation(op: Operation, shared: SharedSpec): string[] {
  const lines: string[] = [];
  lines.push(`### \`${op.operationId}\``);
  lines.push("");
  lines.push(`\`${op.method} ${op.path}\`${op.async ? "  _async_" : ""}${op.deprecated ? "  _deprecated_" : ""}`);
  lines.push("");
  lines.push(op.summary);
  lines.push("");
  lines.push(`- **Docs:** \`${shared.docsBaseUrl}${op.docUrl}\``);
  lines.push(`- **Auth scope:** \`${op.authScope}\``);
  lines.push("");

  if (op.pathParams?.length) {
    lines.push("**Path params**");
    lines.push("");
    lines.push(...renderParamTable(op.pathParams));
    lines.push("");
  }
  if (op.queryParams?.length) {
    lines.push("**Query params**");
    lines.push("");
    lines.push(...renderParamTable(op.queryParams));
    lines.push("");
  }
  if (op.requestBody) {
    lines.push(`**Request body** (\`${op.requestBody.contentType}\`)`);
    lines.push("");
    lines.push(...renderFieldTable(op.requestBody.fields, shared));
    lines.push("");
  }
  if (op.responses) {
    lines.push("**Responses**");
    lines.push("");
    for (const [code, r] of Object.entries(op.responses)) {
      lines.push(`- \`${code}\` - ${r.description ?? ""}`);
    }
    lines.push("");
  }
  if (op.errors?.length) {
    lines.push(`**Errors:** ${op.errors.map((e) => `\`${e}\``).join(", ")}`);
    lines.push("");
  }
  if (op.gotchas?.length) {
    lines.push("**Gotchas**");
    lines.push("");
    for (const g of op.gotchas) lines.push(`- ${g}`);
    lines.push("");
  }
  if (op.examples?.length) {
    lines.push("**Examples**");
    lines.push("");
    for (const ex of op.examples) {
      lines.push(`_${ex.name}_`);
      lines.push("");
      const body = typeof ex.request === "string" ? ex.request : JSON.stringify(ex.request, null, 2);
      lines.push("```");
      lines.push(body);
      lines.push("```");
      lines.push("");
    }
  }
  return lines;
}

function renderParamTable(params: Param[]): string[] {
  const rows = ["| Name | Type | Required | Description |", "| --- | --- | --- | --- |"];
  for (const p of params) {
    const type = p.enumRef ? `\`${p.enumRef}\`` : `\`${p.type}\``;
    rows.push(`| \`${p.name}\` | ${type} | ${p.required ? "yes" : "no"} | ${p.description ?? ""} |`);
  }
  return rows;
}

function renderFieldTable(fields: Record<string, FieldShape>, _shared: SharedSpec): string[] {
  const rows = ["| Field | Type | Required | Description |", "| --- | --- | --- | --- |"];
  for (const [name, shape] of Object.entries(fields)) {
    rows.push(`| \`${name}\` | ${fieldType(shape)} | ${shape.required ? "yes" : "no"} | ${shape.description ?? ""} |`);
  }
  return rows;
}

function fieldType(shape: FieldShape): string {
  if (shape.enumRef) return `\`${shape.enumRef}\``;
  if (shape.itemsRef) return `\`${shape.itemsRef}[]\``;
  if (shape.fieldsRef) return `\`${shape.fieldsRef}\``;
  if (shape.type === "array") {
    if (typeof shape.items === "string") return `\`${shape.items}[]\``;
    return "`array`";
  }
  return `\`${shape.type}\``;
}
