# RooCode API Tools and IPC Communication

Comprehensive documentation for the RooCode tool system, IPC communication, and mode configuration.

## Table of Contents

1. [Tool System Overview](#tool-system-overview)
2. [Available Tools](#available-tools)
3. [Tool Groups](#tool-groups)
4. [Tool Usage Tracking](#tool-usage-tracking)
5. [IPC Communication](#ipc-communication)
6. [Mode Configuration](#mode-configuration)
7. [Message Types](#message-types)
8. [Usage Examples](#usage-examples)

---

## Tool System Overview

The RooCode API provides a comprehensive set of tools that AI assistants can use to interact with files, execute commands, browse the web, and perform various tasks. The tool system is organized into groups and supports usage tracking and failure monitoring.

### Key Features

- **35+ Built-in Tools**: File operations, command execution, browser automation, and more
- **Tool Groups**: Organized categories for mode configuration
- **Usage Tracking**: Monitor tool attempts and failures
- **Permission System**: User approval for sensitive operations
- **Extensible Architecture**: Support for custom tools via MCP

---

## Available Tools

### ToolName Enumeration

All available tools in the RooCode API:

```typescript
type ToolName =
  // File Operations
  | "read_file" // Read file contents
  | "write_to_file" // Write/create files
  | "apply_diff" // Apply code diffs
  | "insert_content" // Insert content into files
  | "search_and_replace" // Find and replace text
  | "search_files" // Search across files with regex
  | "list_files" // List directory contents
  | "list_code_definition_names" // Extract code definitions

  // Command Execution
  | "execute_command" // Execute terminal commands

  // Browser Automation
  | "browser_action" // Browser automation and interaction

  // Search and Analysis
  | "codebase_search" // Semantic code search

  // User Interaction
  | "ask_followup_question" // Ask user questions
  | "attempt_completion" // Mark task complete

  // Mode and Task Management
  | "switch_mode" // Change AI mode
  | "new_task" // Create new task
  | "fetch_instructions" // Get mode instructions

  // External Integrations
  | "use_mcp_tool" // Use MCP tools
  | "access_mcp_resource"; // Access MCP resources
```

### Tool Categories

**File Operations** (8 tools):

- Reading, writing, and modifying files
- Searching file contents
- Directory operations
- Code analysis

**Command Execution** (1 tool):

- Terminal/shell command execution
- Cross-platform command support

**Browser Automation** (1 tool):

- Web page interaction
- Screenshot capture
- Form filling and navigation

**Search and Analysis** (1 tool):

- Semantic codebase search
- AI-powered code understanding

**User Interaction** (2 tools):

- Asking clarifying questions
- Task completion confirmation

**Mode Management** (3 tools):

- AI mode switching
- Task creation and management
- Instruction fetching

**External Integrations** (2 tools):

- Model Context Protocol (MCP) integration
- Custom tool and resource access

---

## Tool Groups

### ToolGroup Enumeration

Tools are organized into logical groups for mode configuration:

```typescript
type ToolGroup =
  | "read" // File reading operations
  | "edit" // File editing operations
  | "browser" // Browser automation
  | "command" // Terminal commands
  | "mcp" // MCP integrations
  | "modes"; // Mode switching and task management
```

### Group Mappings

**Read Group**:

- `read_file` - Read file contents
- `list_files` - List directory contents
- `list_code_definition_names` - Extract code definitions
- `search_files` - Search across files
- `codebase_search` - Semantic code search

**Edit Group**:

- `write_to_file` - Write/create files
- `apply_diff` - Apply code diffs
- `insert_content` - Insert content into files
- `search_and_replace` - Find and replace text

**Browser Group**:

- `browser_action` - All browser automation

**Command Group**:

- `execute_command` - Terminal command execution

**MCP Group**:

- `use_mcp_tool` - Use MCP tools
- `access_mcp_resource` - Access MCP resources

**Modes Group**:

- `switch_mode` - Change AI mode
- `new_task` - Create new task
- `fetch_instructions` - Get mode instructions
- `ask_followup_question` - Ask user questions
- `attempt_completion` - Mark task complete

---

## Tool Usage Tracking

### ToolUsage Structure

Track tool usage statistics across tasks:

```typescript
type ToolUsage = Record<
  ToolName,
  {
    attempts: number; // Total number of attempts
    failures: number; // Number of failed attempts
  }
>;
```

### Usage Examples

```typescript
// Tool usage data from a completed task
const toolUsage: ToolUsage = {
  read_file: { attempts: 5, failures: 0 },
  write_to_file: { attempts: 3, failures: 1 },
  execute_command: { attempts: 2, failures: 0 },
  search_files: { attempts: 1, failures: 0 },
  attempt_completion: { attempts: 1, failures: 0 },
};

// Calculate success rates
const calculateSuccessRate = (usage: ToolUsage, toolName: ToolName) => {
  const tool = usage[toolName];
  if (!tool || tool.attempts === 0) return 0;
  return ((tool.attempts - tool.failures) / tool.attempts) * 100;
};

console.log(
  `write_to_file success rate: ${calculateSuccessRate(toolUsage, "write_to_file")}%`,
);
```

### Monitoring Tool Failures

```typescript
// Listen for tool failures
api.on("taskToolFailed", (taskId, toolName, error) => {
  console.error(`Tool ${toolName} failed in task ${taskId}: ${error}`);

  // Track failure patterns
  trackToolFailure(toolName, error);

  // Handle specific failure types
  if (toolName === "execute_command" && error.includes("permission denied")) {
    suggestSudoUsage(taskId);
  } else if (toolName === "read_file" && error.includes("not found")) {
    suggestFileCreation(taskId);
  }
});

// Analyze tool performance
const analyzeToolPerformance = (tasks: CompletedTask[]) => {
  const overallUsage: ToolUsage = {};

  tasks.forEach((task) => {
    Object.entries(task.toolUsage).forEach(([tool, usage]) => {
      if (!overallUsage[tool as ToolName]) {
        overallUsage[tool as ToolName] = { attempts: 0, failures: 0 };
      }
      overallUsage[tool as ToolName].attempts += usage.attempts;
      overallUsage[tool as ToolName].failures += usage.failures;
    });
  });

  return overallUsage;
};
```

---

## IPC Communication

### IPC Message Types

The Inter-Process Communication system uses structured messages:

```typescript
enum IpcMessageType {
  Connect = "Connect", // Client connection
  Disconnect = "Disconnect", // Client disconnection
  Ack = "Ack", // Server acknowledgment
  TaskCommand = "TaskCommand", // Client commands
  TaskEvent = "TaskEvent", // Server events
}

enum IpcOrigin {
  Client = "client", // Message from client
  Server = "server", // Message from server
}
```

### IPC Message Structure

```typescript
type IpcMessage =
  | {
      type: "Ack";
      origin: "server";
      data: {
        clientId: string; // Unique client identifier
        pid: number; // Process ID
        ppid: number; // Parent process ID
      };
    }
  | {
      type: "TaskCommand";
      origin: "client";
      clientId: string;
      data: TaskCommand; // Command to execute
    }
  | {
      type: "TaskEvent";
      origin: "server";
      relayClientId?: string; // Optional relay target
      data: TaskEvent; // Event data
    };
```

### Task Commands

Commands sent from clients to the server:

```typescript
enum TaskCommandName {
  StartNewTask = "StartNewTask",
  CancelTask = "CancelTask",
  CloseTask = "CloseTask",
}

type TaskCommand =
  | {
      commandName: "StartNewTask";
      data: {
        configuration: RooCodeSettings;
        text: string;
        images?: string[];
        newTab?: boolean;
      };
    }
  | {
      commandName: "CancelTask";
      data: string; // taskId
    }
  | {
      commandName: "CloseTask";
      data: string; // taskId
    };
```

### Task Events

Events sent from server to clients:

```typescript
interface TaskEvent {
  eventName: RooCodeEventName; // Event type
  payload: EventPayload; // Type-specific payload
  taskId?: number; // Optional task ID
}

// Event names match RooCodeAPIEvents
enum RooCodeEventName {
  Message = "message",
  TaskCreated = "taskCreated",
  TaskStarted = "taskStarted",
  TaskModeSwitched = "taskModeSwitched",
  TaskPaused = "taskPaused",
  TaskUnpaused = "taskUnpaused",
  TaskAskResponded = "taskAskResponded",
  TaskAborted = "taskAborted",
  TaskSpawned = "taskSpawned",
  TaskCompleted = "taskCompleted",
  TaskTokenUsageUpdated = "taskTokenUsageUpdated",
  TaskToolFailed = "taskToolFailed",
  EvalPass = "evalPass", // Evaluation passed
  EvalFail = "evalFail", // Evaluation failed
}
```

### IPC Server Interface

```typescript
interface RooCodeIpcServer extends EventEmitter<IpcServerEvents> {
  listen(): void; // Start listening
  broadcast(message: IpcMessage): void; // Send to all clients
  send(client: string | Socket, message: IpcMessage): void; // Send to specific client
  get socketPath(): string; // Unix socket path
  get isListening(): boolean; // Server status
}

type IpcServerEvents = {
  Connect: [clientId: string]; // Client connected
  Disconnect: [clientId: string]; // Client disconnected
  TaskCommand: [clientId: string, data: TaskCommand]; // Command received
  TaskEvent: [relayClientId: string | undefined, data: TaskEvent]; // Event to relay
};
```

---

## Mode Configuration

### ModeConfig Structure

Configure custom AI modes with specific tool groups and behaviors:

```typescript
interface ModeConfig {
  slug: string; // Unique identifier (alphanumeric + dashes)
  name: string; // Display name
  roleDefinition: string; // AI role description
  whenToUse?: string; // Usage guidance
  customInstructions?: string; // Additional instructions
  groups: GroupEntry[]; // Available tool groups
  source?: "global" | "project"; // Configuration source
}
```

### Group Configuration

Configure tool groups with optional restrictions:

```typescript
type GroupEntry = ToolGroup | [ToolGroup, GroupOptions];

interface GroupOptions {
  fileRegex?: string; // File pattern restriction
  description?: string; // Group description
}
```

### Mode Examples

**Code Mode** (Full capabilities):

```typescript
const codeMode: ModeConfig = {
  slug: "code",
  name: "💻 Code",
  roleDefinition: "Expert software developer and architect",
  whenToUse: "For writing, modifying, or refactoring code",
  groups: ["read", "edit", "command", "browser", "mcp", "modes"],
};
```

**Read-Only Mode** (Limited to reading):

```typescript
const readOnlyMode: ModeConfig = {
  slug: "ask",
  name: "❓ Ask",
  roleDefinition: "Helpful assistant for questions and explanations",
  whenToUse: "For understanding code without making changes",
  groups: [
    "read",
    ["edit", { fileRegex: "README\\.md$", description: "Documentation only" }],
    "modes",
  ],
};
```

**Browser Mode** (Web-focused):

```typescript
const browserMode: ModeConfig = {
  slug: "browser",
  name: "🌐 Browser",
  roleDefinition: "Web automation and research specialist",
  whenToUse: "For web scraping, testing, or research tasks",
  groups: ["read", "browser", "modes"],
};
```

### Custom Mode Prompts

Additional prompt components for modes:

```typescript
interface PromptComponent {
  roleDefinition?: string; // Override role
  whenToUse?: string; // Override usage
  customInstructions?: string; // Additional instructions
}

type CustomModePrompts = Record<string, PromptComponent | undefined>;

// Example custom prompts
const customPrompts: CustomModePrompts = {
  debug: {
    roleDefinition: "Expert debugger focused on finding and fixing issues",
    customInstructions: "Always provide detailed analysis of potential causes",
  },
  security: {
    roleDefinition: "Security specialist focused on secure coding practices",
    customInstructions:
      "Prioritize security best practices in all recommendations",
  },
};
```

---

## Message Types

### ClineMessage Structure

Messages in the conversation system:

```typescript
interface ClineMessage {
  ts: number; // Timestamp
  type: "ask" | "say"; // Message type
  ask?: ClineAsk; // Ask type (user input needed)
  say?: ClineSay; // Say type (AI response)
  text?: string; // Message content
  images?: string[]; // Attached images
  partial?: boolean; // Still being generated
  reasoning?: string; // AI reasoning (internal)
  conversationHistoryIndex?: number; // Position in conversation
  checkpoint?: Record<string, unknown>; // State checkpoint
  progressStatus?: ToolProgressStatus; // Tool progress
  contextCondense?: ContextCondense; // Context condensation info
  isProtected?: boolean; // Message protection
}
```

### Ask Types (User Input Required)

```typescript
type ClineAsk =
  | "followup" // Clarifying question
  | "command" // Execute command permission
  | "command_output" // View command output permission
  | "completion_result" // Task completion confirmation
  | "tool" // Tool usage permission
  | "api_req_failed" // Retry failed API request
  | "resume_task" // Resume paused task
  | "resume_completed_task" // Resume completed task
  | "mistake_limit_reached" // Error limit exceeded
  | "browser_action_launch" // Browser permission
  | "use_mcp_server" // MCP server permission
  | "auto_approval_max_req_reached"; // Manual approval required
```

### Say Types (AI Responses)

```typescript
type ClineSay =
  | "error" // Error message
  | "api_req_started" // API request initiated
  | "api_req_finished" // API request completed
  | "api_req_retried" // API request retried
  | "api_req_retry_delayed" // Retry delayed
  | "api_req_deleted" // Request cancelled
  | "text" // General response
  | "reasoning" // AI reasoning
  | "completion_result" // Task completion
  | "user_feedback" // User feedback
  | "user_feedback_diff" // Diff feedback
  | "command_output" // Command output
  | "shell_integration_warning" // Shell warning
  | "browser_action" // Browser action
  | "browser_action_result" // Browser result
  | "mcp_server_request_started" // MCP request started
  | "mcp_server_response" // MCP response
  | "subtask_result" // Subtask result
  | "checkpoint_saved" // Checkpoint saved
  | "rooignore_error" // Rooignore error
  | "diff_error" // Diff application error
  | "condense_context" // Context condensation
  | "condense_context_error" // Condensation error
  | "codebase_search_result"; // Search results
```

---

## Usage Examples

### IPC Server Setup

```typescript
import { RooCodeIpcServer, IpcMessage, TaskCommand } from "@roo-code/types";

class MyIpcServer implements RooCodeIpcServer {
  private server: net.Server;
  private clients = new Map<string, net.Socket>();

  constructor() {
    this.server = net.createServer(this.handleConnection.bind(this));
    this.setupEventHandlers();
  }

  listen(): void {
    this.server.listen(this.socketPath);
    console.log(`IPC server listening on ${this.socketPath}`);
  }

  broadcast(message: IpcMessage): void {
    const data = JSON.stringify(message);
    this.clients.forEach((client) => {
      client.write(data + "\n");
    });
  }

  send(client: string | net.Socket, message: IpcMessage): void {
    const socket =
      typeof client === "string" ? this.clients.get(client) : client;
    if (socket) {
      socket.write(JSON.stringify(message) + "\n");
    }
  }

  get socketPath(): string {
    return "/tmp/roocode-ipc.sock";
  }

  get isListening(): boolean {
    return this.server.listening;
  }

  private handleConnection(socket: net.Socket): void {
    const clientId = generateClientId();
    this.clients.set(clientId, socket);

    // Send acknowledgment
    this.send(socket, {
      type: "Ack",
      origin: "server",
      data: {
        clientId,
        pid: process.pid,
        ppid: process.ppid || 0,
      },
    });

    // Emit connect event
    this.emit("Connect", clientId);

    socket.on("data", (data) => {
      this.handleClientMessage(clientId, data.toString());
    });

    socket.on("close", () => {
      this.clients.delete(clientId);
      this.emit("Disconnect", clientId);
    });
  }

  private handleClientMessage(clientId: string, data: string): void {
    try {
      const message: IpcMessage = JSON.parse(data.trim());

      if (message.type === "TaskCommand") {
        this.emit("TaskCommand", clientId, message.data);
      }
    } catch (error) {
      console.error("Error parsing client message:", error);
    }
  }
}

// Usage
const server = new MyIpcServer();
server.listen();

server.on("Connect", (clientId) => {
  console.log(`Client connected: ${clientId}`);
});

server.on("TaskCommand", (clientId, command) => {
  console.log(`Received command from ${clientId}:`, command.commandName);

  if (command.commandName === "StartNewTask") {
    handleStartNewTask(clientId, command.data);
  }
});
```

### Tool Usage Analysis

```typescript
class ToolAnalyzer {
  private toolStats = new Map<ToolName, { total: number; failures: number }>();

  constructor(api: RooCodeAPI) {
    api.on("taskCompleted", (taskId, tokenUsage, toolUsage) => {
      this.updateStats(toolUsage);
    });

    api.on("taskToolFailed", (taskId, toolName, error) => {
      this.recordFailure(toolName, error);
    });
  }

  private updateStats(toolUsage: ToolUsage): void {
    Object.entries(toolUsage).forEach(([tool, usage]) => {
      const toolName = tool as ToolName;
      const current = this.toolStats.get(toolName) || { total: 0, failures: 0 };

      this.toolStats.set(toolName, {
        total: current.total + usage.attempts,
        failures: current.failures + usage.failures,
      });
    });
  }

  private recordFailure(toolName: ToolName, error: string): void {
    console.log(`Tool failure: ${toolName} - ${error}`);
  }

  getTopTools(limit: number = 10): Array<{ tool: ToolName; usage: number }> {
    return Array.from(this.toolStats.entries())
      .map(([tool, stats]) => ({ tool, usage: stats.total }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, limit);
  }

  getToolReliability(): Array<{ tool: ToolName; successRate: number }> {
    return Array.from(this.toolStats.entries())
      .map(([tool, stats]) => ({
        tool,
        successRate:
          stats.total > 0
            ? ((stats.total - stats.failures) / stats.total) * 100
            : 0,
      }))
      .sort((a, b) => b.successRate - a.successRate);
  }

  generateReport(): string {
    const topTools = this.getTopTools(5);
    const reliability = this.getToolReliability();

    return `
Tool Usage Report:

Top 5 Most Used Tools:
${topTools.map(({ tool, usage }) => `  ${tool}: ${usage} uses`).join("\n")}

Tool Reliability (Success Rate):
${reliability.map(({ tool, successRate }) => `  ${tool}: ${successRate.toFixed(1)}%`).join("\n")}
    `.trim();
  }
}
```

### Custom Mode Creation

```typescript
// Create a specialized debugging mode
const createDebugMode = async (api: RooCodeAPI): Promise<void> => {
  const debugMode: ModeConfig = {
    slug: "debug-specialist",
    name: "🐛 Debug Specialist",
    roleDefinition:
      "Expert debugger specialized in finding and fixing code issues",
    whenToUse:
      "When you need to debug problems, analyze errors, or troubleshoot issues",
    customInstructions: `
Focus on:
1. Systematic problem analysis
2. Root cause identification  
3. Step-by-step debugging
4. Testing solutions thoroughly
5. Preventing similar issues
    `,
    groups: [
      "read", // Full read access
      "edit", // File editing for fixes
      "command", // Command execution for testing
      [
        "browser",
        {
          // Limited browser access
          description: "Browser testing only",
        },
      ],
      "modes", // Mode switching
    ],
    source: "project",
  };

  // Add to custom modes
  const currentConfig = api.getConfiguration();
  const updatedConfig = {
    ...currentConfig,
    customModes: [...(currentConfig.customModes || []), debugMode],
  };

  await api.setConfiguration(updatedConfig);
  console.log("Debug mode created successfully");
};

// Create a read-only analysis mode
const createAnalysisMode = async (api: RooCodeAPI): Promise<void> => {
  const analysisMode: ModeConfig = {
    slug: "code-analysis",
    name: "📊 Code Analysis",
    roleDefinition:
      "Code analysis specialist focused on understanding and explaining code",
    whenToUse: "For code reviews, understanding complex codebases, or learning",
    groups: [
      "read", // Full read access
      [
        "edit",
        {
          // Very limited edit access
          fileRegex: "\\.(md|txt|json)$",
          description: "Documentation and config files only",
        },
      ],
      "modes", // Mode switching
    ],
  };

  const currentConfig = api.getConfiguration();
  await api.setConfiguration({
    ...currentConfig,
    customModes: [...(currentConfig.customModes || []), analysisMode],
  });
};
```

### Message Processing

```typescript
class MessageProcessor {
  constructor(api: RooCodeAPI) {
    api.on("message", ({ taskId, action, message }) => {
      this.processMessage(taskId, message);
    });
  }

  private processMessage(taskId: string, message: ClineMessage): void {
    switch (message.type) {
      case "ask":
        this.handleAskMessage(taskId, message);
        break;
      case "say":
        this.handleSayMessage(taskId, message);
        break;
    }
  }

  private handleAskMessage(taskId: string, message: ClineMessage): void {
    console.log(`Task ${taskId} is asking: ${message.ask}`);

    switch (message.ask) {
      case "followup":
        console.log(`Question: ${message.text}`);
        break;
      case "command":
        console.log(`Wants to execute: ${message.text}`);
        break;
      case "tool":
        console.log(`Wants to use tool: ${this.extractToolName(message.text)}`);
        break;
      case "completion_result":
        console.log("Task completed, awaiting feedback");
        break;
    }
  }

  private handleSayMessage(taskId: string, message: ClineMessage): void {
    switch (message.say) {
      case "error":
        console.error(`Task ${taskId} error: ${message.text}`);
        break;
      case "command_output":
        console.log(`Command output: ${message.text}`);
        break;
      case "api_req_started":
        console.log("API request started");
        break;
      case "completion_result":
        console.log(`Task completed: ${message.text}`);
        break;
    }
  }

  private extractToolName(text?: string): string {
    if (!text) return "unknown";
    const match = text.match(/tool:\s*(\w+)/);
    return match ? match[1] : "unknown";
  }
}
```

This comprehensive documentation covers the complete RooCode API tool system, IPC communication, and mode configuration, providing developers with all the information needed to effectively use and extend the platform.
