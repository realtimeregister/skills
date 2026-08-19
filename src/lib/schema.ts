// Convert the YAML FieldShape / Param definitions into a JSON Schema
// (draft-07) usable by Ajv. Keeps the transformation deterministic and pure
// so the generated schema can be cached per operationId.

import type { FieldShape, Operation, Param, SharedSpec } from "./types.js";

type JsonSchema = Record<string, unknown>;

export interface SchemaBundle {
  query: JsonSchema;
  path: JsonSchema;
  body: JsonSchema | null;
}

function primitive(type: FieldShape["type"]): string {
  return type === "integer" ? "integer" : type;
}

function shapeToSchema(shape: FieldShape, shared: SharedSpec): JsonSchema {
  const out: JsonSchema = { type: primitive(shape.type) };
  if (shape.description) out.description = shape.description;
  if (shape.format) out.format = shape.format;
  if (shape.default !== undefined) out.default = shape.default;
  if (shape.minimum !== undefined) out.minimum = shape.minimum;
  if (shape.maximum !== undefined) out.maximum = shape.maximum;
  if (shape.minLength !== undefined) out.minLength = shape.minLength;
  if (shape.maxLength !== undefined) out.maxLength = shape.maxLength;
  if (shape.minItems !== undefined) out.minItems = shape.minItems;
  if (shape.maxItems !== undefined) out.maxItems = shape.maxItems;
  if (shape.const !== undefined) out.const = shape.const;
  if (shape.enum) out.enum = shape.enum;

  if (shape.enumRef) {
    const en = shared.enums[shape.enumRef];
    if (en?.values) out.enum = en.values;
  }

  if (shape.type === "object") {
    if (shape.fieldsRef) {
      const t = shared.types[shape.fieldsRef];
      if (t) {
        const { properties, required } = objectFieldsToSchema(t.fields, shared);
        out.properties = properties;
        if (required.length > 0) out.required = required;
        out.additionalProperties = false;
      }
    } else if (shape.fields) {
      const { properties, required } = objectFieldsToSchema(shape.fields, shared);
      out.properties = properties;
      if (required.length > 0) out.required = required;
      out.additionalProperties = false;
    }
  }

  if (shape.type === "array") {
    if (shape.itemsRef) {
      const t = shared.types[shape.itemsRef];
      if (t) {
        const { properties, required } = objectFieldsToSchema(t.fields, shared);
        out.items = {
          type: "object",
          properties,
          ...(required.length > 0 ? { required } : {}),
          additionalProperties: false,
        };
      } else {
        out.items = { type: "object" };
      }
    } else if (typeof shape.items === "string") {
      out.items = { type: shape.items };
    } else if (shape.items) {
      out.items = shapeToSchema(shape.items, shared);
    }
  }

  return out;
}

function objectFieldsToSchema(
  fields: Record<string, FieldShape>,
  shared: SharedSpec
): { properties: Record<string, JsonSchema>; required: string[] } {
  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];
  for (const [name, shape] of Object.entries(fields)) {
    properties[name] = shapeToSchema(shape, shared);
    if (shape.required) required.push(name);
  }
  return { properties, required };
}

export function buildOperationSchemas(op: Operation, shared: SharedSpec): SchemaBundle {
  const pathProps: Record<string, JsonSchema> = {};
  const pathRequired: string[] = [];
  for (const p of op.pathParams ?? []) {
    pathProps[p.name] = paramToSchema(p, shared);
    if (p.required !== false) pathRequired.push(p.name);
  }

  const queryProps: Record<string, JsonSchema> = {};
  const queryRequired: string[] = [];
  for (const p of op.queryParams ?? []) {
    queryProps[p.name] = paramToSchema(p, shared);
    if (p.required) queryRequired.push(p.name);
  }

  const body = op.requestBody
    ? {
        type: "object",
        ...objectWrapper(op.requestBody.fields, shared),
      }
    : null;

  return {
    path: {
      type: "object",
      properties: pathProps,
      required: pathRequired,
      additionalProperties: false,
    },
    query: {
      type: "object",
      properties: queryProps,
      ...(queryRequired.length > 0 ? { required: queryRequired } : {}),
      additionalProperties: false,
    },
    body,
  };
}

function objectWrapper(fields: Record<string, FieldShape>, shared: SharedSpec) {
  const { properties, required } = objectFieldsToSchema(fields, shared);
  return {
    properties,
    ...(required.length > 0 ? { required } : {}),
    additionalProperties: false,
  };
}

function paramToSchema(p: Param, shared: SharedSpec): JsonSchema {
  const shape: FieldShape = {
    type: p.type ?? "string",
    ...(p.description !== undefined ? { description: p.description } : {}),
    ...(p.format !== undefined ? { format: p.format } : {}),
    ...(p.enumRef !== undefined ? { enumRef: p.enumRef } : {}),
    ...(p.minimum !== undefined ? { minimum: p.minimum } : {}),
    ...(p.maximum !== undefined ? { maximum: p.maximum } : {}),
    ...(p.default !== undefined ? { default: p.default } : {}),
  };
  return shapeToSchema(shape, shared);
}
