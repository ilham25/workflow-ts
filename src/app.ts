import express, { type Express } from "express";
import { expressionEngine } from "./engine/src/expressions/engine.js";
import workflowsRouter from "./routes/workflows.js";
import cors from "cors";

const app: Express = express();

app.use(cors());
app.use(express.json());

app.use("/workflows", workflowsRouter);

app.post("/input", async (_req, res) => {
  const expression = _req.query["expression"] as string;
  const body = _req.body;
  if (!expression) {
    return res.status(400).json({ message: "Missing expression" });
  }

  const result = await expressionEngine(body, expression);

  res.json({
    expression,
    result,
  });
});

export default app;
