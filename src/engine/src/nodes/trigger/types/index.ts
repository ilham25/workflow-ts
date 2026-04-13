import type {
  BaseNodeType,
  BaseNodeTypeDescription,
} from "../../../types/node-type.js";

export interface TriggerNode extends BaseNodeType {
  description: TriggerNodeDescription;
}

export interface TriggerNodeDescription extends BaseNodeTypeDescription {
  type: "trigger";
}
