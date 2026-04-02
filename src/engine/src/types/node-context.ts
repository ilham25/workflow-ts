import type { NodeExecutionData } from "./node-execution.js";

export interface NodeContext {
  getInputData(): NodeExecutionData[][];
  getNodeParameter(key: string): Record<string, string>;
}
