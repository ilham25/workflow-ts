import express, { type Express } from "express";
import fs from "fs/promises";
import { main as engineMain } from "./engine/src/engine.js";

const app: Express = express();

app.use(express.json());

app.get("/", async (_req, res) => {
  const workflow = await fs.readFile(
    "src/workflows/workflow-001.json",
    "utf-8",
  );

  await engineMain(JSON.parse(workflow), _req);

  res.json({ message: "Hello, World!", workflow: JSON.parse(workflow) });
});

export default app;
