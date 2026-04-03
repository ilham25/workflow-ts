import type { helpers } from "../utils/helpers.js";
import type { NodeExecutionData } from "./node-execution.js";

export interface NodeContext {
  getInputData(): NodeExecutionData[][];
  getNodeParameter(key: string): string | null | boolean | number;
  helpers: typeof helpers;
}
