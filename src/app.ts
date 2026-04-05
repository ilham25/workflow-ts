import express, { type Express } from "express";
import fs from "fs/promises";
import { main as engineMain } from "./engine/src/engine.js";

const app: Express = express();

app.use(express.json());

app.get("/", async (_req, res) => {
  const workflowId = _req.query["workflowId"];
  if (!workflowId) {
    return res.status(400).json({ message: "Missing workflow id" });
  }
  const workflow = await fs.readFile(
    `src/workflows/${workflowId}.json`,
    "utf-8",
  );

  const result = await engineMain(JSON.parse(workflow), _req);

  res.json({
    message: "Hello, World!",
    result,
    workflow: JSON.parse(workflow),
  });
});

export default app;
