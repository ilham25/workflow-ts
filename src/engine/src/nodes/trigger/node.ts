import type { NodeType } from "../../types/node-type.js";
import { getNodeInput, getNodeOutput } from "../../utils/node-helpers.js";
import type {
  BaseNodeParameters,
  WorkflowNodeToNodeType,
} from "../types/index.js";

const execute: NodeType["execute"] = (ctx) => {
  const req = ctx.req;
  const results = [
    [
      {
        json: {
          body: req.body,
          headers: req.headers,
          hostname: req.hostname,
          host: req.host,
          ip: req.ip,
          method: req.method,
          path: req.path,
          protocol: req.protocol,
          query: req.query,
          secure: req.secure,
          url: req.url,
          params: req.params,
          cookies: req.cookies,
          signedCookies: req.signedCookies,
          fresh: req.fresh,
          stale: req.stale,
          originalUrl: req.originalUrl,
        },
      },
    ],
  ];
  return Promise.resolve(results);
};

export const getNode: WorkflowNodeToNodeType = (workflow, node) => {
  const input = getNodeInput(workflow, node);
  const output = getNodeOutput(workflow, node);

  return {
    description: {
      name: node.id,
      displayName: node.name,
      input,
      output,
      parameters: node.parameters as unknown as BaseNodeParameters,
      type: "trigger",
    },
    execute,
  };
};
