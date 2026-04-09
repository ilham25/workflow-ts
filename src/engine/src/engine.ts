import type { Request } from "express";
import type { NodeContext } from "./types/node-context.js";
import type { NodeExecutionData } from "./types/node-execution.js";
import type { NodeType } from "./types/node-type.js";
import type { Workflow } from "./types/workflow.js";
import {
  getWorkflowQueue,
  helpers,
  workflowToNodeTypes,
} from "./utils/helpers.js";
import chalk from "chalk";
import type { NodeEvent } from "./types/events.js";

const log = console.log;

export async function main(
  json: Workflow,
  req: Request,
  onEvent: (event: NodeEvent) => void,
) {
  const pipeline = workflowToNodeTypes(json);

  const triggerNode = pipeline.find(
    (node) => node.description.type === "trigger",
  );
  if (!triggerNode) {
    throw new Error("No trigger node found");
  }

  const results = new Map<string, NodeExecutionData[][]>();

  const { queue, nodeMap } = await getWorkflowQueue(json);

  log(chalk.bgGreen(" Processing Queue "));
  for (const node of queue) {
    onEvent({
      name: "node:update",
      data: {
        node,
        status: "processing",
        data: null,
      },
      id: String(+new Date()),
    });
    await wait(1000);
    try {
      const { output, input } = await processNode(node, results, req, nodeMap);

      results.set(node.description.name, output);
      log(`${node.description.name} done.`);
      onEvent({
        name: "node:update",
        data: {
          status: "success",
          node,
          data: {
            input: input.getInputData(),
            output,
          },
        },
        id: String(+new Date()),
      });
    } catch (error) {
      log(chalk.bgRed(`${node.description.name} failed.`));
      onEvent({
        name: "node:update",
        data: {
          status: "error",
          node,
          data: {
            error: String(error),
          },
        },
        id: String(+new Date()),
      });
    }
  }

  log(chalk.bgGreen(" Queue Processing End "));

  return queue.map((node) => ({
    node,
    result: results.get(node.description.name),
  }));
}

const processNode = async (
  node: NodeType,
  results: Map<string, NodeExecutionData[][]>,
  req: Request,
  nodeMap: Map<string, NodeType>,
): Promise<{
  input: NodeContext;
  output: NodeExecutionData[][];
}> => {
  const input = await collectInputs(node, results, req, nodeMap);
  const output = await node.execute(input);

  return { input, output };
};

const collectInputs = async (
  node: NodeType,
  results: Map<string, NodeExecutionData[][]>,
  req: Request,
  nodeMap: Map<string, NodeType>,
): Promise<NodeContext> => {
  const inputResults: NodeExecutionData[][] = [];

  const inputs = node.description.input;

  for (const input of inputs) {
    let fromNode = results.get(input.fromNode);
    if (!fromNode) {
      throw new Error(`Node ${input.fromNode} not found`);
    }

    const inputResult = fromNode[input.fromOutputIndex];
    if (!inputResult) {
      throw new Error(
        `Node ${input.fromNode} output ${input.fromOutputIndex} not found`,
      );
    }

    inputResults.splice(input.toInputIndex, 0, inputResult);
  }

  return {
    getInputData: () => inputResults,
    getNodeParameter(key) {
      return node.description.parameters[key] ?? null;
    },
    helpers: helpers,
    req,
    node,
  };
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
