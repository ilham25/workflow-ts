import type { HttpRequestNode } from "../nodes/http-request/types/index.js";
import type { IfNode } from "../nodes/if/types/index.js";
import type { LogNode } from "../nodes/log/types/index.js";
import type { TriggerNode } from "../nodes/trigger/types/index.js";
import type { BaseNodeParameters } from "../nodes/types/index.js";
import type { NodeContext } from "./node-context.js";
import type { NodeExecutionData } from "./node-execution.js";

export interface BaseNodeType {
  description: BaseNodeTypeDescription;
  execute: (ctx: NodeContext) => Promise<NodeExecutionData[][]>;
}

export interface BaseNodeInput {
  fromNode: string;
  fromOutputIndex: number;
}

export interface BaseNodeOutput {
  toNode: string;
  toOutputIndex: number;
}

export interface BaseNodeTypeDescription {
  name: string;
  displayName: string;
  input: BaseNodeInput[];
  output: BaseNodeOutput[];
  parameters: BaseNodeParameters;
}

export type NodeType = TriggerNode | HttpRequestNode | IfNode | LogNode;
export type NodeTypes = NodeType["description"]["type"];
