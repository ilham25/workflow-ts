import type { NodeType } from "../../types/node-type.js";
import { getNodeInput, getNodeOutput } from "../../utils/node-helpers.js";
import type { WorkflowNodeToNodeType } from "../types/index.js";
import type { MergeNodeParameters } from "./types/index.js";

const execute: NodeType["execute"] = (ctx) => {
  const items = ctx.getInputData();
  console.log("items merge", JSON.stringify(items, null, 2));

  return Promise.resolve(items);
};

export const getNode: WorkflowNodeToNodeType = (workflow, node) => {
  const input = getNodeInput(workflow, node);
  const output = getNodeOutput(workflow, node);

  return {
    description: {
      name: node.id,
      displayName: node.name,
      input,
      output,
      parameters: node.parameters as unknown as MergeNodeParameters,
      type: "merge",
    },
    execute,
  };
};
