# Roo Code API Tools

This document provides comprehensive documentation for the tool system used by Roo Code, including available tools, data types, and Inter-Process Communication (IPC) protocol for task execution and system integration.

## Table of Contents

1. [Tool System Overview](#tool-system-overview)
2. [Available Tools](#available-tools)
3. [Data types of `message.text`](#data-types-of-messagetext)
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

**`read_file`**

- **Purpose**: Read and analyze file contents
- **Capabilities**: Text extraction, line numbering, binary file detection
- **Use Cases**: Code review, understanding project structure, gathering context

**`write_to_file`**

- **Purpose**: Create new files or completely rewrite existing ones
- **Capabilities**: Directory creation, file overwriting, content validation
- **Use Cases**: Creating new components, generating files, complete rewrites

**`apply_diff`**

- **Purpose**: Apply precise modifications using unified diff format
- **Capabilities**: Surgical edits, conflict detection, line-based changes
- **Use Cases**: Code refactoring, bug fixes, incremental improvements

**`search_files`**

- **Purpose**: Find files and content matching patterns
- **Capabilities**: Regex search, context extraction, multi-file search
- **Use Cases**: Finding implementations, locating configurations, code archaeology

#### Code Analysis Tools

**`list_code_definition_names`**

- **Purpose**: Extract code structure and definitions from source files
- **Capabilities**: Function/class extraction, TypeScript analysis, multi-language support
- **Use Cases**: Understanding codebases, finding entry points, architectural analysis

**`codebase_search`**

- **Purpose**: Semantic search across entire codebase
- **Capabilities**: Natural language queries, relevance scoring, context-aware results
- **Use Cases**: Finding related functionality, locating examples, discovering patterns

#### System Interaction

**`execute_command`**

- **Purpose**: Run shell commands and system operations
- **Capabilities**: Command execution, output capture, error handling
- **Use Cases**: Build processes, testing, system configuration, package management

#### Browser Automation

**`browser_action`**

- **Purpose**: Automate web browser interactions
- **Capabilities**: Navigation, form filling, screenshot capture, element interaction
- **Use Cases**: Web testing, data extraction, automated workflows

#### External Integration

**`use_mcp_tool`**

- **Purpose**: Execute tools provided by Model Context Protocol servers
- **Capabilities**: Dynamic tool discovery, parameter validation, result processing
- **Use Cases**: API integrations, external service interactions, custom tool usage

**`access_mcp_resource`**

- **Purpose**: Access resources provided by MCP servers
- **Capabilities**: Resource discovery, content retrieval, structured data access
- **Use Cases**: Database queries, file system access, API data retrieval

---

## Data types of `message.text`

The `text` field in [`ClineMessage`](roo-api-events.md:82) serves dual purposes:

1. **Plain Text**: Simple string content for human-readable messages
2. **JSON Strings**: Serialized objects containing structured data for specific message types

This section provides the definitive reference for ALL possible JSON string structures that can appear in the `text` field of `ClineMessage` objects, based on comprehensive analysis of all tool implementations.

---

### Tool Parameter Structures

#### [ClineSayTool](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/readFileTool.ts#L100) - File Operations

Used across multiple file operation tools for approval requests and status updates.

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
      // Individual diff items
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

**Source Files:**

- [`readFileTool.ts`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/readFileTool.ts#L105): Single and batch file read operations
- [`writeToFileTool.ts`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/writeToFileTool.ts#L102): File creation and modification
- [`applyDiffTool.ts`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/applyDiffTool.ts#L150): Diff application operations
- [`multiApplyDiffTool.ts`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/multiApplyDiffTool.ts#L289): Multi-file diff operations
- [`listFilesTool.ts`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/listFilesTool.ts#L50): Directory listing operations
- [`searchFilesTool.ts`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/searchFilesTool.ts#L35): File search operations
- [`listCodeDefinitionNamesTool.ts`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/listCodeDefinitionNamesTool.ts#L34): Code definition parsing
- [`codebaseSearchTool.ts`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/codebaseSearchTool.ts#L47): Semantic code search
- [`searchAndReplaceTool.ts`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/searchAndReplaceTool.ts#L93): Search and replace operations
- [`insertContentTool.ts`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/insertContentTool.ts#L35): Content insertion operations

**Example Usage:**

```json
{
  "tool": "readFile",
  "batchFiles": [
    {
      "path": "src/app.ts",
      "lineSnippet": "lines 1-50",
      "isOutsideWorkspace": false,
      "key": "src/app.ts (lines 1-50)",
      "content": "/workspace/src/app.ts"
    }
  ]
}
```

---

### Status and Progress Messages

#### [`CommandExecutionStatus`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/executeCommandTool.ts#L160) - Command Execution

Tracks the real-time status of command execution in terminals.

```typescript
interface CommandExecutionStatus {
  executionId: string; // Unique execution identifier
  status: "started" | "output" | "exited" | "fallback";

  // Started status properties
  pid?: number; // Process ID when command starts
  command?: string; // Command being executed

  // Output status properties
  output?: string; // Compressed terminal output

  // Exited status properties
  exitCode?: number; // Process exit code
}
```

**Source:** [`executeCommandTool.ts`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/executeCommandTool.ts#L83)

**Usage Context:** Serialized in webview messages to track command execution progress

**Example:**

```json
{
  "executionId": "1640995200000",
  "status": "started",
  "pid": 12345,
  "command": "npm install"
}
```

#### [`McpExecutionStatus`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/useMcpToolTool.ts#L84) - MCP Tool Execution

Tracks the execution status of MCP (Model Context Protocol) tool operations.

```typescript
interface McpExecutionStatus {
  executionId: string; // Unique execution identifier
  status: "started" | "output" | "completed" | "error";

  // Started status properties
  serverName?: string; // MCP server name
  toolName?: string; // Tool being executed

  // Output/completed status properties
  response?: string; // Tool response data

  // Error status properties
  error?: string; // Error message
}
```

**Source:** [`useMcpToolTool.ts`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/useMcpToolTool.ts#L84)

**Usage Context:** Serialized in webview messages to track MCP tool execution

**Example:**

```json
{
  "executionId": "1640995200001",
  "status": "completed",
  "response": "MCP tool executed successfully"
}
```

#### [`BrowserActionResult`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/browserActionTool.ts#L159) - Browser Automation

Contains results from browser automation actions including screenshots and logs.

```typescript
interface BrowserActionResult {
  screenshot?: string; // Base64 encoded screenshot
  logs?: string; // Browser console logs
  currentUrl?: string; // Current page URL
  currentMousePosition?: string; // Mouse cursor coordinates
}
```

**Source:** [`browserActionTool.ts`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/browserActionTool.ts#L159)

**Usage Context:** Serialized in browser action result messages

**Example:**

```json
{
  "screenshot": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "logs": "Console output from browser",
  "currentUrl": "https://example.com"
}
```

---

### User Interaction Structures

#### [`ClineSayBrowserAction`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/browserActionTool.ts#L45) - Browser Action Requests

Describes browser actions being requested for user approval.

```typescript
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
  coordinate?: string; // Click/hover coordinates (x,y)
  text?: string; // Text to type
}
```

**Source:** [`browserActionTool.ts`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/browserActionTool.ts#L45)

**Usage Context:** Used in browser action approval requests

**Example:**

```json
{
  "action": "click",
  "coordinate": "100,200"
}
```

#### [`FollowupQuestionData`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/askFollowupQuestionTool.ts#L32) - AI-Generated Questions

Contains AI-generated questions and suggested responses for user clarification.

```typescript
interface FollowupQuestionData {
  question: string; // AI-generated clarification question
  suggest: Array<{
    // AI-generated response suggestions
    answer: string; // Complete suggested answer
  }>;
}
```

**Source:** [`askFollowupQuestionTool.ts`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/askFollowupQuestionTool.ts#L32)

**Usage Context:** Serialized when AI needs clarification from user

**Example:**

```json
{
  "question": "Which configuration file should I modify?",
  "suggest": [
    { "answer": "./src/config.json" },
    { "answer": "./config/database.json" },
    { "answer": "./app.config.js" }
  ]
}
```

---

### MCP Integration Structures

#### [`ClineAskUseMcpServer`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/useMcpToolTool.ts#L28) - MCP Server Operations

Handles both MCP tool usage and resource access requests.

```typescript
interface ClineAskUseMcpServer {
  serverName: string; // MCP server identifier
  type: "use_mcp_tool" | "access_mcp_resource";

  // Tool usage properties
  toolName?: string; // Tool name for use_mcp_tool
  arguments?: string; // JSON string of tool arguments

  // Resource access properties
  uri?: string; // Resource URI for access_mcp_resource
}
```

**Source Files:**

- [`useMcpToolTool.ts`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/useMcpToolTool.ts#L28): MCP tool execution
- [`accessMcpResourceTool.ts`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/accessMcpResourceTool.ts#L19): MCP resource access

**Usage Context:** Used in MCP server approval requests

**Examples:**

```json
// Tool usage
{
	"serverName": "file-system",
	"type": "use_mcp_tool",
	"toolName": "read_file",
	"arguments": "{\"path\": \"/tmp/example.txt\"}"
}

// Resource access
{
	"serverName": "web-scraper",
	"type": "access_mcp_resource",
	"uri": "https://example.com/api/data"
}
```

---

### API and System Messages

#### ClineApiReqInfo - API Request Information

Tracks API request details including token usage and costs.

```typescript
interface ClineApiReqInfo {
  request?: string; // API request description
  tokensIn?: number; // Input tokens consumed
  tokensOut?: number; // Output tokens generated
  cacheWrites?: number; // Cache write operations
  cacheReads?: number; // Cache read operations
  cost?: number; // Request cost in USD
  cancelReason?: "streaming_failed" | "user_cancelled";
  streamingFailedMessage?: string; // Error message if streaming failed
}
```

**Usage Context:** Serialized in API request tracking messages

#### [`TaskCreationData`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/newTaskTool.ts#L22) - New Task Requests

Contains information for creating new task instances.

```typescript
interface TaskCreationData {
  tool: "newTask";
  mode: string; // Target mode name
  message?: string; // Task message content
  content?: string; // Task content
}
```

**Source:** [`newTaskTool.ts`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/newTaskTool.ts#L22)

**Usage Context:** Used in new task creation approval requests

**Example:**

```json
{
  "tool": "newTask",
  "mode": "Code",
  "content": "Create a new React component"
}
```

#### [`ModeSwitchData`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/switchModeTool.ts#L21) - Mode Switch Requests

Contains information for switching between different operational modes.

```typescript
interface ModeSwitchData {
  tool: "switchMode";
  mode: string; // Target mode slug
  reason?: string; // Reason for mode switch
}
```

**Source:** [`switchModeTool.ts`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/switchModeTool.ts#L21)

**Usage Context:** Used in mode switch approval requests

**Example:**

```json
{
  "tool": "switchMode",
  "mode": "debug",
  "reason": "Need to investigate test failures"
}
```

#### [`InstructionFetchData`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/fetchInstructionsTool.ts#L15) - Instruction Requests

Handles requests for fetching specific instructions or guidelines.

```typescript
interface InstructionFetchData {
  tool: "fetchInstructions";
  content?: string; // Instruction type requested
}
```

**Source:** [`fetchInstructionsTool.ts`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/fetchInstructionsTool.ts#L15)

**Usage Context:** Used when requesting specific instructions

**Example:**

```json
{
  "tool": "fetchInstructions",
  "content": "create_mcp_server"
}
```

#### [`CodebaseSearchResult`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/codebaseSearchTool.ts#L123) - Search Results

Contains semantic search results from codebase analysis.

```typescript
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

**Source:** [`codebaseSearchTool.ts`](https://github.com/RooCodeInc/Roo-Code/tree/main/src/core/tools/codebaseSearchTool.ts#L123)

**Usage Context:** Serialized in codebase search result messages

**Example:**

```json
{
  "tool": "codebaseSearch",
  "content": {
    "query": "authentication logic",
    "results": [
      {
        "filePath": "src/auth/auth.service.ts",
        "score": 0.95,
        "startLine": 10,
        "endLine": 25,
        "codeChunk": "class AuthService {\n  authenticate(user) {\n    // logic\n  }\n}"
      }
    ]
  }
}
```

---

### Parsing Guidelines

#### Safe JSON Parsing

Always use defensive parsing when handling ClineMessage text fields:

```typescript
function safeParseMessageText<T>(
  message: ClineMessage,
  defaultValue: T,
): T | string {
  if (!message.text) return defaultValue;

  try {
    return JSON.parse(message.text) as T;
  } catch {
    // Return as plain text if JSON parsing fails
    return message.text;
  }
}

// Usage examples
const toolInfo = safeParseMessageText<ClineSayTool>(message, {
  tool: "readFile",
});
const commandStatus = safeParseMessageText<CommandExecutionStatus>(message, {
  executionId: "",
  status: "started",
});
const mcpRequest = safeParseMessageText<ClineAskUseMcpServer>(message, {
  serverName: "",
  type: "use_mcp_tool",
});
```

#### Type-Safe Parsing by Message Type

```typescript
function parseByMessageType(message: ClineMessage) {
  if (!message.text) return null;

  try {
    const parsed = JSON.parse(message.text);

    // Parse based on message context
    if (message.ask === "tool") {
      return parsed as ClineSayTool;
    } else if (message.ask === "use_mcp_server") {
      return parsed as ClineAskUseMcpServer;
    } else if (message.ask === "followup") {
      return parsed as FollowupQuestionData;
    } else if (
      message.say === "api_req_started" ||
      message.say === "api_req_finished"
    ) {
      return parsed as ClineApiReqInfo;
    } else if (message.say === "browser_action") {
      return parsed as ClineSayBrowserAction;
    } else if (message.say === "browser_action_result") {
      return parsed as BrowserActionResult;
    }

    return parsed;
  } catch (error) {
    // Return plain text for non-JSON content
    return message.text;
  }
}
```

#### Validation Helpers

```typescript
function isToolMessage(message: ClineMessage): boolean {
  return message.ask === "tool" && !!message.text;
}

function isBrowserActionMessage(message: ClineMessage): boolean {
  return message.say === "browser_action" && !!message.text;
}

function isCommandStatusMessage(message: ClineMessage): boolean {
  try {
    if (!message.text) return false;
    const parsed = JSON.parse(message.text);
    return (
      typeof parsed.executionId === "string" &&
      typeof parsed.status === "string"
    );
  } catch {
    return false;
  }
}

function isMcpMessage(message: ClineMessage): boolean {
  return message.ask === "use_mcp_server" && !!message.text;
}
```

---

### Complete Type Definitions

#### Union Type for All JSON Structures

```typescript
type ClineMessageJsonContent =
  | ClineSayTool
  | CommandExecutionStatus
  | McpExecutionStatus
  | BrowserActionResult
  | ClineSayBrowserAction
  | FollowupQuestionData
  | ClineAskUseMcpServer
  | ClineApiReqInfo
  | TaskCreationData
  | ModeSwitchData
  | InstructionFetchData
  | CodebaseSearchResult;
```

#### Comprehensive Parsing Function

```typescript
function parseMessageJsonContent(
  message: ClineMessage,
): ClineMessageJsonContent | string | null {
  if (!message.text) return null;

  try {
    const parsed = JSON.parse(message.text);

    // Validate and return appropriate type based on context
    if (message.ask === "tool" && parsed.tool) {
      return parsed as ClineSayTool;
    }
    if (message.ask === "use_mcp_server" && parsed.serverName) {
      return parsed as ClineAskUseMcpServer;
    }
    if (message.ask === "followup" && parsed.question) {
      return parsed as FollowupQuestionData;
    }
    if (parsed.executionId && parsed.status) {
      // Could be CommandExecutionStatus or McpExecutionStatus
      if (parsed.serverName || parsed.toolName) {
        return parsed as McpExecutionStatus;
      }
      return parsed as CommandExecutionStatus;
    }
    if (parsed.action && typeof parsed.action === "string") {
      return parsed as ClineSayBrowserAction;
    }
    if (parsed.screenshot || parsed.logs) {
      return parsed as BrowserActionResult;
    }
    if (parsed.tool === "newTask") {
      return parsed as TaskCreationData;
    }
    if (parsed.tool === "switchMode") {
      return parsed as ModeSwitchData;
    }
    if (parsed.tool === "fetchInstructions") {
      return parsed as InstructionFetchData;
    }
    if (parsed.tool === "codebaseSearch") {
      return parsed as CodebaseSearchResult;
    }

    // Return generic parsed object if no specific type matches
    return parsed;
  } catch {
    // Return as plain text if parsing fails
    return message.text;
  }
}
```

#### Message Type Guards

```typescript
function isClineSayTool(obj: any): obj is ClineSayTool {
  return obj && typeof obj.tool === "string";
}

function isCommandExecutionStatus(obj: any): obj is CommandExecutionStatus {
  return (
    obj &&
    typeof obj.executionId === "string" &&
    typeof obj.status === "string" &&
    !obj.serverName
  );
}

function isMcpExecutionStatus(obj: any): obj is McpExecutionStatus {
  return (
    obj &&
    typeof obj.executionId === "string" &&
    typeof obj.status === "string" &&
    obj.serverName
  );
}

function isBrowserActionResult(obj: any): obj is BrowserActionResult {
  return obj && (obj.screenshot || obj.logs || obj.currentUrl);
}

function isFollowupQuestionData(obj: any): obj is FollowupQuestionData {
  return obj && typeof obj.question === "string" && Array.isArray(obj.suggest);
}

function isClineAskUseMcpServer(obj: any): obj is ClineAskUseMcpServer {
  return (
    obj && typeof obj.serverName === "string" && typeof obj.type === "string"
  );
}
```

**Best Practices:**

1. **Always use try-catch** when parsing JSON from the `text` field
2. **Use type guards** to validate structure before accessing properties
3. **Provide default objects** when `text` might be undefined
4. **Check message type/say/ask** before parsing to ensure you're handling the right structure
5. **Handle both plain text and JSON** gracefully in your parsing logic
6. **Use the comprehensive parsing function** for robust message handling
7. **Validate data structure** even with TypeScript assertions for runtime safety

**Usage Examples:**

```typescript
// Example: Processing messages with comprehensive parsing
api.on("message", ({ message }) => {
  const parsed = parseMessageJsonContent(message);

  if (typeof parsed === "string") {
    // Plain text message
    console.log("Text message:", parsed);
  } else if (parsed && isClineSayTool(parsed)) {
    // Tool operation
    console.log(`Tool ${parsed.tool} for path: ${parsed.path}`);
  } else if (parsed && isCommandExecutionStatus(parsed)) {
    // Command execution status
    console.log(`Command ${parsed.executionId}: ${parsed.status}`);
  } else if (parsed && isFollowupQuestionData(parsed)) {
    // AI question
    console.log(`Question: ${parsed.question}`);
    console.log(
      `Suggestions: ${parsed.suggest.map((s) => s.answer).join(", ")}`,
    );
  }
});
```

This comprehensive reference covers ALL JSON structures that can appear in ClineMessage text fields based on analysis of all tool implementations in the Roo Code API. Each structure is sourced from specific tool implementations and serves distinct purposes in the event system.

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
// Example tool usage data
const exampleToolUsage: ToolUsage = {
  read_file: {
    attempts: 25,
    failures: 0,
  },
  write_to_file: {
    attempts: 8,
    failures: 1,
  },
  execute_command: {
    attempts: 12,
    failures: 2,
  },
  search_files: {
    attempts: 5,
    failures: 0,
  },
  apply_diff: {
    attempts: 15,
    failures: 3,
  },
  browser_action: {
    attempts: 3,
    failures: 1,
  },
};
```

### Tool Success Rates

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

Roo Code uses Inter-Process Communication for coordination between different components and external integrations.

### IPC Message Types

```typescript
enum IpcMessageType {
  Connect = "Connect", // Client connection
  Disconnect = "Disconnect", // Client disconnection
  Ack = "Ack", // Acknowledgment
  TaskCommand = "TaskCommand", // Task control commands
  TaskEvent = "TaskEvent", // Task status events
}

enum IpcOrigin {
  Client = "client", // Message from client
  Server = "server", // Message from server
}
```

### IPC Message Structure

```typescript
type IpcMessage = AckMessage | TaskCommandMessage | TaskEventMessage;

interface AckMessage {
  type: "Ack";
  origin: "server";
  data: {
    clientId: string; // Unique client identifier
    pid: number; // Process ID
    ppid: number; // Parent process ID
  };
}

interface TaskCommandMessage {
  type: "TaskCommand";
  origin: "client";
  clientId: string;
  data: TaskCommand;
}

interface TaskEventMessage {
  type: "TaskEvent";
  origin: "server";
  relayClientId?: string; // Optional relay target
  data: TaskEvent;
}
```

### Task Commands

```typescript
enum TaskCommandName {
  StartNewTask = "StartNewTask",
  CancelTask = "CancelTask",
  CloseTask = "CloseTask",
}

type TaskCommand = StartNewTaskCommand | CancelTaskCommand | CloseTaskCommand;

interface StartNewTaskCommand {
  commandName: "StartNewTask";
  data: {
    configuration: RooCodeSettings;
    text: string;
    images?: string[];
    newTab?: boolean;
  };
}

interface CancelTaskCommand {
  commandName: "CancelTask";
  data: string; // Task ID to cancel
}

interface CloseTaskCommand {
  commandName: "CloseTask";
  data: string; // Task ID to close
}
```

### Task Events

Task events are propagated through IPC for monitoring and coordination:

```typescript
interface TaskEvent {
  eventName: RooCodeEventName;
  payload: any[]; // Event-specific payload
  taskId?: number; // Optional task identifier
}

// Examples of task events
const messageEvent: TaskEvent = {
  eventName: "message",
  payload: [
    {
      taskId: "task-123",
      action: "created",
      message: {
        /* ClineMessage */
      },
    },
  ],
};

const completedEvent: TaskEvent = {
  eventName: "taskCompleted",
  payload: ["task-123", tokenUsage, toolUsage],
};
```

### IPC Server Interface

```typescript
interface RooCodeIpcServer extends EventEmitter<IpcServerEvents> {
  listen(): void; // Start listening
  broadcast(message: IpcMessage): void; // Send to all clients
  send(client: string | Socket, message: IpcMessage): void; // Send to specific client
  get socketPath(): string; // Get socket path
  get isListening(): boolean; // Check listening status
}

type IpcServerEvents = {
  Connect: [clientId: string];
  Disconnect: [clientId: string];
  TaskCommand: [clientId: string, data: TaskCommand];
  TaskEvent: [relayClientId: string | undefined, data: TaskEvent];
};
```

---

## MCP Integration

Model Context Protocol (MCP) enables integration with external tools and services.

### MCP Execution Status

```typescript
type McpExecutionStatus =
  | McpStartedStatus
  | McpOutputStatus
  | McpCompletedStatus
  | McpErrorStatus;

interface McpStartedStatus {
  executionId: string;
  status: "started";
  serverName: string; // MCP server identifier
  toolName: string; // Tool being executed
}

interface McpOutputStatus {
  executionId: string;
  status: "output";
  response: string; // Intermediate output
}

interface McpCompletedStatus {
  executionId: string;
  status: "completed";
  response?: string; // Final result
}

interface McpErrorStatus {
  executionId: string;
  status: "error";
  error?: string; // Error description
}
```

### MCP Tool Usage

```typescript
// Using an MCP tool
const mcpToolResult = await api.useMcpTool({
  serverName: "filesystem",
  toolName: "read_directory",
  arguments: {
    path: "/project/src",
    recursive: true,
  },
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
    {
      attempts: number;
      failures: number;
    }
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

  private recordFailure(toolName: ToolName) {
    const stats = this.toolStats.get(toolName) || {
      attempts: 0,
      failures: 0,
    };
    stats.failures++;
    this.toolStats.set(toolName, stats);
  }

  private updateStats(toolUsage: ToolUsage) {
    for (const [toolName, usage] of Object.entries(toolUsage)) {
      this.toolStats.set(toolName as ToolName, usage);
    }
  }

  private reportStats() {
    console.log("=== Tool Usage Statistics ===");
    for (const [toolName, stats] of this.toolStats) {
      const successRate =
        stats.attempts > 0
          ? (
              ((stats.attempts - stats.failures) / stats.attempts) *
              100
            ).toFixed(1)
          : "0.0";
      console.log(
        `${toolName}: ${stats.attempts} attempts, ${stats.failures} failures (${successRate}% success)`,
      );
    }
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

      this.socket.on("connect", () => {
        console.log("Connected to Roo Code IPC server");
        resolve();
      });

      this.socket.on("data", (data) => {
        this.handleMessage(data.toString());
      });

      this.socket.on("error", (error) => {
        console.error("IPC connection error:", error);
        reject(error);
      });

      this.socket.on("close", () => {
        console.log("IPC connection closed");
        this.emit("disconnect");
      });
    });
  }

  private handleMessage(data: string) {
    try {
      const message: IpcMessage = JSON.parse(data);

      switch (message.type) {
        case "Ack":
          console.log("Received acknowledgment:", message.data);
          break;
        case "TaskEvent":
          this.emit("taskEvent", message.data);
          break;
      }
    } catch (error) {
      console.error("Failed to parse IPC message:", error);
    }
  }

  async startNewTask(
    config: RooCodeSettings,
    text: string,
    images?: string[],
  ): Promise<void> {
    const command: TaskCommand = {
      commandName: "StartNewTask",
      data: {
        configuration: config,
        text,
        images,
      },
    };

    const message: IpcMessage = {
      type: "TaskCommand",
      origin: "client",
      clientId: this.clientId,
      data: command,
    };

    this.sendMessage(message);
  }

  private sendMessage(message: IpcMessage) {
    if (this.socket) {
      this.socket.write(JSON.stringify(message) + "\n");
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.end();
    }
  }
}
```

### MCP Tool Integration

```typescript
class McpToolManager {
  private executionStatus = new Map<string, McpExecutionStatus>();

  constructor(private api: RooCodeAPI) {
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.api.on("message", ({ message }) => {
      if (message.say === "mcp_server_request_started") {
        // Track MCP execution start
        this.handleMcpStarted(message.text);
      } else if (message.say === "mcp_server_response") {
        // Handle MCP response
        this.handleMcpResponse(message.text);
      }
    });
  }

  async executeFileSystemTool(operation: string, path: string): Promise<any> {
    try {
      const result = await this.api.useMcpTool({
        serverName: "filesystem",
        toolName: operation,
        arguments: { path },
      });

      return result;
    } catch (error) {
      console.error(`MCP filesystem tool failed:`, error);
      throw error;
    }
  }

  async queryDatabase(query: string): Promise<any> {
    try {
      const result = await this.api.useMcpTool({
        serverName: "database",
        toolName: "execute_query",
        arguments: { sql: query },
      });

      return result;
    } catch (error) {
      console.error(`MCP database query failed:`, error);
      throw error;
    }
  }

  private handleMcpStarted(text?: string) {
    // Parse execution start information
    // Implementation depends on message format
  }

  private handleMcpResponse(text?: string) {
    // Parse execution response
    // Implementation depends on message format
  }
}
```

This comprehensive tools system enables Roo Code to provide powerful automation capabilities while maintaining secure, monitored, and trackable interactions with the development environment and external services.
