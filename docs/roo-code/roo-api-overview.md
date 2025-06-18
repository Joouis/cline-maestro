# RooCode API Documentation

Comprehensive documentation for all RooCode API interfaces, types, and their relationships.

## Table of Contents

1. [Overview](#overview)
2. [Core API Interfaces](#core-api-interfaces)
3. [Event System](#event-system)
4. [Configuration Types](#configuration-types)
5. [Message Types](#message-types)
6. [Tool System](#tool-system)
7. [IPC Communication](#ipc-communication)
8. [Provider Settings](#provider-settings)
9. [Mode Configuration](#mode-configuration)
10. [Usage Examples](#usage-examples)

---

## Overview

The RooCode API provides a comprehensive interface for integrating with and extending the RooCode VS Code extension. The API is built around three main interfaces:

- **[`RooCodeAPI`](packages/types/src/api.ts:26)** - Main API interface for task management and configuration
- **[`RooCodeAPIEvents`](packages/types/src/api.ts:11)** - Event system for monitoring task lifecycle
- **[`RooCodeIpcServer`](packages/types/src/api.ts:153)** - IPC server for inter-process communication

### Key Features

- **Task Management**: Create, resume, pause, and control AI-assisted tasks
- **Event-Driven Architecture**: Real-time notifications of task state changes
- **Configuration Management**: Manage API provider settings and profiles
- **Tool Integration**: Access to file operations, command execution, and browser automation
- **Mode System**: Support for specialized AI modes with different capabilities
- **IPC Communication**: Inter-process communication for external integrations

---

## Core API Interfaces

### RooCodeAPI

The main API interface that extends EventEmitter with RooCode-specific events.

```typescript
interface RooCodeAPI extends EventEmitter<RooCodeAPIEvents> {
  // Task Management
  startNewTask(options: StartNewTaskOptions): Promise<string>;
  resumeTask(taskId: string): Promise<void>;
  clearCurrentTask(lastMessage?: string): Promise<void>;
  cancelCurrentTask(): Promise<void>;

  // Task Communication
  sendMessage(message?: string, images?: string[]): Promise<void>;
  pressPrimaryButton(): Promise<void>;
  pressSecondaryButton(): Promise<void>;

  // Task Information
  isTaskInHistory(taskId: string): Promise<boolean>;
  getCurrentTaskStack(): string[];

  // Configuration Management
  getConfiguration(): RooCodeSettings;
  setConfiguration(values: RooCodeSettings): Promise<void>;

  // Profile Management
  getProfiles(): string[];
  getProfileEntry(name: string): ProviderSettingsEntry | undefined;
  createProfile(
    name: string,
    profile?: ProviderSettings,
    activate?: boolean,
  ): Promise<string>;
  updateProfile(
    name: string,
    profile: ProviderSettings,
    activate?: boolean,
  ): Promise<string | undefined>;
  upsertProfile(
    name: string,
    profile: ProviderSettings,
    activate?: boolean,
  ): Promise<string | undefined>;
  deleteProfile(name: string): Promise<void>;
  getActiveProfile(): string | undefined;
  setActiveProfile(name: string): Promise<string | undefined>;

  // System Status
  isReady(): boolean;
}
```

#### StartNewTaskOptions

```typescript
interface StartNewTaskOptions {
  configuration?: RooCodeSettings; // Optional configuration override
  text?: string; // Initial task message
  images?: string[]; // Array of image data URIs
  newTab?: boolean; // Whether to open in new tab
}
```

### RooCodeIpcServer

IPC server interface for inter-process communication.

```typescript
interface RooCodeIpcServer extends EventEmitter<IpcServerEvents> {
  listen(): void; // Start listening for connections
  broadcast(message: IpcMessage): void; // Broadcast to all clients
  send(client: string | Socket, message: IpcMessage): void; // Send to specific client
  get socketPath(): string; // Unix socket path
  get isListening(): boolean; // Server status
}
```

---

## Event System

### RooCodeAPIEvents

The event system provides real-time notifications about task lifecycle and system state changes.

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

#### Event Descriptions

- **`message`**: Fired when a message is created or updated in a task
- **`taskCreated`**: A new task has been created
- **`taskStarted`**: A task has begun execution
- **`taskModeSwitched`**: Task switched to a different AI mode
- **`taskPaused`**: Task execution has been paused
- **`taskUnpaused`**: Task execution has resumed
- **`taskAskResponded`**: User has responded to a task's question
- **`taskAborted`**: Task was cancelled or aborted
- **`taskSpawned`**: A task created a subtask
- **`taskCompleted`**: Task finished with usage statistics
- **`taskTokenUsageUpdated`**: Token usage metrics updated
- **`taskToolFailed`**: A tool operation failed

---

## Configuration Types

### RooCodeSettings

Combined settings type that includes both global settings and provider settings.

```typescript
type RooCodeSettings = GlobalSettings & ProviderSettings;
```

### GlobalSettings

Application-wide configuration options.

```typescript
interface GlobalSettings {
  // API Configuration
  currentApiConfigName?: string;
  listApiConfigMeta?: ProviderSettingsEntry[];
  pinnedApiConfigs?: Record<string, boolean>;

  // Task Behavior
  autoApprovalEnabled?: boolean;
  alwaysAllowReadOnly?: boolean;
  alwaysAllowReadOnlyOutsideWorkspace?: boolean;
  alwaysAllowWrite?: boolean;
  alwaysAllowWriteOutsideWorkspace?: boolean;
  alwaysAllowWriteProtected?: boolean;
  writeDelayMs?: number;
  alwaysAllowBrowser?: boolean;
  alwaysApproveResubmit?: boolean;
  requestDelaySeconds?: number;
  alwaysAllowMcp?: boolean;
  alwaysAllowModeSwitch?: boolean;
  alwaysAllowSubtasks?: boolean;
  alwaysAllowExecute?: boolean;
  allowedCommands?: string[];
  allowedMaxRequests?: number | null;

  // Context Management
  autoCondenseContext?: boolean;
  autoCondenseContextPercent?: number;
  maxConcurrentFileReads?: number;
  maxOpenTabsContext?: number;
  maxWorkspaceFiles?: number;
  maxReadFileLine?: number;

  // Browser Integration
  browserToolEnabled?: boolean;
  browserViewportSize?: string;
  screenshotQuality?: number;
  remoteBrowserEnabled?: boolean;
  remoteBrowserHost?: string;
  cachedChromeHostUrl?: string;

  // Terminal Configuration
  terminalOutputLineLimit?: number;
  terminalShellIntegrationTimeout?: number;
  terminalShellIntegrationDisabled?: boolean;
  terminalCommandDelay?: number;
  terminalPowershellCounter?: boolean;
  terminalZshClearEolMark?: boolean;
  terminalZshOhMy?: boolean;
  terminalZshP10k?: boolean;
  terminalZdotdir?: boolean;
  terminalCompressProgressBar?: boolean;

  // Audio/Visual
  ttsEnabled?: boolean;
  ttsSpeed?: number;
  soundEnabled?: boolean;
  soundVolume?: number;

  // System Features
  enableCheckpoints?: boolean;
  rateLimitSeconds?: number;
  diffEnabled?: boolean;
  fuzzyMatchThreshold?: number;
  mcpEnabled?: boolean;
  enableMcpServerCreation?: boolean;

  // UI Configuration
  language?: string;
  telemetrySetting?: string;
  showRooIgnoredFiles?: boolean;
  historyPreviewCollapsed?: boolean;

  // Mode System
  mode?: string;
  modeApiConfigs?: Record<string, string>;
  customModes?: ModeConfig[];
  customModePrompts?: CustomModePrompts;
  customSupportPrompts?: CustomSupportPrompts;
  enhancementApiConfigId?: string;

  // User Customization
  customInstructions?: string;
  taskHistory?: HistoryItem[];
  lastShownAnnouncementId?: string;

  // Context Condensing
  condensingApiConfigId?: string;
  customCondensingPrompt?: string;

  // Codebase Index
  codebaseIndexModels?: CodebaseIndexModels;
  codebaseIndexConfig?: CodebaseIndexConfig;

  // Experiments
  experiments?: Experiments;
}
```

---

## Message Types

### ClineMessage

Represents a message in the conversation between user and AI.

```typescript
interface ClineMessage {
  ts: number; // Timestamp
  type: "ask" | "say"; // Message type
  ask?: ClineAsk; // Ask type (if type is "ask")
  say?: ClineSay; // Say type (if type is "say")
  text?: string; // Message content
  images?: string[]; // Attached images
  partial?: boolean; // Is message still being generated
  reasoning?: string; // AI reasoning (internal)
  conversationHistoryIndex?: number; // Position in conversation
  checkpoint?: Record<string, unknown>; // State checkpoint
  progressStatus?: ToolProgressStatus; // Tool progress info
  contextCondense?: ContextCondense; // Context condensation info
  isProtected?: boolean; // Message protection flag
}
```

### ClineAsk Types

Requests for user interaction or approval:

```typescript
type ClineAsk =
  | "followup" // Clarifying question
  | "command" // Terminal command permission
  | "command_output" // Command output permission
  | "completion_result" // Task completion confirmation
  | "tool" // Tool usage permission
  | "api_req_failed" // API retry permission
  | "resume_task" // Resume task confirmation
  | "resume_completed_task" // Resume completed task
  | "mistake_limit_reached" // Error limit guidance
  | "browser_action_launch" // Browser permission
  | "use_mcp_server" // MCP server permission
  | "auto_approval_max_req_reached"; // Manual approval required
```

### ClineSay Types

Different types of AI responses:

```typescript
type ClineSay =
  | "error" // Error message
  | "api_req_started" // API request started
  | "api_req_finished" // API request completed
  | "api_req_retried" // API request retried
  | "api_req_retry_delayed" // Retry delayed
  | "api_req_deleted" // Request cancelled
  | "text" // General text
  | "reasoning" // AI reasoning
  | "completion_result" // Task result
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
  | "diff_error" // Diff error
  | "condense_context" // Context condensation
  | "condense_context_error" // Condensation error
  | "codebase_search_result"; // Search results
```

### TokenUsage

Tracks API token consumption and costs.

```typescript
interface TokenUsage {
  totalTokensIn: number; // Input tokens consumed
  totalTokensOut: number; // Output tokens generated
  totalCacheWrites?: number; // Cache write operations
  totalCacheReads?: number; // Cache read operations
  totalCost: number; // Total API cost
  contextTokens: number; // Context tokens used
}
```

---

## Tool System

### ToolName

Available tools for AI operations:

```typescript
type ToolName =
  | "execute_command" // Execute terminal commands
  | "read_file" // Read file contents
  | "write_to_file" // Write/create files
  | "apply_diff" // Apply code diffs
  | "insert_content" // Insert content into files
  | "search_and_replace" // Find and replace text
  | "search_files" // Search across files
  | "list_files" // List directory contents
  | "list_code_definition_names" // Extract code definitions
  | "browser_action" // Browser automation
  | "use_mcp_tool" // Use MCP tools
  | "access_mcp_resource" // Access MCP resources
  | "ask_followup_question" // Ask user questions
  | "attempt_completion" // Mark task complete
  | "switch_mode" // Change AI mode
  | "new_task" // Create new task
  | "fetch_instructions" // Get mode instructions
  | "codebase_search"; // Semantic code search
```

### ToolGroup

Tool categories for mode configuration:

```typescript
type ToolGroup =
  | "read" // File reading operations
  | "edit" // File editing operations
  | "browser" // Browser automation
  | "command" // Terminal commands
  | "mcp" // MCP integrations
  | "modes"; // Mode switching
```

### ToolUsage

Tracks tool usage statistics:

```typescript
type ToolUsage = Record<
  ToolName,
  {
    attempts: number; // Number of times tool was attempted
    failures: number; // Number of failures
  }
>;
```

---

## IPC Communication

### IpcMessage Types

Messages for inter-process communication:

```typescript
type IpcMessage =
  | {
      type: "Ack";
      origin: "server";
      data: Ack;
    }
  | {
      type: "TaskCommand";
      origin: "client";
      clientId: string;
      data: TaskCommand;
    }
  | {
      type: "TaskEvent";
      origin: "server";
      relayClientId?: string;
      data: TaskEvent;
    };
```

### TaskCommand

Commands sent from clients to server:

```typescript
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

### TaskEvent

Events sent from server to clients:

```typescript
interface TaskEvent {
  eventName: RooCodeEventName;
  payload: EventPayload; // Type varies by event
  taskId?: number; // Optional task ID
}
```

---

## Provider Settings

### ProviderName

Supported AI providers:

```typescript
type ProviderName =
  | "anthropic" // Anthropic Claude
  | "openai" // OpenAI GPT
  | "openai-native" // OpenAI Native API
  | "openrouter" // OpenRouter
  | "bedrock" // AWS Bedrock
  | "vertex" // Google Vertex AI
  | "gemini" // Google Gemini
  | "ollama" // Ollama
  | "vscode-lm" // VS Code Language Models
  | "lmstudio" // LM Studio
  | "mistral" // Mistral AI
  | "deepseek" // DeepSeek
  | "groq" // Groq
  | "xai" // xAI
  | "glama" // Glama
  | "unbound" // Unbound
  | "requesty" // Requesty
  | "chutes" // Chutes
  | "litellm" // LiteLLM
  | "human-relay" // Human Relay
  | "fake-ai"; // Testing/Debug
```

### ProviderSettingsEntry

Provider profile metadata:

```typescript
interface ProviderSettingsEntry {
  id: string; // Unique profile ID
  name: string; // Display name
  apiProvider?: ProviderName; // Provider type
}
```

### ProviderSettings

Provider-specific configuration settings. Each provider has its own set of configuration options:

```typescript
interface ProviderSettings {
  apiProvider?: ProviderName;

  // Base settings (common to all providers)
  includeMaxTokens?: boolean;
  diffEnabled?: boolean;
  fuzzyMatchThreshold?: number;
  modelTemperature?: number | null;
  rateLimitSeconds?: number;
  enableReasoningEffort?: boolean;
  reasoningEffort?: ReasoningEffort;
  modelMaxTokens?: number;
  modelMaxThinkingTokens?: number;

  // Provider-specific settings (examples)
  apiKey?: string; // Anthropic, OpenAI, etc.
  apiModelId?: string; // Model ID
  anthropicBaseUrl?: string; // Custom base URL
  openAiBaseUrl?: string; // OpenAI base URL
  awsRegion?: string; // Bedrock region
  // ... many more provider-specific options
}
```

---

## Mode Configuration

### ModeConfig

Configuration for custom AI modes:

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

### GroupEntry

Tool group with optional configuration:

```typescript
type GroupEntry = ToolGroup | [ToolGroup, GroupOptions];

interface GroupOptions {
  fileRegex?: string; // File pattern restriction
  description?: string; // Group description
}
```

---

## Usage Examples

### Basic Task Management

```typescript
import { RooCodeAPI } from "@roo-code/types";

// Start a new task
const taskId = await api.startNewTask({
  text: "Create a simple web server",
  configuration: {
    apiProvider: "anthropic",
    apiModelId: "claude-3-5-sonnet-20241022",
  },
});

// Listen for task events
api.on("taskCompleted", (taskId, tokenUsage, toolUsage) => {
  console.log(`Task ${taskId} completed`);
  console.log(
    `Tokens used: ${tokenUsage.totalTokensIn + tokenUsage.totalTokensOut}`,
  );
  console.log(`Cost: $${tokenUsage.totalCost}`);
});

// Send additional messages
await api.sendMessage("Make it use Express.js");

// Cancel if needed
await api.cancelCurrentTask();
```

### Profile Management

```typescript
// Create a new provider profile
const profileId = await api.createProfile("Production", {
  apiProvider: "openai",
  apiModelId: "gpt-4",
  modelTemperature: 0.1,
  rateLimitSeconds: 2,
});

// Switch to the profile
await api.setActiveProfile("Production");

// Get all available profiles
const profiles = api.getProfiles();
console.log("Available profiles:", profiles);
```

### Event Monitoring

```typescript
// Monitor all task events
api.on("taskCreated", (taskId) => {
  console.log(`New task created: ${taskId}`);
});

api.on("taskStarted", (taskId) => {
  console.log(`Task started: ${taskId}`);
});

api.on("message", ({ taskId, action, message }) => {
  if (message.type === "ask") {
    console.log(`Task ${taskId} is asking: ${message.text}`);
  }
});

api.on("taskToolFailed", (taskId, toolName, error) => {
  console.error(`Tool ${toolName} failed in task ${taskId}: ${error}`);
});
```

### Configuration Management

```typescript
// Get current settings
const config = api.getConfiguration();

// Update specific settings
await api.setConfiguration({
  ...config,
  autoApprovalEnabled: true,
  alwaysAllowReadOnly: true,
  maxConcurrentFileReads: 50,
});

// Check if API is ready
if (api.isReady()) {
  console.log("API is ready for use");
}
```

### IPC Server Usage

```typescript
import { RooCodeIpcServer } from "@roo-code/types";

// Start IPC server
server.listen();

// Handle client connections
server.on("Connect", (clientId) => {
  console.log(`Client connected: ${clientId}`);
});

// Handle task commands from clients
server.on("TaskCommand", (clientId, command) => {
  if (command.commandName === "StartNewTask") {
    console.log(`Client ${clientId} starting task:`, command.data.text);
  }
});

// Broadcast events to all clients
server.broadcast({
  type: "TaskEvent",
  origin: "server",
  data: {
    eventName: "TaskCompleted",
    payload: [taskId, tokenUsage, toolUsage],
  },
});
```

---

## Type Safety

All types are defined using Zod schemas for runtime validation:

```typescript
import { rooCodeSettingsSchema, clineMessageSchema } from "@roo-code/types";

// Validate configuration at runtime
const config = rooCodeSettingsSchema.parse(userInput);

// Validate messages
const message = clineMessageSchema.parse(messageData);
```

This ensures type safety both at compile time (TypeScript) and runtime (Zod validation).

---

## Related Documentation

- **Tool Usage**: See individual tool documentation for specific parameters and examples
- **Provider Setup**: Refer to provider-specific configuration guides
- **Mode Development**: Check mode creation documentation for custom AI assistants
- **Extension API**: See VS Code extension API for additional integration options

For more detailed information about specific interfaces or types, refer to the source files in [`packages/types/src/`](packages/types/src/).
