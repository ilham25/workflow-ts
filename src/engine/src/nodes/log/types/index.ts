import type {
  BaseNodeType,
  BaseNodeTypeDescription,
} from "../../../types/node-type.js";
import type { BaseNodeParameters } from "../../types/index.js";

export interface LogNode extends BaseNodeType {
  description: LogNodeDescription;
}

export interface LogNodeDescription extends BaseNodeTypeDescription {
  type: "log";
  parameters: LogNodeParameters;
}

export interface LogNodeParameters extends BaseNodeParameters {
  message: string;
}
