# Roo Code API Overview

The Roo Code API provides programmatic access to Roo Code's core functionality through well-defined TypeScript interfaces. This document covers the main API interfaces and configuration types.

## Table of Contents

1. [RooCodeAPI Interface](#roocodeapi-interface)
2. [RooCodeSettings Type](#roocodesettings-type)
3. [RooCodeIpcServer Interface](#roocodeipcserver-interface)
4. [Configuration Management](#configuration-management)
5. [Profile Management](#profile-management)
6. [Usage Examples](#usage-examples)

---

## RooCodeAPI Interface

The main API interface that extends EventEmitter to provide task management and configuration capabilities.

```typescript
interface RooCodeAPI extends EventEmitter<RooCodeAPIEvents> {
  // Task Management
  startNewTask(params: StartTaskParams): Promise<string>;
  resumeTask(taskId: string): Promise<void>;
  isTaskInHistory(taskId: string): Promise<boolean>;
  getCurrentTaskStack(): string[];
  clearCurrentTask(lastMessage?: string): Promise<void>;
  cancelCurrentTask(): Promise<void>;

  // Communication
  sendMessage(message?: string, images?: string[]): Promise<void>;
  pressPrimaryButton(): Promise<void>;
  pressSecondaryButton(): Promise<void>;

  // Configuration
  isReady(): boolean;
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
}
```

### Task Management Methods

#### `startNewTask(params: StartTaskParams): Promise<string>`

Creates and starts a new task with optional configuration, text, and images.

**Parameters:**

- `configuration?: RooCodeSettings` - Task-specific configuration overrides
- `text?: string` - Initial message text
- `images?: string[]` - Array of base64-encoded image data URIs
- `newTab?: boolean` - Whether to open the task in a new tab

**Returns:** Promise resolving to the new task ID

**Example:**

```typescript
const taskId = await api.startNewTask({
  configuration: {
    mode: "debug",
    alwaysAllowExecute: true,
  },
  text: "Help me debug this function",
  images: ["data:image/png;base64,iVBORw0KGgoAAAANS..."],
  newTab: true,
});
```

#### `resumeTask(taskId: string): Promise<void>`

Resumes a previously paused or stopped task from the task history.

**Parameters:**

- `taskId: string` - The ID of the task to resume

**Throws:** Error if the task is not found in history

#### `isTaskInHistory(taskId: string): Promise<boolean>`

Checks if a task exists in the task history.

**Parameters:**

- `taskId: string` - The task ID to check

**Returns:** Promise resolving to true if task exists in history

#### `getCurrentTaskStack(): string[]`

Returns the current task stack showing active and parent tasks.

**Returns:** Array of task IDs representing the current task hierarchy

#### `clearCurrentTask(lastMessage?: string): Promise<void>`

Clears the current task with an optional final message.

**Parameters:**

- `lastMessage?: string` - Optional final message to send before clearing

#### `cancelCurrentTask(): Promise<void>`

Cancels the currently active task immediately.

### Communication Methods

#### `sendMessage(message?: string, images?: string[]): Promise<void>`

Sends a message to the current active task.

**Parameters:**

- `message?: string` - Text message to send
- `images?: string[]` - Optional array of base64-encoded images

#### `pressPrimaryButton(): Promise<void>`

Simulates clicking the primary action button in the chat interface (typically "Continue" or "Approve").

#### `pressSecondaryButton(): Promise<void>`

Simulates clicking the secondary action button in the chat interface (typically "Reject" or "Cancel").

### Configuration Methods

#### `isReady(): boolean`

Returns whether the API is initialized and ready for use.

#### `getConfiguration(): RooCodeSettings`

Returns the current configuration settings.

#### `setConfiguration(values: RooCodeSettings): Promise<void>`

Updates the configuration with the provided values.

**Parameters:**

- `values: RooCodeSettings` - Configuration object with settings to update

---

## RooCodeSettings Type

The complete configuration type that combines global settings with provider-specific settings. RooCodeSettings is a union type that brings together GlobalSettings and ProviderSettings to provide a comprehensive configuration interface.

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

### ProviderSettings

Provider-specific configuration options for AI services and integrations.

**For comprehensive ProviderSettings documentation** including all supported AI providers, provider-specific configurations, authentication methods, and profile management, see the [Provider Configuration Guide](roo-api-providers.md).

The ProviderSettings interface includes configurations for 20+ AI providers such as Anthropic Claude, OpenRouter, AWS Bedrock, Google Vertex AI, OpenAI-compatible APIs, and local models like Ollama and LM Studio.

---

## RooCodeIpcServer Interface

Interface for the IPC (Inter-Process Communication) server that handles communication between different processes.

```typescript
interface RooCodeIpcServer extends EventEmitter<IpcServerEvents> {
  listen(): void; // Start listening for connections
  broadcast(message: IpcMessage): void; // Broadcast message to all clients
  send(client: string | Socket, message: IpcMessage): void; // Send to specific client
  get socketPath(): string; // Get the socket path
  get isListening(): boolean; // Check if server is listening
}
```

### IPC Server Methods

#### `listen(): void`

Starts the IPC server and begins listening for client connections.

#### `broadcast(message: IpcMessage): void`

Sends a message to all connected clients.

#### `send(client: string | Socket, message: IpcMessage): void`

Sends a message to a specific client identified by client ID or socket.

---

## Configuration Management

### Global vs Provider Settings

Roo Code uses a hierarchical configuration system:

1. **Global Settings**: Application-wide settings that affect all tasks
2. **Provider Settings**: API provider-specific configurations
3. **Mode Settings**: Mode-specific overrides
4. **Task Settings**: Task-specific configuration overrides

### Configuration Precedence

Settings are applied in order of precedence (highest to lowest):

1. Task-specific configuration (passed to `startNewTask`)
2. Active profile settings
3. Mode-specific settings
4. Global settings
5. Default values

### Secret Management

Sensitive settings (API keys, tokens) are handled separately:

```typescript
const SECRET_STATE_KEYS = [
  "apiKey",
  "glamaApiKey",
  "openRouterApiKey",
  "awsAccessKey",
  "awsSecretKey",
  "awsSessionToken",
  "openAiApiKey",
  "geminiApiKey",
  "openAiNativeApiKey",
  "deepSeekApiKey",
  "mistralApiKey",
  "unboundApiKey",
  "requestyApiKey",
  "xaiApiKey",
  "groqApiKey",
  "chutesApiKey",
  "litellmApiKey",
] as const;
```

---

## Profile Management

Profiles allow users to save and switch between different API configurations.

### Profile Operations

#### Creating Profiles

```typescript
// Create a new profile
const profileId = await api.createProfile(
  "development",
  {
    apiProvider: "anthropic",
    apiKey: "sk-...",
    apiModelId: "claude-3-sonnet-20240229",
  },
  true,
); // true = activate immediately
```

#### Managing Profiles

```typescript
// List all profiles
const profiles = api.getProfiles();

// Get profile details
const profile = api.getProfileEntry("development");

// Update existing profile
await api.updateProfile("development", {
  apiModelId: "claude-3-opus-20240229",
});

// Switch active profile
await api.setActiveProfile("production");

// Delete profile
await api.deleteProfile("old-profile");
```

#### Profile Structure

```typescript
interface ProviderSettingsEntry {
  id: string; // Unique profile ID
  name: string; // Display name
  apiProvider?: ProviderName; // Provider type
}
```

---

## Usage Examples

### Basic Task Management

```typescript
import { RooCodeAPI } from "@roo-code/types";

async function createAndMonitorTask(api: RooCodeAPI) {
  // Listen for events
  api.on("taskCreated", (taskId) => {
    console.log(`Task ${taskId} created`);
  });

  api.on("taskCompleted", (taskId, tokenUsage, toolUsage) => {
    console.log(`Task ${taskId} completed:`, {
      tokens: tokenUsage.totalTokensIn + tokenUsage.totalTokensOut,
      cost: tokenUsage.totalCost,
      tools: Object.keys(toolUsage),
    });
  });

  // Start new task
  const taskId = await api.startNewTask({
    text: "Analyze this codebase and suggest improvements",
    configuration: {
      mode: "architect",
      alwaysAllowReadOnly: true,
    },
  });

  return taskId;
}
```

### Configuration Management

```typescript
async function setupConfiguration(api: RooCodeAPI) {
  // Get current config
  const currentConfig = api.getConfiguration();

  // Update specific settings
  await api.setConfiguration({
    ...currentConfig,
    autoApprovalEnabled: true,
    alwaysAllowReadOnly: true,
    maxConcurrentFileReads: 50,
    mode: "code",
  });

  // Create development profile
  await api.createProfile("dev-fast", {
    apiProvider: "openrouter",
    openRouterModelId: "anthropic/claude-3-haiku",
    rateLimitSeconds: 0,
  });
}
```

### Error Handling

```typescript
async function robustTaskCreation(api: RooCodeAPI) {
  try {
    if (!api.isReady()) {
      throw new Error("API not ready");
    }

    const taskId = await api.startNewTask({
      text: "Help with debugging",
      configuration: { mode: "debug" },
    });

    // Wait for task completion
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Task timeout"));
      }, 300000); // 5 minute timeout

      api.once("taskCompleted", (completedTaskId) => {
        if (completedTaskId === taskId) {
          clearTimeout(timeout);
          resolve(taskId);
        }
      });

      api.once("taskAborted", (abortedTaskId) => {
        if (abortedTaskId === taskId) {
          clearTimeout(timeout);
          reject(new Error("Task aborted"));
        }
      });
    });
  } catch (error) {
    console.error("Task creation failed:", error);
    throw error;
  }
}
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
