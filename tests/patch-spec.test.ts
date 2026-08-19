import { describe, expect, it } from "bun:test";
import { applySpecFixes } from "../src/lib/patch-spec.js";

const FIXTURE = `category: widgets
label: Widgets
description: |
  Widget operations.

operations:
  - operationId: createWidget
    verified: docs
    method: POST # creates a widget
    path: /v2/widgets
    docUrl: /widgets/create
    async: false
    authScope: customer
    summary: Create a widget.
    responses:
      "200": { description: OK }

  - operationId: deleteWidget
    verified: docs
    method: POST
    path: /v2/widgets/{id}/remove
    docUrl: /widgets/delete
    async: false
    authScope: customer
    summary: Delete a widget.
    responses:
      "200": { description: OK }
`;

describe("applySpecFixes", () => {
  it("patches only the targeted field, leaving formatting and comments untouched", () => {
    const { text, applied, notFound } = applySpecFixes(FIXTURE, [
      { operationId: "deleteWidget", field: "method", value: "DELETE" },
    ]);

    expect(applied).toEqual(["deleteWidget"]);
    expect(notFound).toEqual([]);
    expect(text).toContain("method: DELETE");
    expect(text).toContain("method: POST # creates a widget"); // createWidget untouched
    expect(text).toContain("path: /v2/widgets/{id}/remove"); // path untouched
    expect(text).toContain("description: |\n  Widget operations.\n"); // header untouched
  });

  it("patches the path field", () => {
    const { text, applied } = applySpecFixes(FIXTURE, [
      { operationId: "deleteWidget", field: "path", value: "/v2/widgets/{id}" },
    ]);

    expect(applied).toEqual(["deleteWidget"]);
    expect(text).toContain("path: /v2/widgets/{id}\n");
    expect(text).not.toContain("/v2/widgets/{id}/remove");
  });

  it("applies multiple fixes across different operations in one pass", () => {
    const { text, applied } = applySpecFixes(FIXTURE, [
      { operationId: "createWidget", field: "method", value: "PUT" },
      { operationId: "deleteWidget", field: "method", value: "DELETE" },
    ]);

    expect(applied.sort()).toEqual(["createWidget", "deleteWidget"]);
    expect(text).toContain("method: PUT");
    expect(text).toContain("method: DELETE");
  });

  it("reports unknown operationIds as notFound and leaves the text unchanged", () => {
    const { text, applied, notFound } = applySpecFixes(FIXTURE, [
      { operationId: "doesNotExist", field: "method", value: "DELETE" },
    ]);

    expect(applied).toEqual([]);
    expect(notFound).toEqual(["doesNotExist"]);
    expect(text).toBe(FIXTURE);
  });

  it("returns the text unchanged when the file has no operations array", () => {
    const result = applySpecFixes("category: empty\nlabel: Empty\n", [
      { operationId: "anything", field: "method", value: "GET" },
    ]);

    expect(result.applied).toEqual([]);
    expect(result.notFound).toEqual(["anything"]);
  });
});
