import { nodes } from "./nodes/index.js";
import type { NodeType } from "./types/node-type.js";
import type { Workflow } from "./types/workflow.js";

export async function main(json: Workflow) {
  const nodes = workflowToNodeTypes(json);
  console.log(JSON.stringify(nodes, null, 2));
}

function workflowToNodeTypes(workflow: Workflow): NodeType[] {
  return workflow.nodes.map((node) => nodes[node.type](workflow, node));
}
