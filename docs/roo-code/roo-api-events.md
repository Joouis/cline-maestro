# Roo Code API Events

The Roo Code API uses an event-driven architecture to provide real-time updates about task execution, messaging, and system state changes. This document covers all available events and their usage patterns.

## Table of Contents

1. [Event System Overview](#event-system-overview)
2. [RooCodeAPIEvents Interface](#roocodeapievents-interface)
3. [Event Types & Payloads](#event-types--payloads)
4. [Event Lifecycle](#event-lifecycle)
5. [Usage Patterns](#usage-patterns)
6. [Error Handling](#error-handling)

---

## Event System Overview

The Roo Code API extends Node.js EventEmitter to provide a reactive interface for monitoring task execution and system state. All events are strongly typed with TypeScript for compile-time safety.

### Key Concepts

- **Event-driven**: Operations emit events rather than requiring polling
- **Type-safe**: All events and payloads are fully typed
- **Real-time**: Events are emitted immediately when state changes occur
- **Hierarchical**: Events flow from tasks to the main API interface

---

## RooCodeAPIEvents Interface

The main event interface defines all events that can be emitted by the Roo Code API:

```typescript
interface RooCodeAPIEvents {
  // Messaging Events
  message: [
    data: {
      taskId: string;
      action: "created" | "updated";
      message: ClineMessage;
    },
  ];

  // Task Lifecycle Events
  taskCreated: [taskId: string];
  taskStarted: [taskId: string];
  taskModeSwitched: [taskId: string, mode: string];
  taskPaused: [taskId: string];
  taskUnpaused: [taskId: string];
  taskAskResponded: [taskId: string];
  taskAborted: [taskId: string];
  taskSpawned: [parentTaskId: string, childTaskId: string];
  taskCompleted: [taskId: string, tokenUsage: TokenUsage, toolUsage: ToolUsage];

  // Progress & Status Events
  taskTokenUsageUpdated: [taskId: string, tokenUsage: TokenUsage];
  taskToolFailed: [taskId: string, toolName: ToolName, error: string];
}
```

---

## Event Types & Payloads

### Messaging Events

#### `message`

Emitted when a new message is created or an existing message is updated.

**Payload:**

```typescript
{
  taskId: string; // Task that generated the message
  action: "created" | "updated"; // Whether message is new or updated
  message: ClineMessage; // Complete message object
}
```

**ClineMessage Structure:**

```typescript
interface ClineMessage {
  ts: number; // Timestamp (milliseconds)
  type: "ask" | "say"; // Message type
  ask?: ClineAsk; // Ask type (if applicable)
  say?: ClineSay; // Say type (if applicable)
  text?: string; // Message content - can be plain text or JSON string
  images?: string[]; // Base64 image data URIs
  partial?: boolean; // Whether message is being streamed
  reasoning?: string; // AI reasoning (if available)
  conversationHistoryIndex?: number; // Position in conversation
  checkpoint?: Record<string, unknown>; // Checkpoint data
  progressStatus?: ToolProgressStatus; // Tool execution progress
  contextCondense?: ContextCondense; // Context condensation info
  isProtected?: boolean; // Whether message is protected from deletion
}
```

**Note:** For comprehensive documentation of all possible JSON structures that can appear in the `text` field, see the [Data types of `message.text`](roo-api-tools.md#data-types-of-messagetext) section in the Tools documentation.

#### ClineAsk Types (User Input Requests)

```typescript
type ClineAsk =
  | "followup" // Clarifying questions
  | "command" // Command execution permission
  | "command_output" // Command output access permission
  | "completion_result" // Task completion approval
  | "tool" // Tool usage permission
  | "api_req_failed" // API retry confirmation
  | "resume_task" // Task resumption confirmation
  | "resume_completed_task" // Completed task resumption
  | "mistake_limit_reached" // Error handling guidance
  | "browser_action_launch" // Browser interaction permission
  | "use_mcp_server" // MCP server usage permission
  | "auto_approval_max_req_reached"; // Manual approval after auto-limit
```

#### ClineSay Types (Informational Messages)

```typescript
type ClineSay =
  | "error" // Error messages
  | "api_req_started" // API request initiated
  | "api_req_finished" // API request completed
  | "api_req_retried" // API request retried
  | "api_req_retry_delayed" // API retry delayed
  | "api_req_deleted" // API request cancelled
  | "text" // General text messages
  | "reasoning" // AI reasoning process
  | "completion_result" // Task completion results
  | "user_feedback" // User feedback messages
  | "user_feedback_diff" // Diff-formatted feedback
  | "command_output" // Command execution output
  | "shell_integration_warning" // Shell integration issues
  | "browser_action" // Browser action descriptions
  | "browser_action_result" // Browser action results
  | "mcp_server_request_started" // MCP request initiated
  | "mcp_server_response" // MCP response received
  | "subtask_result" // Subtask completion results
  | "checkpoint_saved" // Checkpoint save notifications
  | "rooignore_error" // .rooignore processing errors
  | "diff_error" // Diff application errors
  | "condense_context" // Context condensation started
  | "condense_context_error" // Context condensation errors
  | "codebase_search_result"; // Codebase search results
```

**Example:**

```typescript
api.on("message", ({ taskId, action, message }) => {
  if (action === "created") {
    console.log(`New message in task ${taskId}:`, message.text);
  } else {
    console.log(`Message updated in task ${taskId}`);
  }
});
```

### Task Lifecycle Events

#### `taskCreated`

Emitted immediately when a new task is created.

**Payload:** `[taskId: string]`

#### `taskStarted`

Emitted when a task begins execution (after creation and initialization).

**Payload:** `[taskId: string]`

#### `taskModeSwitched`

Emitted when a task switches to a different mode (e.g., from 'code' to 'debug').

**Payload:** `[taskId: string, mode: string]`

#### `taskPaused`

Emitted when a task is paused and waiting for user input.

**Payload:** `[taskId: string]`

#### `taskUnpaused`

Emitted when a paused task resumes execution.

**Payload:** `[taskId: string]`

#### `taskAskResponded`

Emitted when the user responds to a task's request for input.

**Payload:** `[taskId: string]`

#### `taskAborted`

Emitted when a task is forcefully terminated or cancelled.

**Payload:** `[taskId: string]`

#### `taskSpawned`

Emitted when a task creates a subtask.

**Payload:** `[parentTaskId: string, childTaskId: string]`

#### `taskCompleted`

Emitted when a task finishes execution successfully.

**Payload:** `[taskId: string, tokenUsage: TokenUsage, toolUsage: ToolUsage]`

**TokenUsage Structure:**

```typescript
interface TokenUsage {
  totalTokensIn: number; // Total input tokens consumed
  totalTokensOut: number; // Total output tokens generated
  totalCacheWrites?: number; // Cache write operations
  totalCacheReads?: number; // Cache read operations
  totalCost: number; // Total cost in USD
  contextTokens: number; // Tokens used for context
}
```

**ToolUsage Structure:**

```typescript
type ToolUsage = Record<
  ToolName,
  {
    attempts: number; // Number of times tool was attempted
    failures: number; // Number of failed attempts
  }
>;
```

### Progress & Status Events

#### `taskTokenUsageUpdated`

Emitted periodically during task execution to report token consumption.

**Payload:** `[taskId: string, tokenUsage: TokenUsage]`

#### `taskToolFailed`

Emitted when a tool execution fails during task processing.

**Payload:** `[taskId: string, toolName: ToolName, error: string]`

**Available Tool Names:**

```typescript
type ToolName =
  | "execute_command"
  | "read_file"
  | "write_to_file"
  | "apply_diff"
  | "insert_content"
  | "search_and_replace"
  | "search_files"
  | "list_files"
  | "list_code_definition_names"
  | "browser_action"
  | "use_mcp_tool"
  | "access_mcp_resource"
  | "ask_followup_question"
  | "attempt_completion"
  | "switch_mode"
  | "new_task"
  | "fetch_instructions"
  | "codebase_search";
```

---

## Event Lifecycle

### Typical Task Event Flow

1. **Task Creation**

   ```
   taskCreated → taskStarted
   ```

2. **Task Execution**

   ```
   taskStarted → message(s) → taskTokenUsageUpdated → ...
   ```

3. **User Interaction** (if needed)

   ```
   message(ask) → taskPaused → taskAskResponded → taskUnpaused
   ```

4. **Task Completion**

   ```
   message(completion_result) → taskCompleted
   ```

5. **Task Abortion** (if cancelled)

   ```
   taskAborted
   ```

6. **Subtask Creation** (if applicable)
   ```
   taskSpawned → taskCreated (for child) → ...
   ```

### Mode Switching Flow

```
taskModeSwitched → message(mode switch explanation) → continued execution
```

### Error Flow

```
taskToolFailed → message(error) → taskPaused (for user decision)
```

---

## Usage Patterns

### Basic Event Monitoring

```typescript
import { RooCodeAPI } from "@roo-code/types";

function setupEventListeners(api: RooCodeAPI) {
  // Monitor task lifecycle
  api.on("taskCreated", (taskId) => {
    console.log(`✅ Task ${taskId} created`);
  });

  api.on("taskStarted", (taskId) => {
    console.log(`🚀 Task ${taskId} started`);
  });

  api.on("taskCompleted", (taskId, tokenUsage, toolUsage) => {
    console.log(`✨ Task ${taskId} completed`, {
      tokens: tokenUsage.totalTokensIn + tokenUsage.totalTokensOut,
      cost: `$${tokenUsage.totalCost.toFixed(4)}`,
      tools: Object.keys(toolUsage).length,
    });
  });

  // Monitor messages
  api.on("message", ({ taskId, action, message }) => {
    if (message.type === "ask") {
      console.log(`❓ Task ${taskId} needs input: ${message.text}`);
    } else if (message.type === "say" && message.say === "completion_result") {
      console.log(`📋 Task ${taskId} result: ${message.text}`);
    }
  });
}
```

### Task Progress Tracking

```typescript
class TaskTracker {
  private tasks = new Map<string, TaskInfo>();

  constructor(private api: RooCodeAPI) {
    this.setupListeners();
  }

  private setupListeners() {
    this.api.on("taskCreated", (taskId) => {
      this.tasks.set(taskId, {
        id: taskId,
        status: "created",
        startTime: Date.now(),
        tokenUsage: {
          totalTokensIn: 0,
          totalTokensOut: 0,
          totalCost: 0,
          contextTokens: 0,
        },
        toolUsage: {},
        messages: [],
      });
    });

    this.api.on("taskStarted", (taskId) => {
      const task = this.tasks.get(taskId);
      if (task) {
        task.status = "running";
        task.startTime = Date.now();
      }
    });

    this.api.on("taskCompleted", (taskId, tokenUsage, toolUsage) => {
      const task = this.tasks.get(taskId);
      if (task) {
        task.status = "completed";
        task.endTime = Date.now();
        task.tokenUsage = tokenUsage;
        task.toolUsage = toolUsage;
      }
    });

    this.api.on("message", ({ taskId, message }) => {
      const task = this.tasks.get(taskId);
      if (task) {
        task.messages.push(message);
      }
    });

    this.api.on("taskTokenUsageUpdated", (taskId, tokenUsage) => {
      const task = this.tasks.get(taskId);
      if (task) {
        task.tokenUsage = tokenUsage;
      }
    });
  }

  getTaskInfo(taskId: string): TaskInfo | undefined {
    return this.tasks.get(taskId);
  }

  getAllTasks(): TaskInfo[] {
    return Array.from(this.tasks.values());
  }

  getRunningTasks(): TaskInfo[] {
    return this.getAllTasks().filter((task) => task.status === "running");
  }
}

interface TaskInfo {
  id: string;
  status: "created" | "running" | "paused" | "completed" | "aborted";
  startTime: number;
  endTime?: number;
  tokenUsage: TokenUsage;
  toolUsage: ToolUsage;
  messages: ClineMessage[];
}
```

### Real-time Cost Monitoring

```typescript
class CostMonitor {
  private totalCost = 0;
  private taskCosts = new Map<string, number>();

  constructor(private api: RooCodeAPI) {
    this.setupListeners();
  }

  private setupListeners() {
    this.api.on("taskTokenUsageUpdated", (taskId, tokenUsage) => {
      const previousCost = this.taskCosts.get(taskId) || 0;
      const newCost = tokenUsage.totalCost;
      const costIncrease = newCost - previousCost;

      this.taskCosts.set(taskId, newCost);
      this.totalCost += costIncrease;

      // Alert if cost threshold exceeded
      if (this.totalCost > 10.0) {
        // $10 threshold
        console.warn(
          `💰 Cost alert: Total spent $${this.totalCost.toFixed(2)}`,
        );
      }
    });

    this.api.on("taskCompleted", (taskId, tokenUsage) => {
      const finalCost = tokenUsage.totalCost;
      console.log(`💰 Task ${taskId} final cost: $${finalCost.toFixed(4)}`);
    });
  }

  getTotalCost(): number {
    return this.totalCost;
  }

  getTaskCost(taskId: string): number {
    return this.taskCosts.get(taskId) || 0;
  }

  reset(): void {
    this.totalCost = 0;
    this.taskCosts.clear();
  }
}
```

### Automatic Task Management

```typescript
class AutoTaskManager {
  private maxConcurrentTasks = 3;
  private activeTasks = new Set<string>();
  private taskQueue: Array<() => Promise<string>> = [];

  constructor(private api: RooCodeAPI) {
    this.setupListeners();
  }

  private setupListeners() {
    this.api.on("taskStarted", (taskId) => {
      this.activeTasks.add(taskId);
    });

    this.api.on("taskCompleted", (taskId) => {
      this.activeTasks.delete(taskId);
      this.processQueue();
    });

    this.api.on("taskAborted", (taskId) => {
      this.activeTasks.delete(taskId);
      this.processQueue();
    });

    // Auto-approve certain operations
    this.api.on("message", ({ taskId, message }) => {
      if (message.type === "ask" && message.ask === "tool") {
        // Auto-approve read-only operations
        if (this.isReadOnlyTool(message.text)) {
          this.api.pressPrimaryButton();
        }
      }
    });
  }

  async queueTask(taskFactory: () => Promise<string>): Promise<string> {
    if (this.activeTasks.size < this.maxConcurrentTasks) {
      return await taskFactory();
    } else {
      return new Promise((resolve, reject) => {
        this.taskQueue.push(async () => {
          try {
            const taskId = await taskFactory();
            resolve(taskId);
            return taskId;
          } catch (error) {
            reject(error);
            throw error;
          }
        });
      });
    }
  }

  private async processQueue(): Promise<void> {
    while (
      this.taskQueue.length > 0 &&
      this.activeTasks.size < this.maxConcurrentTasks
    ) {
      const taskFactory = this.taskQueue.shift();
      if (taskFactory) {
        try {
          await taskFactory();
        } catch (error) {
          console.error("Queued task failed:", error);
        }
      }
    }
  }

  private isReadOnlyTool(text: string | undefined): boolean {
    if (!text) return false;
    return (
      text.includes("read_file") ||
      text.includes("list_files") ||
      text.includes("search_files")
    );
  }
}
```

---

## Error Handling

### Tool Failure Handling

```typescript
api.on("taskToolFailed", (taskId, toolName, error) => {
  console.error(`🔧 Tool ${toolName} failed in task ${taskId}:`, error);

  // Handle specific tool failures
  switch (toolName) {
    case "execute_command":
      console.log("Command execution failed - may need to check permissions");
      break;
    case "write_to_file":
      console.log("File write failed - may need to check file permissions");
      break;
    case "browser_action":
      console.log("Browser action failed - may need to check browser setup");
      break;
    default:
      console.log(`Unknown tool failure: ${toolName}`);
  }
});
```

### Task Error Recovery

```typescript
class TaskErrorRecovery {
  private retryCount = new Map<string, number>();
  private maxRetries = 3;

  constructor(private api: RooCodeAPI) {
    this.setupListeners();
  }

  private setupListeners() {
    this.api.on("taskToolFailed", async (taskId, toolName, error) => {
      const retries = this.retryCount.get(taskId) || 0;

      if (retries < this.maxRetries) {
        this.retryCount.set(taskId, retries + 1);
        console.log(
          `Retrying task ${taskId} (attempt ${retries + 1}/${this.maxRetries})`,
        );

        // Send retry message
        await this.api.sendMessage(
          `The ${toolName} tool failed with error: ${error}. Please try again.`,
        );
      } else {
        console.error(`Task ${taskId} exceeded max retries, aborting`);
        await this.api.cancelCurrentTask();
      }
    });

    this.api.on("taskCompleted", (taskId) => {
      this.retryCount.delete(taskId);
    });

    this.api.on("taskAborted", (taskId) => {
      this.retryCount.delete(taskId);
    });
  }
}
```

### Event Error Handling

```typescript
function setupRobustEventHandling(api: RooCodeAPI) {
  // Wrap all event handlers in try-catch
  const safeOn = <K extends keyof RooCodeAPIEvents>(
    event: K,
    handler: (...args: RooCodeAPIEvents[K]) => void | Promise<void>,
  ) => {
    api.on(event, async (...args) => {
      try {
        await handler(...args);
      } catch (error) {
        console.error(`Error in ${event} handler:`, error);
      }
    });
  };

  // Use safe handlers
  safeOn("taskCreated", (taskId) => {
    // Handler implementation
  });

  safeOn("message", ({ taskId, action, message }) => {
    // Handler implementation
  });
}
```

This event system provides comprehensive monitoring and control over Roo Code task execution, enabling sophisticated automation and user experience enhancements.
