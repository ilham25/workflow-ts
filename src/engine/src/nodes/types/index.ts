import type { NodeType } from "../../types/node-type.js";
import type { Workflow, WorkflowNode } from "../../types/workflow.js";

export type WorkflowNodeToNodeType = (
  workflow: Workflow,
  node: WorkflowNode,
) => NodeType;

export type BaseNodeParameters = Record<
  string,
  string | number | boolean | null
>;
