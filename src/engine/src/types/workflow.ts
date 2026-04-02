import type { BaseNodeParameters } from "../nodes/types/index.js";
import type { NodeTypes } from "./node-type.js";

export interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  connections: Record<string, WorkflowNodeConnection[]>;
}

export interface WorkflowNode {
  id: string;
  name: string;
  type: NodeTypes;
  parameters: BaseNodeParameters;
}

export interface WorkflowNodeConnection {
  node: string;
  outputIndex: number;
}
