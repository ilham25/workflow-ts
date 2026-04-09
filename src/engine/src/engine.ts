import type { Request } from "express";
import { nodes } from "./nodes/index.js";
import type { NodeContext } from "./types/node-context.js";
import type { NodeExecutionData } from "./types/node-execution.js";
import type { NodeType } from "./types/node-type.js";
import type { Workflow } from "./types/workflow.js";
import { helpers } from "./utils/helpers.js";
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
  const nodeMap = pipeline.reduce((acc, node) => {
    acc.set(node.description.name, node);
    return acc;
  }, new Map<string, NodeType>());

  const { queue } = await getQueue(pipeline, nodeMap);

  log(chalk.bgGreen(" Processing Queue "));
  for (const node of queue) {
    onEvent({
      name: "node-event",
      status: "idle",
      data: null,
      id: String(+new Date()),
    });
  }
  for (const node of queue) {
    onEvent({
      name: "node-event",
      status: "processing",
      data: null,
      id: String(+new Date()),
    });
    try {
      const { output, input } = await processNode(node, results, req, nodeMap);

      results.set(node.description.name, output);
      log(`${node.description.name} done.`);
      onEvent({
        name: "node-event",
        status: "success",
        data: {
          input: input.getInputData(),
          output,
        },
        id: String(+new Date()),
      });
    } catch (error) {
      log(chalk.bgRed(`${node.description.name} failed.`));
      onEvent({
        name: "node-event",
        status: "error",
        data: {
          error: String(error),
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

function workflowToNodeTypes(workflow: Workflow): NodeType[] {
  return workflow.nodes.map((node) => nodes[node.type](workflow, node));
}

async function getQueue(pipelines: NodeType[], nodeMap: Map<string, NodeType>) {
  const queue: NodeType[] = [];

  const dependencies: Map<string, string[]> = new Map();

  log(chalk.bgBlue(" Current Pipeline Order "));
  for (const pipeline of pipelines) {
    log(pipeline.description.name);
    dependencies.set(
      pipeline.description.name,
      pipeline.description.input.map((i) => i.fromNode),
    );
  }
  log("\n");
  log(chalk.bgGreen(" Start Kahn's Algorithm "));

  while (true) {
    if (queue.length >= pipelines.length) break;
    log(chalk.yellow("Checking dependencies update"));
    for (const [key, degrees] of dependencies) {
      if (degrees.length) {
        log(
          chalk.italic.dim(
            `${key} has dependencies: ${degrees.join(",")}. Skipping...`,
          ),
        );
        continue;
      }
      log(chalk.bold.green(`${key} has no dependencies, adding to queue`));
      queue.push(nodeMap.get(key)!);

      log(`Removing dependency of other nodes to ${key}`);
      dependencies.delete(key);
      dependencies.forEach((_degrees, _key, map) => {
        map.set(
          _key,
          _degrees.filter((deg) => deg != key),
        );
      });
    }
  }
  log(chalk.bgGreen(" Kahn's Algorithm End "));
  log("\n");
  log(chalk.bgBlue(" Final Queue "));
  for (const node of queue) {
    log(node.description.name);
  }
  log("\n");

  return { queue };
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
