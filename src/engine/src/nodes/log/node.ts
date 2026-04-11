import { expressionEngine } from "../../expressions/engine.js";
import type { NodeType } from "../../types/node-type.js";
import { getNodeInput, getNodeOutput } from "../../utils/node-helpers.js";
import type { WorkflowNodeToNodeType } from "../types/index.js";
import type { LogNodeParameters } from "./types/index.js";
import chalk from "chalk";

const log = console.log;

const execute: NodeType["execute"] = (ctx) => {
  const items = ctx.getInputData();
  const message = ctx.getNodeParameter("message") as string;

  for (const item of items) {
    for (const innerItem of item) {
      const result = expressionEngine(innerItem.json, message);
      log(chalk.italic.green("[Log Node]", result));
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
      position: node.position,
    },
    execute,
  };
};
