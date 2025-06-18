# Roo Code API Tools

This document provides comprehensive documentation for the tool system used by Roo Code, including available tools, data types, and Inter-Process Communication (IPC) protocol for task execution and system integration.

## Table of Contents

1. [Tool System Overview](#tool-system-overview)
2. [Available Tools](#available-tools)
3. [Message.text Data Types](#messagetext-data-types)
4. [Tool Usage & Tracking](#tool-usage--tracking)
5. [IPC Communication](#ipc-communication)
6. [MCP Integration](#mcp-integration)
7. [Usage Examples](#usage-examples)

---

## Tool System Overview

Roo Code's tool system provides the AI with capabilities to interact with the development environment, file system, browser, and external services. Tools are organized into functional groups and tracked for usage analytics.

### Tool Groups

```typescript
type ToolGroup =
  | "read" // File reading and inspection tools
  | "edit" // File editing and modification tools
  | "browser" // Browser automation tools
  | "command" // Command execution tools
  | "mcp" // Model Context Protocol tools
  | "modes"; // Mode switching and task management tools
```

### Tool Categories

#### Read Tools

- **File Operations**: `read_file`, `list_files`, `search_files`
- **Code Analysis**: `list_code_definition_names`, `codebase_search`

#### Edit Tools

- **File Modification**: `write_to_file`, `apply_diff`, `insert_content`
- **Text Operations**: `search_and_replace`

#### Browser Tools

- **Web Automation**: `browser_action`

#### Command Tools

- **System Interaction**: `execute_command`

#### MCP Tools

- **External Integration**: `use_mcp_tool`, `access_mcp_resource`

#### Mode Tools

- **Task Management**: `switch_mode`, `new_task`, `fetch_instructions`
- **User Interaction**: `ask_followup_question`, `attempt_completion`

---

## Available Tools

### Complete Tool Listing

```typescript
type ToolName =
  // File System Tools
  | "read_file" // Read file contents
  | "write_to_file" // Create or overwrite files
  | "apply_diff" // Apply unified diff patches
  | "insert_content" // Insert content at specific lines
  | "search_and_replace" // Find and replace text patterns
  | "list_files" // List directory contents
  | "search_files" // Search for files matching patterns

  // Code Analysis Tools
  | "list_code_definition_names" // Extract code structure and definitions
  | "codebase_search" // Semantic search across codebase

  // System Interaction Tools
  | "execute_command" // Execute shell commands

  // Browser Automation Tools
  | "browser_action" // Interact with web pages

  // External Integration Tools
  | "use_mcp_tool" // Use Model Context Protocol tools
  | "access_mcp_resource" // Access MCP resources

  // Task Management Tools
  | "ask_followup_question" // Request user input
  | "attempt_completion" // Signal task completion
  | "switch_mode" // Switch to different mode
  | "new_task" // Create subtasks
  | "fetch_instructions"; // Get mode/task instructions
```

### Tool Descriptions

#### File System Tools

**`read_file`** - Read and analyze file contents with line numbering and binary detection  
**`write_to_file`** - Create new files or completely rewrite existing ones with directory creation  
**`apply_diff`** - Apply precise modifications using unified diff format with conflict detection  
**`search_files`** - Find files and content matching regex patterns with context extraction

#### Code Analysis Tools

**`list_code_definition_names`** - Extract code structure and definitions with multi-language support  
**`codebase_search`** - Semantic search across entire codebase with relevance scoring

#### System Interaction

**`execute_command`** - Run shell commands with output capture and error handling

#### Browser Automation

**`browser_action`** - Automate web browser interactions including navigation and screenshots

#### External Integration

**`use_mcp_tool`** - Execute tools provided by Model Context Protocol servers  
**`access_mcp_resource`** - Access resources provided by MCP servers

---

## Message.text Data Types

The `text` field in [`ClineMessage`](roo-api-events.md:82) serves dual purposes:

1. **Plain Text**: Simple string content for human-readable messages
2. **JSON Strings**: Serialized objects containing structured data for specific message types

This section provides comprehensive reference for ALL possible structures in `message.text`, organized by message type with complete JSON interface definitions.

---

### Core JSON Interface Definitions

#### Tool Operation Structure

```typescript
interface ClineSayTool {
  // Core tool identification
  tool:
    | "readFile"
    | "editedExistingFile"
    | "newFileCreated"
    | "appliedDiff"
    | "listFilesTopLevel"
    | "listFilesRecursive"
    | "searchFiles"
    | "listCodeDefinitionNames"
    | "searchAndReplace"
    | "insertContent"
    | "fetchInstructions"
    | "switchMode"
    | "newTask"
    | "codebaseSearch";

  // File operation properties
  path?: string; // File or directory path
  content?: string; // File content or operation results
  diff?: string; // Diff content for file changes
  reason?: string; // Snippet description for read operations
  lineNumber?: number; // Line number for insertContent operations

  // Search operation properties
  regex?: string; // Search regex pattern
  filePattern?: string; // File pattern filter
  query?: string; // Search query (for codebaseSearch)

  // Status flags
  isOutsideWorkspace?: boolean; // Whether path is outside workspace
  isProtected?: boolean; // Whether file is write-protected

  // Mode and task operations
  mode?: string; // Mode name for mode operations

  // Additional properties
  additionalFileCount?: number; // Tracks number of additional files in batch read_file requests
  question?: string; // Used for followup questions

  // Multi-file operations
  batchFiles?: Array<{
    // Batch file read operations
    path: string; // Readable file path
    lineSnippet: string; // Line range description
    isOutsideWorkspace: boolean; // Workspace status
    key: string; // Unique identifier for approval
    content: string; // Full path for processing
  }>;

  batchDiffs?: Array<{
    // Batch diff operations
    path: string; // Readable file path
    changeCount: number; // Number of changes
    key: string; // Unique identifier for approval
    content: string; // Relative path
    diffs: Array<{
      content: string; // Diff content
      startLine?: number; // Optional start line
    }>;
  }>;

  // Search and replace properties
  search?: string; // Search pattern
  replace?: string; // Replacement text
  useRegex?: boolean; // Whether to use regex
  ignoreCase?: boolean; // Case sensitivity
  startLine?: number; // Line range start
  endLine?: number; // Line range end
}
```

#### Execution Status Structures

```typescript
interface CommandExecutionStatus {
  executionId: string;
  status: "started" | "output" | "exited" | "fallback";
  pid?: number; // Process ID when command starts
  command?: string; // Command being executed
  output?: string; // Compressed terminal output
  exitCode?: number; // Process exit code
}

interface McpExecutionStatus {
  executionId: string;
  status: "started" | "output" | "completed" | "error";
  serverName?: string; // MCP server name
  toolName?: string; // Tool being executed
  response?: string; // Tool response data
  error?: string; // Error message
}
```

#### User Interaction Structures

```typescript
interface FollowupQuestionData {
  question: string;
  suggest: Array<{ answer: string }>;
}

interface ClineSayBrowserAction {
  action:
    | "launch"
    | "click"
    | "hover"
    | "type"
    | "scroll_down"
    | "scroll_up"
    | "resize"
    | "close";
  coordinate?: string;
  text?: string;
}

interface BrowserActionResult {
  screenshot?: string; // Base64 encoded screenshot
  logs?: string; // Browser console logs
  currentUrl?: string; // Current page URL
  currentMousePosition?: string; // Mouse cursor coordinates
}
```

#### MCP Integration Structures

```typescript
interface ClineAskUseMcpServer {
  serverName: string;
  type: "use_mcp_tool" | "access_mcp_resource";
  toolName?: string; // Tool name for use_mcp_tool
  arguments?: string; // JSON string of tool arguments
  uri?: string; // Resource URI for access_mcp_resource
}
```

#### API and System Structures

```typescript
interface ClineApiReqInfo {
  request?: string; // API request description
  tokensIn?: number; // Input tokens consumed
  tokensOut?: number; // Output tokens generated
  cacheWrites?: number; // Cache write operations
  cacheReads?: number; // Cache read operations
  cost?: number; // Request cost in USD
  cancelReason?: "streaming_failed" | "user_cancelled";
  streamingFailedMessage?: string;
}

interface TaskCreationData {
  tool: "newTask";
  mode: string; // Target mode name
  message?: string; // Task message content
  content?: string; // Task content
}

interface ModeSwitchData {
  tool: "switchMode";
  mode: string; // Target mode slug
  reason?: string; // Reason for mode switch
}

interface CodebaseSearchResult {
  tool: "codebaseSearch";
  content: {
    query: string; // Original search query
    results: Array<{
      filePath: string; // Relative file path
      score: number; // Relevance score
      startLine: number; // Code chunk start line
      endLine: number; // Code chunk end line
      codeChunk: string; // Matching code content
    }>;
  };
}
```

---

### Message Type to Content Mapping

#### ClineAsk Types (12 total)

| Type                                    | Content Structure           | Description                                     |
| --------------------------------------- | --------------------------- | ----------------------------------------------- |
| `followup`                              | `FollowupQuestionData` JSON | AI-generated questions with suggested responses |
| `command`                               | Plain text string           | Command to execute                              |
| `command_output`                        | Empty string (`""`)         | Request for command output                      |
| `completion_result`                     | Plain text or empty string  | Task completion result                          |
| `tool`                                  | `ClineSayTool` JSON         | Tool operation requests (single/batch)          |
| `api_req_failed`                        | Plain text string           | API error message                               |
| `api_req_deleted`                       | Plain text string           | API request deletion notification               |
| `resume_task` / `resume_completed_task` | `undefined`                 | No text content                                 |
| `mistake_limit_reached`                 | Plain text string           | Guidance message                                |
| `browser_action_launch`                 | Plain text string           | Browser action description                      |
| `use_mcp_server`                        | `ClineAskUseMcpServer` JSON | MCP server operation requests                   |
| `auto_approval_max_req_reached`         | `{ count: number }` JSON    | Request count data                              |

#### ClineSay Types (24 total)

| Type                         | Content Structure            | Description                        |
| ---------------------------- | ---------------------------- | ---------------------------------- |
| `error`                      | Plain text string            | Error messages                     |
| `api_req_started`            | `ClineApiReqInfo` JSON       | API request metadata               |
| `api_req_finished`           | Legacy (unused)              | Deprecated                         |
| `api_req_retried`            | `undefined`                  | No text content                    |
| `api_req_retry_delayed`      | Plain text string            | Retry countdown messages           |
| `text`                       | Plain text string            | General assistant responses        |
| `reasoning`                  | Plain text string            | LLM reasoning content              |
| `completion_result`          | Plain text string            | Task completion message            |
| `user_feedback`              | Plain text string            | User input text                    |
| `user_feedback_diff`         | Tool data JSON               | Tool data with diff content        |
| `command_output`             | Plain text string            | Terminal output                    |
| `shell_integration_warning`  | `undefined`                  | No text content                    |
| `browser_action`             | `ClineSayBrowserAction` JSON | Browser action parameters          |
| `browser_action_result`      | `BrowserActionResult` JSON   | Browser action results             |
| `mcp_server_request_started` | `undefined`                  | No text content                    |
| `mcp_server_response`        | Tool-specific JSON           | MCP tool response (varies by tool) |
| `subtask_result`             | Plain text string            | Subtask completion message         |
| `checkpoint_saved`           | Plain text string            | Git commit hash                    |
| `rooignore_error`            | Plain text string            | Blocked file path                  |
| `diff_error`                 | Plain text string            | Diff error details                 |
| `condense_context`           | `undefined`                  | Uses contextCondense field instead |
| `condense_context_error`     | Plain text string            | Context condensation error         |
| `codebase_search_result`     | `CodebaseSearchResult` JSON  | Semantic search results            |

---

### Safe Parsing Guidelines

#### Comprehensive Parsing Function

```typescript
function parseMessageJsonContent(message: ClineMessage): any {
  if (!message.text) return null;

  try {
    const parsed = JSON.parse(message.text);

    // Context-based type validation
    if (message.ask === "tool" && parsed.tool) return parsed as ClineSayTool;
    if (message.ask === "use_mcp_server" && parsed.serverName)
      return parsed as ClineAskUseMcpServer;
    if (message.ask === "followup" && parsed.question)
      return parsed as FollowupQuestionData;

    // Status messages by execution ID
    if (parsed.executionId && parsed.status) {
      return parsed.serverName
        ? (parsed as McpExecutionStatus)
        : (parsed as CommandExecutionStatus);
    }

    // Browser and API messages
    if (parsed.action) return parsed as ClineSayBrowserAction;
    if (parsed.screenshot || parsed.logs) return parsed as BrowserActionResult;
    if (parsed.request !== undefined) return parsed as ClineApiReqInfo;

    // Tool-specific messages
    if (parsed.tool === "newTask") return parsed as TaskCreationData;
    if (parsed.tool === "switchMode") return parsed as ModeSwitchData;
    if (parsed.tool === "codebaseSearch") return parsed as CodebaseSearchResult;

    return parsed;
  } catch {
    return message.text; // Return as plain text if parsing fails
  }
}
```

#### Type Guards

```typescript
function isClineSayTool(obj: any): obj is ClineSayTool {
  return obj && typeof obj.tool === "string";
}

function isCommandExecutionStatus(obj: any): obj is CommandExecutionStatus {
  return obj && typeof obj.executionId === "string" && !obj.serverName;
}

function isMcpExecutionStatus(obj: any): obj is McpExecutionStatus {
  return obj && typeof obj.executionId === "string" && obj.serverName;
}
```

#### Best Practices

1. **Always use try-catch** when parsing JSON from the `text` field
2. **Use type guards** to validate structure before accessing properties
3. **Check message type context** (`ask`/`say`) before parsing
4. **Handle both plain text and JSON** gracefully
5. **Validate data structure** even with TypeScript assertions

**Source References:**

- [`readFileTool.ts`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/readFileTool.ts): File operations
- [`executeCommandTool.ts`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/executeCommandTool.ts): Command execution
- [`useMcpToolTool.ts`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/useMcpToolTool.ts): MCP integration
- [`browserActionTool.ts`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/browserActionTool.ts): Browser automation
- [`Task.ts`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/Task.ts): Core task management

---

## Tool Usage & Tracking

### ToolUsage Interface

Tool usage is tracked for analytics and debugging:

```typescript
interface ToolUsage {
  [toolName: ToolName]: {
    attempts: number; // Total times tool was attempted
    failures: number; // Number of failed attempts
  };
}
```

### Usage Analytics

```typescript
function calculateToolSuccessRate(usage: ToolUsage): Record<ToolName, number> {
  const successRates: Partial<Record<ToolName, number>> = {};

  for (const [toolName, stats] of Object.entries(usage)) {
    const successRate =
      stats.attempts > 0
        ? ((stats.attempts - stats.failures) / stats.attempts) * 100
        : 0;
    successRates[toolName as ToolName] = successRate;
  }

  return successRates as Record<ToolName, number>;
}
```

---

## IPC Communication

Roo Code uses Inter-Process Communication for coordination between components and external integrations.

### IPC Message Types

```typescript
enum IpcMessageType {
  Connect = "Connect",
  Disconnect = "Disconnect",
  Ack = "Ack",
  TaskCommand = "TaskCommand",
  TaskEvent = "TaskEvent",
}

type IpcMessage = AckMessage | TaskCommandMessage | TaskEventMessage;
```

### Task Commands

```typescript
enum TaskCommandName {
  StartNewTask = "StartNewTask",
  CancelTask = "CancelTask",
  CloseTask = "CloseTask",
}

interface StartNewTaskCommand {
  commandName: "StartNewTask";
  data: {
    configuration: RooCodeSettings;
    text: string;
    images?: string[];
    newTab?: boolean;
  };
}
```

### Task Events

```typescript
interface TaskEvent {
  eventName: RooCodeEventName;
  payload: any[];
  taskId?: number;
}
```

---

## MCP Integration

Model Context Protocol (MCP) enables integration with external tools and services.

### MCP Execution Status

```typescript
type McpExecutionStatus =
  | {
      executionId: string;
      status: "started";
      serverName: string;
      toolName: string;
    }
  | { executionId: string; status: "output"; response: string }
  | { executionId: string; status: "completed"; response?: string }
  | { executionId: string; status: "error"; error?: string };
```

### MCP Tool Usage

```typescript
// Using an MCP tool
const mcpToolResult = await api.useMcpTool({
  serverName: "filesystem",
  toolName: "read_directory",
  arguments: { path: "/project/src", recursive: true },
});

// Accessing an MCP resource
const mcpResource = await api.accessMcpResource({
  serverName: "database",
  uri: "mysql://localhost/users",
});
```

---

## Usage Examples

### Tool Usage Monitoring

```typescript
class ToolMonitor {
  private toolStats = new Map<
    ToolName,
    { attempts: number; failures: number }
  >();

  constructor(private api: RooCodeAPI) {
    this.setupMonitoring();
  }

  private setupMonitoring() {
    this.api.on("taskToolFailed", (taskId, toolName, error) => {
      this.recordFailure(toolName);
      console.log(`🔧 Tool ${toolName} failed:`, error);
    });

    this.api.on("taskCompleted", (taskId, tokenUsage, toolUsage) => {
      this.updateStats(toolUsage);
      this.reportStats();
    });
  }

  getMostUsedTools(limit = 5): Array<[ToolName, number]> {
    return Array.from(this.toolStats.entries())
      .sort(([, a], [, b]) => b.attempts - a.attempts)
      .slice(0, limit)
      .map(([tool, stats]) => [tool, stats.attempts]);
  }

  getProblematicTools(minFailureRate = 0.2): ToolName[] {
    return Array.from(this.toolStats.entries())
      .filter(([, stats]) => {
        const failureRate =
          stats.attempts > 0 ? stats.failures / stats.attempts : 0;
        return failureRate >= minFailureRate && stats.attempts >= 3;
      })
      .map(([tool]) => tool);
  }
}
```

### IPC Client Implementation

```typescript
class RooCodeIpcClient extends EventEmitter {
  private socket: Socket | null = null;
  private clientId: string;

  constructor(private socketPath: string) {
    super();
    this.clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = createConnection(this.socketPath);

      this.socket.on("connect", () => resolve());
      this.socket.on("data", (data) => this.handleMessage(data.toString()));
      this.socket.on("error", reject);
      this.socket.on("close", () => this.emit("disconnect"));
    });
  }

  async startNewTask(
    config: RooCodeSettings,
    text: string,
    images?: string[],
  ): Promise<void> {
    const message: IpcMessage = {
      type: "TaskCommand",
      origin: "client",
      clientId: this.clientId,
      data: {
        commandName: "StartNewTask",
        data: { configuration: config, text, images },
      },
    };

    this.sendMessage(message);
  }

  private sendMessage(message: IpcMessage) {
    if (this.socket) {
      this.socket.write(JSON.stringify(message) + "\n");
    }
  }
}
```

### MCP Tool Integration

```typescript
class McpToolManager {
  constructor(private api: RooCodeAPI) {
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.api.on("message", ({ message }) => {
      if (message.say === "mcp_server_request_started") {
        this.handleMcpStarted(message.text);
      } else if (message.say === "mcp_server_response") {
        this.handleMcpResponse(message.text);
      }
    });
  }

  async executeFileSystemTool(operation: string, path: string): Promise<any> {
    return await this.api.useMcpTool({
      serverName: "filesystem",
      toolName: operation,
      arguments: { path },
    });
  }

  async queryDatabase(query: string): Promise<any> {
    return await this.api.useMcpTool({
      serverName: "database",
      toolName: "execute_query",
      arguments: { sql: query },
    });
  }
}
```

This comprehensive tools system enables Roo Code to provide powerful automation capabilities while maintaining secure, monitored, and trackable interactions with the development environment and external services.
