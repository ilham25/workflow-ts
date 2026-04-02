import type { NodeType } from "../../types/node-type.js";
import type {
  BaseNodeParameters,
  WorkflowNodeToNodeType,
} from "../types/index.js";

const execute: NodeType["execute"] = (ctx) => {
  return Promise.resolve([]);
};

export const getNode: WorkflowNodeToNodeType = (workflow, node) => {
  return {
    description: {
      name: node.id,
      displayName: node.name,
      input: [],
      output: [],
      parameters: node.parameters as unknown as BaseNodeParameters,
      type: "trigger",
    },
    execute,
  };
};
