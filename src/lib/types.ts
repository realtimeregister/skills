// Type definitions for the hand-curated YAML specification under assets/spec/.
// These are intentionally permissive: the YAML is the source of truth, and the
// loader performs shallow validation only. Consumers must treat fields as
// untrusted input.

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface FieldShape {
  type: "string" | "integer" | "number" | "boolean" | "array" | "object";
  required?: boolean;
  default?: unknown;
  description?: string;
  format?: string;
  enum?: unknown[];
  enumRef?: string;
  const?: unknown;
  items?: string | FieldShape;
  itemsRef?: string;
  fields?: Record<string, FieldShape>;
  fieldsRef?: string;
  minimum?: number;
  maximum?: number;
  minItems?: number;
  maxItems?: number;
  minLength?: number;
  maxLength?: number;
  example?: unknown;
}

export interface Param {
  name: string;
  type: FieldShape["type"];
  required?: boolean;
  description?: string;
  default?: unknown;
  minimum?: number;
  maximum?: number;
  enumRef?: string;
  example?: unknown;
  format?: string;
}

export interface RequestBody {
  contentType: string;
  fields: Record<string, FieldShape>;
}

export interface ResponseShape {
  description?: string;
}

export interface ExampleRequest {
  method?: HttpMethod;
  path?: string;
  body?: unknown;
}

export interface OperationExample {
  name: string;
  request: ExampleRequest | string;
}

export interface Operation {
  operationId: string;
  method: HttpMethod;
  path: string;
  docUrl: string;
  async: boolean;
  deprecated?: boolean;
  verified?: "docs" | "sdk" | "none";
  authScope: "customer" | "gateway";
  summary: string;
  pathParams?: Param[];
  queryParams?: Param[];
  requestBody?: RequestBody;
  responses?: Record<string, ResponseShape>;
  errors?: string[];
  gotchas?: string[];
  examples?: OperationExample[];
  /**
   * false = page cannot be machine-diffed; skip in diff-live. Omitted (or
   * true) means the operation is a normal, diffable REST endpoint.
   */
  liveDiff?: boolean;
}

export interface Category {
  category: string;
  label: string;
  description: string;
  operations: Operation[];
}

export interface EnumDef {
  values: unknown[];
  description?: string;
  format?: string;
  example?: unknown;
}

export interface TypeDef {
  description?: string;
  docUrl?: string;
  fields: Record<string, FieldShape>;
}

export interface SharedSpec {
  version: number;
  baseUrl: string;
  docsBaseUrl: string;
  auth?: {
    header: string;
    scheme: string;
    format: string;
    docsUrl?: string;
    rules: string[];
  };
  enums: Record<string, EnumDef>;
  types: Record<string, TypeDef>;
  errors: Array<{ code: string; httpStatus: number; description?: string }>;
}

export interface Spec {
  shared: SharedSpec;
  categories: Map<string, Category>;
}
