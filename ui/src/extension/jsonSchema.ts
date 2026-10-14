import type { JsonValue } from '../admin/types';

export interface CedrosJsonSchemaObject {
  [keyword: string]:
    | JsonValue
    | CedrosJsonSchema
    | readonly CedrosJsonSchema[]
    | Record<string, CedrosJsonSchema>
    | undefined;
  type?: string | readonly string[];
  properties?: Record<string, CedrosJsonSchema>;
  required?: readonly string[];
  additionalProperties?: boolean | CedrosJsonSchema;
  items?: CedrosJsonSchema | readonly CedrosJsonSchema[];
  enum?: readonly JsonValue[];
  const?: JsonValue;
  description?: string;
  format?: string;
}

export type CedrosJsonSchema = boolean | CedrosJsonSchemaObject;
