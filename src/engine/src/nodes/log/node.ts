import type { NodeType } from "../../types/node-type.js";
import { getNodeInput, getNodeOutput } from "../../utils/node-helpers.js";
import type { WorkflowNodeToNodeType } from "../types/index.js";
import type { LogNodeParameters } from "./types/index.js";

const execute: NodeType["execute"] = (ctx) => {
  const message = ctx.getNodeParameter("message") as string;
  return Promise.resolve([[{ json: { message } }]]);
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
      parameters: node.parameters as unknown as LogNodeParameters,
      type: "log",
    },
    execute,
  };
};
