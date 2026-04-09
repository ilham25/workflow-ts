import { Router } from "express";
import fs from "fs/promises";
import { main as engineMain } from "../engine/src/engine.js";
import { sseMap } from "../stores/sse-store.js";
import type { NodeEvent } from "../engine/src/types/events.js";

const router: Router = Router();

router.get(`/:id`, async (req, res) => {
  const workflowId = req.params.id;
  if (!workflowId) {
    return res.status(400).json({ message: "Missing workflow id" });
  }

  const workflow = await fs.readFile(
    `src/workflows/${workflowId}.json`,
    "utf-8",
  );

  res.json({
    data: JSON.parse(workflow),
  });
});

router.post("/execute", async (req, res) => {
  const { jobId }: { jobId: string } = req.body;
  if (!jobId) {
    return res.status(400).json({ message: "Missing job id" });
  }

  const workflowId = req.query["workflowId"];
  if (!workflowId) {
    return res.status(400).json({ message: "Missing workflow id" });
  }

  res.json({ jobId });

  const workflow = await fs.readFile(
    `src/workflows/${workflowId}.json`,
    "utf-8",
  );

  await engineMain(JSON.parse(workflow), req, (event) => {
    pushEvent(jobId, event);
  });

  //   res.json({
  //     result,
  //     workflow: JSON.parse(workflow),
  //   });
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
  sseRes.write(`status: ${event.status}\n`);
  sseRes.write(`data: ${JSON.stringify(event.data)}\n\n`);
}

export default router;
