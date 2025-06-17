# RooRoutes Server-Sent Events (SSE) Documentation

## Introduction

The RooRoutes API provides real-time communication through Server-Sent Events (SSE) to deliver live updates during task execution. These events enable client applications to receive immediate feedback about task progress, completion status, errors, and other important state changes without polling.

SSE streams are established when creating new tasks or sending messages to existing tasks, providing a persistent connection for receiving updates until the task completes or the stream is explicitly closed.

## Visual Workflow Overview

![Workflow Diagram](https://media.githubusercontent.com/media/Joouis/agent-maestro/main/assets/demo-workflow.png)

The workflow diagram above illustrates the high-level task creation and conversation flow that generates the SSE events documented below. This visual representation shows how user interactions trigger task creation, message exchanges, and the overall lifecycle that produces the various event types. The diagram complements the detailed SSE event documentation by providing context for when and why each event occurs during the task execution process.

The workflow demonstrates the relationship between user actions (creating tasks, sending messages) and the corresponding SSE events that flow back to the client, showing how the events fit into the broader task management and communication system.

## Event Overview

The RooRoutes API emits 8 distinct event types that cover the complete lifecycle of task execution:

| Event Type                          | Purpose                                     | Stream Behavior     |
| ----------------------------------- | ------------------------------------------- | ------------------- |
| [`TASK_CREATED`](#task_created)     | Confirms successful task creation           | Continues streaming |
| [`TASK_RESUMED`](#task_resumed)     | Indicates task resumption from history      | Continues streaming |
| [`MESSAGE`](#message)               | Real-time task progress and agent responses | Continues streaming |
| [`TASK_COMPLETED`](#task_completed) | Task finished successfully with usage stats | **Closes stream**   |
| [`TASK_ABORTED`](#task_aborted)     | Task was cancelled or aborted               | **Closes stream**   |
| [`TOOL_FAILED`](#tool_failed)       | Tool execution encountered an error         | Continues streaming |
| [`ERROR`](#error)                   | General error during task processing        | **Closes stream**   |
| [`STREAM_CLOSED`](#stream_closed)   | Stream closure notification with reason     | **Closes stream**   |

## Event Reference

### `TASK_CREATED`

**Enum Value:** `SSEEventType.TASK_CREATED = "task_created"`

**Triggered when:** A new task is successfully created and started.

**Interface:**

```typescript
{
  taskId: string; // Unique identifier for the created task
  status: "created"; // Status indicator
  message: string; // Human-readable confirmation message
}
```

**Usage Scenarios:**

- Confirming task creation to users
- Storing task ID for future reference
- Initializing progress tracking UI

---

### `TASK_RESUMED`

**Enum Value:** `SSEEventType.TASK_RESUMED = "task_resumed"`

**Triggered when:** An existing task from history is resumed and reactivated.

**Interface:**

```typescript
{
  taskId: string; // ID of the resumed task
  status: "resumed"; // Status indicator
  message: string; // Human-readable confirmation message
}
```

**Usage Scenarios:**

- Continuing work on previously paused tasks
- Restoring task context in the UI
- Notifying users of successful task reactivation

---

### `MESSAGE`

**Enum Value:** `SSEEventType.MESSAGE = "message"`

**Triggered when:** The AI agent generates responses, progress updates, or asks questions during task execution.

**Interface:**

```typescript
{
  taskId: string; // Associated task identifier
  message: object; // Complex message structure from @roo-code/types
}
```

**Note:** The `message` field structure is defined in the [`@roo-code/types`](https://www.npmjs.com/package/@roo-code/types) package as it contains complex agent response data that is proxied directly to clients.

**Usage Scenarios:**

- Displaying real-time agent responses
- Implementing typewriter-style text streaming
- Handling follow-up questions with suggested responses
- Managing MCP server tool requests

---

### `TASK_COMPLETED`

**Enum Value:** `SSEEventType.TASK_COMPLETED = "task_completed"`

**Triggered when:** A task finishes successfully with all objectives completed.

**Interface:**

```typescript
{
  taskId: string;           // Completed task identifier
  tokenUsage: {             // Token consumption statistics
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  toolUsage: {              // Tool usage statistics
    [toolName: string]: number;
  };
}
```

**Stream Behavior:** This event triggers automatic stream closure with reason `"task_completed"`.

**Usage Scenarios:**

- Displaying completion confirmation to users
- Showing resource usage statistics
- Updating task history records
- Enabling new task creation

---

### `TASK_ABORTED`

**Enum Value:** `SSEEventType.TASK_ABORTED = "task_aborted"`

**Triggered when:** A task is cancelled, manually stopped, or aborted due to conditions.

**Interface:**

```typescript
{
  taskId: string; // Aborted task identifier
}
```

**Stream Behavior:** This event triggers automatic stream closure with reason `"task_aborted"`.

**Usage Scenarios:**

- Notifying users of task cancellation
- Cleaning up UI state
- Logging aborted tasks for analytics
- Allowing task restart options

---

### `TOOL_FAILED`

**Enum Value:** `SSEEventType.TOOL_FAILED = "tool_failed"`

**Triggered when:** A specific tool execution fails during task processing.

**Interface:**

```typescript
{
  taskId: string; // Associated task identifier
  tool: string; // Name of the failed tool
  error: string; // Error description
}
```

**Usage Scenarios:**

- Displaying specific tool errors to users
- Implementing retry mechanisms
- Debugging task execution issues
- Logging tool failure analytics

---

### `ERROR`

**Enum Value:** `SSEEventType.ERROR = "error"`

**Triggered when:** General errors occur during task processing that prevent continuation.

**Interface:**

```typescript
{
  error: string; // Error description
}
```

**Stream Behavior:** This event triggers immediate stream closure.

**Usage Scenarios:**

- Displaying critical error messages
- Implementing error recovery flows
- Logging system errors
- Providing user feedback for resolution

---

### `STREAM_CLOSED`

**Enum Value:** `SSEEventType.STREAM_CLOSED = "stream_closed"`

**Triggered when:** The SSE stream is about to close, providing closure reason.

**Interface:**

```typescript
{
  message: string; // Reason for stream closure
}
```

**Usage Scenarios:**

- Understanding why streams closed
- Implementing appropriate UI transitions
- Debugging connection issues
- Analytics and monitoring

## Event Flow Diagrams

### New Task Creation Flow

```
Client                         Proxy Server                         AI Agent (Roo)
  |                                 |                                     |
  | POST /roo/task                  |                                     |
  |-------------------------------->|                                     |
  |                                 | Start task processing               |
  |                                 |------------------------------------>|
  |                                 | SSE: TASK_CREATED                   |
  |<--------------------------------|                                     |
  |                                 |                                     |
  |                                 | SSE: MESSAGE (partial)              |
  |<--------------------------------|<------------------------------------|
  |                                 | SSE: MESSAGE (partial)              |
  |<--------------------------------|<------------------------------------|
  |                                 | SSE: MESSAGE (complete)             |
  |<--------------------------------|<------------------------------------|
  |                                 |                                     |
  |                                 | SSE: TASK_COMPLETED                 |
  |<--------------------------------|<------------------------------------|
  |                                 | SSE: STREAM_CLOSED                  |
  |<--------------------------------|                                     |
  | Connection closed               |                                     |
```

### Send Message Flow

```
Client                         Proxy Server                         AI Agent (Roo)
  |                                 |                                     |
  | POST /roo/task/{id}/message     |                                     |
  |-------------------------------->|                                     |
  |                                 | Check task in history               |
  |                                 | Resume task if needed               |
  |                                 |------------------------------------>|
  |                                 | SSE: TASK_RESUMED                   |
  |<--------------------------------|                                     |
  |                                 | Process new message                 |
  |                                 | SSE: MESSAGE...                     |
  |<--------------------------------|<------------------------------------|
```

### Error Handling Flow

```
Client                         Proxy Server                         AI Agent (Roo)
  |                                 |                                     |
  | POST /roo/task                  |                                     |
  |-------------------------------->|                                     |
  |                                 | Start task processing               |
  |                                 |------------------------------------>|
  |                                 | SSE: TASK_CREATED                   |
  |<--------------------------------|                                     |
  |                                 | Processing error occurs             |
  |                                 |                              X      |
  |                                 | SSE: TOOL_FAILED                    |
  |<--------------------------------|                                     |
  |                                 | Critical error occurs               |
  |                                 | SSE: ERROR                          |
  |<--------------------------------|                                     |
  |                                 | SSE: STREAM_CLOSED                  |
  |<--------------------------------|                                     |
```

---

**Note:** This documentation is based on the [`SSEEventType`](../src/server/routes/rooRoutes.ts:8) enum and implementation in the RooRoutes codebase. Always refer to the latest source code for the most up-to-date event structures and behaviors.
