import type { Request } from "express";
import type { helpers } from "../utils/helpers.js";
import type { NodeExecutionData } from "./node-execution.js";
import type { NodeType } from "./node-type.js";

export interface NodeContext {
  getInputData(): NodeExecutionData[][];
  getNodeParameter(key: string): string | null | boolean | number;
  helpers: typeof helpers;
  req: Request;
  node: NodeType;
}
