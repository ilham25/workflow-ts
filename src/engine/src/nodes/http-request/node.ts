import type { NodeType } from "../../types/node-type.js";
import { getNodeInput, getNodeOutput } from "../../utils/node-helpers.js";
import type { WorkflowNodeToNodeType } from "../types/index.js";
import type { HttpRequestNodeParameters } from "./types/index.js";

const execute: NodeType["execute"] = async (ctx) => {
  const items = ctx.getInputData();

  const results = await Promise.all(
    items.map(async (item) => {
      const url = ctx.getNodeParameter("url") as string;
      const method = ctx.getNodeParameter("method") as string;

      const query = await ctx.helpers.request(url, { method });
      const json = await query.json();

      return { json };
    }),
  );

  return Promise.resolve([results]);
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
      parameters: node.parameters as unknown as HttpRequestNodeParameters,
      type: "httpRequest",
    },
    execute,
  };
};
