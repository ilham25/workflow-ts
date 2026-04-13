import type { NodeTypes } from "../types/node-type.js";
import { getNode as getHttpRequestNode } from "./http-request/node.js";
import { getNode as getIfNode } from "./if/node.js";
import { getNode as getLogNode } from "./log/node.js";
import { getNode as getMergeNode } from "./merge/node.js";
import { getNode as getTriggerNode } from "./trigger/node.js";
import type { WorkflowNodeToNodeType } from "./types/index.js";

export const nodeRegistry: Record<NodeTypes, WorkflowNodeToNodeType> = {
  trigger: getTriggerNode,
  httpRequest: getHttpRequestNode,
  if: getIfNode,
  log: getLogNode,
  merge: getMergeNode,
};
