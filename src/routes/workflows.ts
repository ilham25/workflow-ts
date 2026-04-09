import { Router } from "express";
import fs from "fs/promises";
import { main as engineMain } from "../engine/src/engine.js";
import { sseMap } from "../stores/sse-store.js";
import type { NodeEvent } from "../engine/src/types/events.js";
import { getWorkflowQueue } from "../engine/src/utils/helpers.js";
import type { Workflow, WorkflowNode } from "../engine/src/types/workflow.js";

const router: Router = Router();

router.get(`/:id`, async (req, res) => {
  const workflowId = req.params.id;
  if (!workflowId) {
    return res.status(400).json({ message: "Missing workflow id" });
  }

  const rawWorkflow = await fs.readFile(
    `src/workflows/${workflowId}.json`,
    "utf-8",
  );
  const workflow: Workflow = JSON.parse(rawWorkflow);
  const { queue } = await getWorkflowQueue(workflow);
  const queueIds = queue.map((item) => item.description.name);

  const workflowNodeMap = workflow.nodes.reduce((acc, node) => {
    acc.set(node.id, node);
    return acc;
  }, new Map<string, WorkflowNode>());

  res.json({
    data: {
      ...workflow,
      nodes: queueIds.map((nodeId) => workflowNodeMap.get(nodeId)!),
    },
  });
});

router.post("/execute", async (req, res) => {
  const { jobId, workflowId }: { jobId: string; workflowId: string } = req.body;
  if (!jobId) {
    return res.status(400).json({ message: "Missing job id" });
  }
  if (!workflowId) {
    return res.status(400).json({ message: "Missing workflow id" });
  }

  res.json({ data: { jobId } });

  const workflow = await fs.readFile(
    `src/workflows/${workflowId}.json`,
    "utf-8",
  );

  await engineMain(JSON.parse(workflow), req, (event) => {
    pushEvent(jobId, event);
  });
});

router.get("/track/:jobId", (req, res) => {
  const { jobId } = req.params;

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Register this connection
  sseMap.set(jobId, res);

  // Cleanup on disconnect
  req.on("close", () => {
    sseMap.delete(jobId);
  });
});

function pushEvent(jobId: string, event: NodeEvent) {
  const sseRes = sseMap.get(jobId);
  if (!sseRes) return;

  sseRes.write(`event: ${event.name}\n`);
  sseRes.write(`data: ${JSON.stringify(event.data)}\n\n`);
}

export default router;
