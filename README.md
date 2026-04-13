# workflow-ts

A workflow automation engine built with TypeScript and Express. Executes workflows defined as JSON graphs using a DAG (Directed Acyclic Graph) model with real-time event streaming via SSE.

## Demo UI

[ilham25/workflow-ts-playground](https://github.com/ilham25/workflow-ts-playground) is the companion UI for demoing and presenting this engine.

## Prerequisites

- Node.js (ES2022+)
- pnpm

## Setup

```bash
pnpm install
```

## Running

```bash
# Development (auto-reload)
pnpm dev

# Production
pnpm build
pnpm start
```

Server starts on `http://localhost:3000` (override with `PORT` env var).

## API

### Execute a workflow

```bash
POST /workflows/execute
Content-Type: application/json

{
  "jobId": "job-123",
  "workflowId": "workflow-001"
}
```

### Stream execution events (SSE)

```bash
GET /workflows/track/:jobId
```

Returns a Server-Sent Events stream. Each event has the shape:

```json
{
  "nodeId": "node-2",
  "nodeName": "Fetch User",
  "status": "success",
  "output": { ... }
}
```

### Inspect a workflow

```bash
GET /workflows/:id
```

Returns the workflow definition and its computed execution queue.

### Evaluate an expression

```bash
POST /input?expression={{ $json.name }}
Content-Type: application/json

{ "name": "Alice" }
```

## Workflow definition

Workflows live in [src/workflows/](src/workflows/) as JSON files. Each workflow has a list of nodes and a connections map.

```json
{
  "id": "workflow-001",
  "name": "User Status Check",
  "nodes": [
    { "id": "node-1", "name": "Webhook Trigger", "type": "trigger", "parameters": {} },
    { "id": "node-2", "name": "Fetch User", "type": "httpRequest",
      "parameters": { "url": "https://jsonplaceholder.typicode.com/users/1", "method": "GET" } },
    { "id": "node-3", "name": "Check Active", "type": "if",
      "parameters": { "condition": "{{ $json.id > 0 }}" } },
    { "id": "node-4", "name": "Log Active", "type": "log",
      "parameters": { "message": "{{ $json.name }} is active" } }
  ],
  "connections": {
    "node-1": [{ "node": "node-2", "outputIndex": 0 }],
    "node-2": [{ "node": "node-3", "outputIndex": 0 }],
    "node-3": [
      { "node": "node-4", "outputIndex": 0 },
      { "node": "node-5", "outputIndex": 1 }
    ]
  }
}
```

### Node types

| Type | Description |
|---|---|
| `trigger` | Entry point — receives the initial request payload |
| `httpRequest` | Makes an HTTP request; supports `{{ }}` expressions in `url` |
| `if` | Evaluates a condition; routes to `outputIndex: 0` (true) or `outputIndex: 1` (false) |
| `merge` | Waits for multiple upstream nodes and merges their outputs |
| `log` | Logs a message; supports `{{ }}` expressions |

### Expressions

Parameters support `{{ $json.<field> }}` template syntax evaluated against the previous node's output.

```
{{ $json.name }}          // string field
{{ $json.id > 0 }}        // boolean expression
{{ $json.items.length }}  // nested access
```

## Project structure

```
src/
├── index.ts                  # Server entry point
├── app.ts                    # Express app & routes
├── engine/src/
│   ├── engine.ts             # Workflow executor
│   ├── expressions/engine.ts # Template expression evaluator
│   ├── nodes/                # Node implementations
│   ├── types/                # Core type definitions
│   └── utils/
│       ├── helpers.ts        # Topological sort (Kahn's Algorithm)
│       └── node-helpers.ts   # Input/output utilities
├── routes/workflows.ts       # HTTP route handlers
├── stores/sse-store.ts       # SSE connection registry
└── workflows/                # Workflow JSON definitions
```
