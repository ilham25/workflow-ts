import type { Request } from "express";
import { nodes } from "./nodes/index.js";
import type { NodeContext } from "./types/node-context.js";
import type { NodeExecutionData } from "./types/node-execution.js";
import type { NodeType } from "./types/node-type.js";
import type { Workflow } from "./types/workflow.js";
import { helpers } from "./utils/helpers.js";

export async function main(json: Workflow, req: Request) {
  const pipeline = workflowToNodeTypes(json);

  const triggerNode = pipeline.find(
    (node) => node.description.type === "trigger",
  );
  if (!triggerNode) {
    throw new Error("No trigger node found");
  }

  const { queue, results } = await getKahnQueue(pipeline, req);

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
): Promise<NodeExecutionData[][]> => {
  const input = await collectInputs(node, results, req, nodeMap);

  const output = await node.execute(input);
  return output;
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

async function getKahnQueue(pipelines: NodeType[], req: Request) {
  const nodeMap = pipelines.reduce((acc, node) => {
    acc.set(node.description.name, node);
    return acc;
  }, new Map<string, NodeType>());

  const topologicalOrder: NodeType[] = [];
  const results = new Map<string, NodeExecutionData[][]>();

  const dependencies: Map<string, string[]> = new Map();

  for (const pipeline of pipelines) {
    dependencies.set(
      pipeline.description.name,
      pipeline.description.input.map((i) => i.fromNode),
    );
  }

  while (true) {
    if (topologicalOrder.length >= pipelines.length) break;

    for (const [key, degrees] of dependencies) {
      if (degrees.length) continue;
      topologicalOrder.push(nodeMap.get(key)!);

      dependencies.delete(key);
      dependencies.forEach((_degrees, _key, map) => {
        map.set(
          _key,
          _degrees.filter((deg) => deg != key),
        );
      });
    }
  }

  for (const node of topologicalOrder) {
    const output = await processNode(node, results, req, nodeMap);
    results.set(node.description.name, output);
  }

  return { queue: topologicalOrder, results };
}
