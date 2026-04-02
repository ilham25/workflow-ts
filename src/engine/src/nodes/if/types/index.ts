import type {
  BaseNodeType,
  BaseNodeTypeDescription,
} from "../../../types/node-type.js";
import type { BaseNodeParameters } from "../../types/index.js";

export interface IfNode extends BaseNodeType {
  description: IfNodeDescription;
}

export interface IfNodeDescription extends BaseNodeTypeDescription {
  type: "if";
  parameters: IfNodeParameters;
}

export interface IfNodeParameters extends BaseNodeParameters {
  conditions: string;
}
