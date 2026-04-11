import type { NodeType } from "../types/node-type.js";
import chalk from "chalk";
import type { Workflow } from "../types/workflow.js";
import { nodes } from "../nodes/index.js";

const log = console.log;

export const helpers = {
  request: fetch,
};

export async function getWorkflowQueue(json: Workflow) {
  const pipelines = workflowToNodeTypes(json);
  const queue: NodeType[] = [];
  const nodeMap = pipelines.reduce((acc, node) => {
    acc.set(node.description.name, node);
    return acc;
  }, new Map<string, NodeType>());
  const dependencies: Map<string, string[]> = new Map();

  log(chalk.bgBlue(" Current Pipeline Order "));
  for (const pipeline of pipelines) {
    log(pipeline.description.name);
    dependencies.set(
      pipeline.description.name,
      pipeline.description.input.map((i) => i.fromNode),
    );
  }
  log("\n");
  log(chalk.bgGreen(" Start Kahn's Algorithm "));

  while (true) {
    if (queue.length >= pipelines.length) break;
    log(chalk.yellow("Checking dependencies update"));
    for (const [key, degrees] of dependencies) {
      if (degrees.length) {
        log(
          chalk.italic.dim(
            `${key} has dependencies: ${degrees.join(",")}. Skipping...`,
          ),
        );
        continue;
      }
      log(chalk.bold.green(`${key} has no dependencies, adding to queue`));
      queue.push(nodeMap.get(key)!);

      log(`Removing dependency of other nodes to ${key}`);
      dependencies.delete(key);
      dependencies.forEach((_degrees, _key, map) => {
        map.set(
          _key,
          _degrees.filter((deg) => deg != key),
        );
      });
    }
  }
  log(chalk.bgGreen(" Kahn's Algorithm End "));
  log("\n");
  log(chalk.bgBlue(" Final Queue "));
  for (const node of queue) {
    log(node.description.name);
  }
  log("\n");

  return { queue };
}

export function workflowToNodeTypes(workflow: Workflow): NodeType[] {
  return workflow.nodes.map((node) => nodes[node.type](workflow, node));
}
