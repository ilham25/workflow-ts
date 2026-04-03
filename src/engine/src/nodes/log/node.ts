import type { NodeType } from "../../types/node-type.js";
import { getNodeInput, getNodeOutput } from "../../utils/node-helpers.js";
import type { WorkflowNodeToNodeType } from "../types/index.js";
import type { LogNodeParameters } from "./types/index.js";
import vm from "node:vm";

const execute: NodeType["execute"] = (ctx) => {
  const items = ctx.getInputData();
  const message = ctx.getNodeParameter("message") as string;

  const output = message.match(/\{\{(.+?)\}\}/g) ?? [];

  for (const item of items) {
    for (const innerItem of item) {
      let tmpMessage = message;
      for (const outputItem of output) {
        const expression = outputItem
          .replace("{{", "")
          .replace("}}", "")
          .trim();
        const result = vm.runInNewContext(expression, {
          $json: innerItem.json,
          $now: new Date(),
        });

        tmpMessage = tmpMessage.replace(outputItem, result);
      }
      console.log(tmpMessage);
    }
  }

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
      parameters: node.parameters as unknown as LogNodeParameters,
      type: "log",
    },
    execute,
  };
};
