import type { NodeExecutionData } from "./node-execution.js";

export interface BaseEngineEvent {
  id: string;
}

interface NodeIdleEvent extends BaseEngineEvent {
  status: "idle";
  data: null;
}

interface NodeProcessingEvent extends BaseEngineEvent {
  status: "processing";
  data: null;
}

interface NodeSuccessEvent extends BaseEngineEvent {
  status: "success";
  data: {
    input: NodeExecutionData[][];
    output: NodeExecutionData[][];
  };
}

interface NodeErrorEvent extends BaseEngineEvent {
  status: "error";
  data: {
    error: string;
  };
}

export type NodeEvent = (
  | NodeIdleEvent
  | NodeProcessingEvent
  | NodeSuccessEvent
  | NodeErrorEvent
) & {
  name: "node-event";
};
