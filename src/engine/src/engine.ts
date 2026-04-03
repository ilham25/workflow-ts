import type { Request } from "express";
import { nodes } from "./nodes/index.js";
import type { NodeContext } from "./types/node-context.js";
import type { NodeExecutionData } from "./types/node-execution.js";
import type { NodeType } from "./types/node-type.js";
import type { Workflow } from "./types/workflow.js";
import { helpers } from "./utils/helpers.js";

export async function main(json: Workflow, req: Request) {
  const pipeline = workflowToNodeTypes(json);

  const results = new Map<string, NodeExecutionData[][]>();
  const queue: NodeType[] = [];
  const triggerNode = pipeline.find(
    (node) => node.description.type === "trigger",
  );
  if (!triggerNode) {
    throw new Error("No trigger node found");
  }

  const nodeMap = pipeline.reduce((acc, node) => {
    acc.set(node.description.name, node);
    return acc;
  }, new Map<string, NodeType>());

  queue.push(triggerNode, ...getQueue(nodeMap, triggerNode));

  console.log(
    "queue",
    JSON.stringify(
      queue.map((node) => node.description.name),
      null,
      2,
    ),
  );

  // while (queue.length) {
  //   const node = queue.shift()!;
  //   const input = collectInputs(node, results, req);
  //   const output = await node.execute(input);
  //   results.set(node.description.name, output);
  // }
}

const collectInputs = (
  node: NodeType,
  results: Map<string, NodeExecutionData[][]>,
  req: Request,
): NodeContext => {
  const input = node.description.input;

  const rawInputResults = input
    .map((input) => {
      return results.get(input.fromNode)!;
    })
    .flat(1);

  let inputResults: NodeExecutionData[][] = [];

  if (node.description.type === "trigger") {
    inputResults = [
      [
        {
          json: {
            body: req.body,
            headers: req.headers,
            hostname: req.hostname,
            host: req.host,
            ip: req.ip,
            method: req.method,
            path: req.path,
            protocol: req.protocol,
            query: req.query,
            secure: req.secure,
            url: req.url,
            params: req.params,
            cookies: req.cookies,
            signedCookies: req.signedCookies,
            fresh: req.fresh,
            stale: req.stale,
            originalUrl: req.originalUrl,
          },
        },
      ],
    ];
  }

  node.description.input.forEach((input, index) => {
    inputResults.push(rawInputResults[input.fromOutputIndex] ?? []);
  });

  return {
    getInputData: () => inputResults,
    getNodeParameter(key) {
      return node.description.parameters[key] ?? null;
    },
    helpers: helpers,
  };
};

function workflowToNodeTypes(workflow: Workflow): NodeType[] {
  return workflow.nodes.map((node) => nodes[node.type](workflow, node));
}

function getQueue(
  nodeMap: Map<string, NodeType>,
  currentNode: NodeType,
): NodeType[] {
  const queue: NodeType[] = [];

  currentNode.description.output.forEach((output) => {
    const node = nodeMap.get(output.toNode)!;
    queue.push(node, ...getQueue(nodeMap, node));
  });

  return queue;
}
