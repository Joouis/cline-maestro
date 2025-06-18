# RooCode API Event System

Comprehensive documentation for the RooCode API event system, covering all events, their payloads, and usage patterns.

## Table of Contents

1. [Overview](#overview)
2. [Event Interface](#event-interface)
3. [Task Lifecycle Events](#task-lifecycle-events)
4. [Message Events](#message-events)
5. [Token Usage Events](#token-usage-events)
6. [Tool Events](#tool-events)
7. [IPC Events](#ipc-events)
8. [Event Patterns](#event-patterns)
9. [Usage Examples](#usage-examples)

---

## Overview

The RooCode API uses an event-driven architecture to provide real-time notifications about task lifecycle, system state changes, and user interactions. The event system is built on Node.js EventEmitter and provides strongly typed event definitions.

### Key Benefits

- **Real-time Monitoring**: Track task progress and system state in real-time
- **Loose Coupling**: Decouple application logic from RooCode internals
- **Extensibility**: Easy to add new event handlers for custom functionality
- **Type Safety**: Strongly typed event payloads with TypeScript support

---

## Event Interface

### RooCodeAPIEvents

The main event interface defining all available events and their payload types:

```typescript
interface RooCodeAPIEvents {
  message: [
    data: {
      taskId: string;
      action: "created" | "updated";
      message: ClineMessage;
    },
  ];
  taskCreated: [taskId: string];
  taskStarted: [taskId: string];
  taskModeSwitched: [taskId: string, mode: string];
  taskPaused: [taskId: string];
  taskUnpaused: [taskId: string];
  taskAskResponded: [taskId: string];
  taskAborted: [taskId: string];
  taskSpawned: [parentTaskId: string, childTaskId: string];
  taskCompleted: [taskId: string, tokenUsage: TokenUsage, toolUsage: ToolUsage];
  taskTokenUsageUpdated: [taskId: string, tokenUsage: TokenUsage];
  taskToolFailed: [taskId: string, toolName: ToolName, error: string];
}
```

### Event Usage Pattern

```typescript
import { RooCodeAPI } from "@roo-code/types";

const api: RooCodeAPI = getRooCodeAPI();

// Type-safe event handlers
api.on("taskCompleted", (taskId, tokenUsage, toolUsage) => {
  // Handler receives strongly typed parameters
  console.log(`Task ${taskId} completed with cost $${tokenUsage.totalCost}`);
});
```

---

## Task Lifecycle Events

### taskCreated

Fired when a new task is created but before execution begins.

**Payload**: `[taskId: string]`

```typescript
api.on("taskCreated", (taskId) => {
  console.log(`New task created: ${taskId}`);
  // Initialize task tracking, UI updates, etc.
});
```

**Use Cases**:

- Initialize task tracking data
- Update UI to show new task
- Set up task-specific logging
- Notify external systems

### taskStarted

Fired when a task begins execution (after any initial setup).

**Payload**: `[taskId: string]`

```typescript
api.on("taskStarted", (taskId) => {
  console.log(`Task execution started: ${taskId}`);
  startTaskTimer(taskId);
});
```

**Use Cases**:

- Start performance timers
- Begin resource monitoring
- Update task status indicators
- Log task start time

### taskModeSwitched

Fired when a task switches to a different AI mode.

**Payload**: `[taskId: string, mode: string]`

```typescript
api.on("taskModeSwitched", (taskId, mode) => {
  console.log(`Task ${taskId} switched to mode: ${mode}`);
  updateUIMode(mode);
});
```

**Use Cases**:

- Update UI to reflect new mode
- Log mode changes
- Adjust tool availability
- Notify mode-specific handlers

### taskPaused

Fired when task execution is paused (waiting for user input).

**Payload**: `[taskId: string]`

```typescript
api.on("taskPaused", (taskId) => {
  console.log(`Task paused: ${taskId}`);
  showUserInteractionRequired(taskId);
});
```

**Use Cases**:

- Show user interaction required indicators
- Pause resource monitoring
- Update task status
- Trigger notifications

### taskUnpaused

Fired when task execution resumes after being paused.

**Payload**: `[taskId: string]`

```typescript
api.on("taskUnpaused", (taskId) => {
  console.log(`Task resumed: ${taskId}`);
  hideUserInteractionRequired(taskId);
});
```

**Use Cases**:

- Hide user interaction indicators
- Resume resource monitoring
- Update task status
- Log resume time

### taskAskResponded

Fired when user responds to a task's question or request.

**Payload**: `[taskId: string]`

```typescript
api.on("taskAskResponded", (taskId) => {
  console.log(`User responded to task: ${taskId}`);
  logUserInteraction(taskId);
});
```

**Use Cases**:

- Log user interactions
- Update task progress indicators
- Trigger follow-up actions
- Analytics tracking

### taskAborted

Fired when a task is cancelled or aborted.

**Payload**: `[taskId: string]`

```typescript
api.on("taskAborted", (taskId) => {
  console.log(`Task aborted: ${taskId}`);
  cleanupTaskResources(taskId);
});
```

**Use Cases**:

- Clean up task resources
- Update UI status
- Log abort reason
- Cancel related operations

### taskSpawned

Fired when a task creates a subtask.

**Payload**: `[parentTaskId: string, childTaskId: string]`

```typescript
api.on("taskSpawned", (parentTaskId, childTaskId) => {
  console.log(`Task ${parentTaskId} spawned subtask: ${childTaskId}`);
  linkTaskHierarchy(parentTaskId, childTaskId);
});
```

**Use Cases**:

- Track task hierarchies
- Update UI to show subtasks
- Manage resource allocation
- Log task relationships

### taskCompleted

Fired when a task finishes execution with final usage statistics.

**Payload**: `[taskId: string, tokenUsage: TokenUsage, toolUsage: ToolUsage]`

```typescript
api.on("taskCompleted", (taskId, tokenUsage, toolUsage) => {
  console.log(`Task completed: ${taskId}`);
  console.log(`Total cost: $${tokenUsage.totalCost}`);
  console.log(`Tools used: ${Object.keys(toolUsage).length}`);

  // Store completion metrics
  saveTaskMetrics(taskId, {
    tokenUsage,
    toolUsage,
    completedAt: new Date(),
  });
});
```

**Use Cases**:

- Store final metrics
- Calculate costs
- Update completion statistics
- Generate reports

---

## Message Events

### message

Fired when messages are created or updated in the conversation.

**Payload**: `[data: { taskId: string; action: "created" | "updated"; message: ClineMessage }]`

```typescript
api.on("message", ({ taskId, action, message }) => {
  if (action === "created") {
    console.log(`New message in task ${taskId}:`, message.text);
  } else {
    console.log(`Updated message in task ${taskId}`);
  }

  // Handle different message types
  if (message.type === "ask") {
    handleUserPrompt(taskId, message);
  } else if (message.type === "say") {
    handleAIResponse(taskId, message);
  }
});
```

**Message Types**:

**Ask Messages** (`message.type === 'ask'`):

- User input required
- `message.ask` contains the ask type
- Common ask types: `followup`, `command`, `tool`, `completion_result`

**Say Messages** (`message.type === 'say'`):

- AI responses and system messages
- `message.say` contains the say type
- Common say types: `text`, `command_output`, `api_req_started`, `error`

**Use Cases**:

- Update conversation UI
- Log conversation history
- Trigger custom message handlers
- Parse tool usage and commands

---

## Token Usage Events

### taskTokenUsageUpdated

Fired when token usage statistics are updated during task execution.

**Payload**: `[taskId: string, tokenUsage: TokenUsage]`

```typescript
api.on("taskTokenUsageUpdated", (taskId, tokenUsage) => {
  console.log(`Token usage updated for task ${taskId}:`);
  console.log(`Input tokens: ${tokenUsage.totalTokensIn}`);
  console.log(`Output tokens: ${tokenUsage.totalTokensOut}`);
  console.log(`Current cost: $${tokenUsage.totalCost}`);

  // Update real-time cost display
  updateCostDisplay(taskId, tokenUsage.totalCost);

  // Check cost limits
  if (tokenUsage.totalCost > MAX_TASK_COST) {
    warnHighCost(taskId, tokenUsage.totalCost);
  }
});
```

**TokenUsage Structure**:

```typescript
interface TokenUsage {
  totalTokensIn: number; // Cumulative input tokens
  totalTokensOut: number; // Cumulative output tokens
  totalCacheWrites?: number; // Cache write operations
  totalCacheReads?: number; // Cache read operations
  totalCost: number; // Total cost in USD
  contextTokens: number; // Context tokens in current request
}
```

**Use Cases**:

- Real-time cost monitoring
- Usage analytics
- Cost limit enforcement
- Performance optimization
- Billing integration

---

## Tool Events

### taskToolFailed

Fired when a tool operation fails during task execution.

**Payload**: `[taskId: string, toolName: ToolName, error: string]`

```typescript
api.on("taskToolFailed", (taskId, toolName, error) => {
  console.error(`Tool ${toolName} failed in task ${taskId}: ${error}`);

  // Log tool failure for debugging
  logToolFailure(taskId, toolName, error);

  // Handle specific tool failures
  switch (toolName) {
    case "execute_command":
      handleCommandFailure(taskId, error);
      break;
    case "read_file":
      handleFileReadFailure(taskId, error);
      break;
    case "browser_action":
      handleBrowserFailure(taskId, error);
      break;
    default:
      handleGenericToolFailure(taskId, toolName, error);
  }
});
```

**Common Tool Failure Scenarios**:

- **File Operations**: Permission denied, file not found
- **Command Execution**: Command not found, permission denied
- **Browser Actions**: Browser not available, navigation timeout
- **API Calls**: Network errors, authentication failures
- **MCP Tools**: Server unavailable, tool not found

**Use Cases**:

- Error logging and debugging
- Failure recovery mechanisms
- User notification
- Tool reliability monitoring
- Performance analysis

---

## IPC Events

### IpcServerEvents

Events for the IPC server component:

```typescript
interface IpcServerEvents {
  Connect: [clientId: string];
  Disconnect: [clientId: string];
  TaskCommand: [clientId: string, data: TaskCommand];
  TaskEvent: [relayClientId: string | undefined, data: TaskEvent];
}
```

### IPC Event Examples

```typescript
// IPC Server event handling
server.on("Connect", (clientId) => {
  console.log(`IPC client connected: ${clientId}`);
  connectedClients.add(clientId);
});

server.on("Disconnect", (clientId) => {
  console.log(`IPC client disconnected: ${clientId}`);
  connectedClients.delete(clientId);
});

server.on("TaskCommand", (clientId, command) => {
  console.log(`Received command from ${clientId}:`, command.commandName);

  switch (command.commandName) {
    case "StartNewTask":
      handleStartNewTask(clientId, command.data);
      break;
    case "CancelTask":
      handleCancelTask(clientId, command.data);
      break;
    case "CloseTask":
      handleCloseTask(clientId, command.data);
      break;
  }
});
```

---

## Event Patterns

### Event Ordering

Events follow a predictable lifecycle order:

```
1. taskCreated
2. taskStarted
3. message (initial task message)
4. [task execution with various events]
5. taskCompleted | taskAborted
```

### Hierarchical Events

For subtasks, events maintain parent-child relationships:

```
1. taskSpawned (parent creates child)
2. taskCreated (child task)
3. taskStarted (child task)
4. [child task execution]
5. taskCompleted (child task)
6. [parent task continues]
```

### Error Handling Pattern

```typescript
// Comprehensive error handling
api.on("taskToolFailed", (taskId, toolName, error) => {
  // Log the failure
  logger.error("Tool failure", { taskId, toolName, error });

  // Increment failure counter
  incrementToolFailureCount(toolName);

  // Notify monitoring systems
  notifyMonitoring("tool_failure", { taskId, toolName, error });

  // Attempt recovery if possible
  if (isRecoverableError(error)) {
    scheduleRetry(taskId, toolName);
  }
});
```

### State Synchronization

```typescript
// Maintain task state across events
const taskStates = new Map<string, TaskState>();

api.on("taskCreated", (taskId) => {
  taskStates.set(taskId, {
    status: "created",
    createdAt: new Date(),
    messages: [],
    tokenUsage: null,
  });
});

api.on("taskStarted", (taskId) => {
  const state = taskStates.get(taskId);
  if (state) {
    state.status = "running";
    state.startedAt = new Date();
  }
});

api.on("message", ({ taskId, message }) => {
  const state = taskStates.get(taskId);
  if (state) {
    state.messages.push(message);
  }
});

api.on("taskCompleted", (taskId, tokenUsage) => {
  const state = taskStates.get(taskId);
  if (state) {
    state.status = "completed";
    state.completedAt = new Date();
    state.tokenUsage = tokenUsage;
  }
});
```

---

## Usage Examples

### Basic Event Monitoring

```typescript
import { RooCodeAPI } from "@roo-code/types";

class TaskMonitor {
  private api: RooCodeAPI;
  private activeTasks = new Set<string>();

  constructor(api: RooCodeAPI) {
    this.api = api;
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Task lifecycle
    this.api.on("taskCreated", this.handleTaskCreated.bind(this));
    this.api.on("taskStarted", this.handleTaskStarted.bind(this));
    this.api.on("taskCompleted", this.handleTaskCompleted.bind(this));
    this.api.on("taskAborted", this.handleTaskAborted.bind(this));

    // Token monitoring
    this.api.on("taskTokenUsageUpdated", this.handleTokenUpdate.bind(this));

    // Error monitoring
    this.api.on("taskToolFailed", this.handleToolFailure.bind(this));
  }

  private handleTaskCreated(taskId: string) {
    this.activeTasks.add(taskId);
    console.log(`📝 Task created: ${taskId}`);
  }

  private handleTaskStarted(taskId: string) {
    console.log(`🚀 Task started: ${taskId}`);
  }

  private handleTaskCompleted(taskId: string, tokenUsage: TokenUsage) {
    this.activeTasks.delete(taskId);
    console.log(
      `✅ Task completed: ${taskId} (Cost: $${tokenUsage.totalCost})`,
    );
  }

  private handleTaskAborted(taskId: string) {
    this.activeTasks.delete(taskId);
    console.log(`❌ Task aborted: ${taskId}`);
  }

  private handleTokenUpdate(taskId: string, tokenUsage: TokenUsage) {
    if (tokenUsage.totalCost > 1.0) {
      console.warn(
        `💰 High cost alert: Task ${taskId} cost $${tokenUsage.totalCost}`,
      );
    }
  }

  private handleToolFailure(taskId: string, toolName: string, error: string) {
    console.error(`🔧 Tool failure: ${toolName} in task ${taskId} - ${error}`);
  }

  getActiveTaskCount(): number {
    return this.activeTasks.size;
  }
}

// Usage
const monitor = new TaskMonitor(api);
```

### Real-time Dashboard Integration

```typescript
class RealTimeDashboard {
  private api: RooCodeAPI;
  private socket: WebSocket;

  constructor(api: RooCodeAPI, dashboardUrl: string) {
    this.api = api;
    this.socket = new WebSocket(dashboardUrl);
    this.setupEventForwarding();
  }

  private setupEventForwarding() {
    // Forward all task events to dashboard
    this.api.on("taskCreated", (taskId) => {
      this.sendToDashboard("task_created", { taskId, timestamp: Date.now() });
    });

    this.api.on("taskCompleted", (taskId, tokenUsage, toolUsage) => {
      this.sendToDashboard("task_completed", {
        taskId,
        tokenUsage,
        toolUsage,
        timestamp: Date.now(),
      });
    });

    this.api.on("taskTokenUsageUpdated", (taskId, tokenUsage) => {
      this.sendToDashboard("token_usage_update", {
        taskId,
        cost: tokenUsage.totalCost,
        tokens: tokenUsage.totalTokensIn + tokenUsage.totalTokensOut,
        timestamp: Date.now(),
      });
    });

    this.api.on("message", ({ taskId, action, message }) => {
      if (message.type === "ask") {
        this.sendToDashboard("user_input_required", {
          taskId,
          askType: message.ask,
          text: message.text,
          timestamp: Date.now(),
        });
      }
    });
  }

  private sendToDashboard(eventType: string, data: any) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ eventType, data }));
    }
  }
}
```

### Analytics and Reporting

```typescript
class TaskAnalytics {
  private api: RooCodeAPI;
  private taskMetrics = new Map<string, TaskMetrics>();

  constructor(api: RooCodeAPI) {
    this.api = api;
    this.setupAnalytics();
  }

  private setupAnalytics() {
    this.api.on("taskCreated", (taskId) => {
      this.taskMetrics.set(taskId, {
        taskId,
        createdAt: Date.now(),
        toolUsageCount: {},
        messageCount: 0,
        errorCount: 0,
      });
    });

    this.api.on("message", ({ taskId }) => {
      const metrics = this.taskMetrics.get(taskId);
      if (metrics) {
        metrics.messageCount++;
      }
    });

    this.api.on("taskToolFailed", (taskId, toolName) => {
      const metrics = this.taskMetrics.get(taskId);
      if (metrics) {
        metrics.errorCount++;
        metrics.toolUsageCount[toolName] =
          (metrics.toolUsageCount[toolName] || 0) + 1;
      }
    });

    this.api.on("taskCompleted", (taskId, tokenUsage, toolUsage) => {
      const metrics = this.taskMetrics.get(taskId);
      if (metrics) {
        metrics.completedAt = Date.now();
        metrics.duration = metrics.completedAt - metrics.createdAt;
        metrics.finalTokenUsage = tokenUsage;
        metrics.finalToolUsage = toolUsage;

        // Save to analytics database
        this.saveMetrics(metrics);
      }
    });
  }

  private saveMetrics(metrics: TaskMetrics) {
    // Implementation for saving to your analytics system
    console.log("Saving task metrics:", metrics);
  }

  generateReport(startDate: Date, endDate: Date) {
    // Generate analytics report for date range
    const tasks = Array.from(this.taskMetrics.values()).filter(
      (task) =>
        task.createdAt >= startDate.getTime() &&
        task.createdAt <= endDate.getTime(),
    );

    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.completedAt).length,
      totalCost: tasks.reduce(
        (sum, t) => sum + (t.finalTokenUsage?.totalCost || 0),
        0,
      ),
      averageDuration:
        tasks.reduce((sum, t) => sum + (t.duration || 0), 0) / tasks.length,
      topTools: this.getTopTools(tasks),
      errorRate: tasks.reduce((sum, t) => sum + t.errorCount, 0) / tasks.length,
    };
  }

  private getTopTools(tasks: TaskMetrics[]) {
    const toolCounts = new Map<string, number>();

    tasks.forEach((task) => {
      if (task.finalToolUsage) {
        Object.entries(task.finalToolUsage).forEach(([tool, usage]) => {
          toolCounts.set(tool, (toolCounts.get(tool) || 0) + usage.attempts);
        });
      }
    });

    return Array.from(toolCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
  }
}

interface TaskMetrics {
  taskId: string;
  createdAt: number;
  completedAt?: number;
  duration?: number;
  messageCount: number;
  errorCount: number;
  toolUsageCount: Record<string, number>;
  finalTokenUsage?: TokenUsage;
  finalToolUsage?: ToolUsage;
}
```

---

## Best Practices

### Event Handler Registration

```typescript
// ✅ Good: Register handlers early
class MyApp {
  constructor(api: RooCodeAPI) {
    this.setupEventHandlers(api);
  }

  private setupEventHandlers(api: RooCodeAPI) {
    // Register all handlers before starting tasks
    api.on("taskCreated", this.handleTaskCreated);
    api.on("taskCompleted", this.handleTaskCompleted);
  }
}

// ❌ Bad: Late registration might miss events
setTimeout(() => {
  api.on("taskCreated", handler); // Might miss early events
}, 1000);
```

### Error Handling

```typescript
// ✅ Good: Wrap handlers in try-catch
api.on("taskCompleted", (taskId, tokenUsage, toolUsage) => {
  try {
    processTaskCompletion(taskId, tokenUsage, toolUsage);
  } catch (error) {
    console.error("Error processing task completion:", error);
  }
});

// ✅ Good: Handle async errors
api.on("taskCompleted", async (taskId, tokenUsage, toolUsage) => {
  try {
    await saveTaskResults(taskId, tokenUsage, toolUsage);
  } catch (error) {
    console.error("Error saving task results:", error);
  }
});
```

### Memory Management

```typescript
// ✅ Good: Clean up when done
class TaskTracker {
  private taskData = new Map();

  constructor(api: RooCodeAPI) {
    api.on("taskCompleted", (taskId) => {
      // Process final data
      this.processFinalData(taskId);

      // Clean up to prevent memory leaks
      this.taskData.delete(taskId);
    });

    api.on("taskAborted", (taskId) => {
      // Clean up aborted tasks too
      this.taskData.delete(taskId);
    });
  }
}
```

This comprehensive event documentation provides developers with all the information needed to effectively use the RooCode API event system for monitoring, analytics, and integration purposes.
