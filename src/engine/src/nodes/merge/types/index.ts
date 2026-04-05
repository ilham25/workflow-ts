import type {
  BaseNodeType,
  BaseNodeTypeDescription,
} from "../../../types/node-type.js";
import type { BaseNodeParameters } from "../../types/index.js";

export interface MergeNode extends BaseNodeType {
  description: MergeNodeDescription;
}

export interface MergeNodeDescription extends BaseNodeTypeDescription {
  type: "merge";
  parameters: MergeNodeParameters;
}

export interface MergeNodeParameters extends BaseNodeParameters {
  inputCounts: number;
}
