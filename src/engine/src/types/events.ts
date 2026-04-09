import type { NodeExecutionData } from "./node-execution.js";
import type { NodeType } from "./node-type.js";

export interface BaseEngineEvent {
  id: string;
}

interface NodeIdleEvent extends BaseEngineEvent {
  data: {
    node: NodeType;
    data: null;
    status: "idle";
  };
}

interface NodeProcessingEvent extends BaseEngineEvent {
  data: {
    node: NodeType;
    data: null;
    status: "processing";
  };
}

interface NodeSuccessEvent extends BaseEngineEvent {
  data: {
    status: "success";
    node: NodeType;
    data: {
      input: NodeExecutionData[][];
      output: NodeExecutionData[][];
    };
  };
}

interface NodeErrorEvent extends BaseEngineEvent {
  data: {
    status: "error";
    node: NodeType;
    data: {
      error: string;
    };
  };
}

export type NodeEvent = (
  | NodeIdleEvent
  | NodeProcessingEvent
  | NodeSuccessEvent
  | NodeErrorEvent
) & {
  name: "node:update";
};
