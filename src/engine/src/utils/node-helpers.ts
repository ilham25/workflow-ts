import type { BaseNodeInput, BaseNodeOutput } from "../types/node-type.js";
import type { Workflow, WorkflowNode } from "../types/workflow.js";

export const getNodeInput = (
  workflow: Workflow,
  node: WorkflowNode,
): BaseNodeInput[] => {
  return Object.entries(workflow.connections)
    .filter(([key, value]) => {
      return value.find((connection) => connection.node === node.id);
    })
    .map(([key, value]) => {
      const inputNodeConnection = value.find(
        (connection) => connection.node === node.id,
      )!;
      return {
        fromNode: key,
        fromOutputIndex: inputNodeConnection.outputIndex,
      };
    });
};

export const getNodeOutput = (
  workflow: Workflow,
  node: WorkflowNode,
): BaseNodeOutput[] => {
  if (!workflow.connections[node.id]) {
    return [];
  }

  return workflow.connections[node.id]!.map((connection) => {
    return {
      toNode: connection.node,
      toOutputIndex: connection.outputIndex,
    };
  });
};
