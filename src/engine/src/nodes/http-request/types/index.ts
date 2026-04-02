import type {
  BaseNodeType,
  BaseNodeTypeDescription,
} from "../../../types/node-type.js";
import type { BaseNodeParameters } from "../../types/index.js";

export interface HttpRequestNode extends BaseNodeType {
  description: HttpRequestNodeDescription;
}

export interface HttpRequestNodeDescription extends BaseNodeTypeDescription {
  type: "httpRequest";
  parameters: HttpRequestNodeParameters;
}

export interface HttpRequestNodeParameters extends BaseNodeParameters {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
}
