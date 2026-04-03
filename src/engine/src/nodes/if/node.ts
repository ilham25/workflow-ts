import type { NodeExecutionData } from "../../types/node-execution.js";
import type { NodeType } from "../../types/node-type.js";
import { getNodeInput, getNodeOutput } from "../../utils/node-helpers.js";
import type { WorkflowNodeToNodeType } from "../types/index.js";
import type { IfNodeParameters } from "./types/index.js";

const execute: NodeType["execute"] = (ctx) => {
  const items = ctx.getInputData();
  const condition = ctx.getNodeParameter("condition") as string;

  const output = (condition.match(/\{\{(.+?)\}\}/g) ?? [])[0]!;

  const itemResults = items.map((item) => {
    return item.map((item) => {
      const expression = output.replace("{{", "").replace("}}", "").trim();
      const fn = new Function("$json", "$now", "return (" + expression + ")");
      const result = fn(item.json, new Date());
      return result;
    });
  });

  const trueResults: NodeExecutionData[] = [];
  const falseResults: NodeExecutionData[] = [];

  itemResults.forEach((item, outerIndex) => {
    item.forEach((result, innerIndex) => {
      const outerItem = items[outerIndex];
      if (!outerItem) return;
      const item = outerItem[innerIndex];
      if (!item) return;
      if (result) {
        trueResults.push(item);
      } else {
        falseResults.push(item);
      }
    });
  });

  return Promise.resolve([trueResults, falseResults]);
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
      parameters: node.parameters as unknown as IfNodeParameters,
      type: "if",
    },
    execute,
  };
};
