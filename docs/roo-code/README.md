# Roo Code API Documentation Index

This documentation covers all Roo Code API interfaces, types, and their relationships. The API provides programmatic access to Roo Code's functionality including task management, configuration, messaging, and event handling.

## Documentation Structure

### 📋 [Roo Code API Overview](roo-api-overview.md)

Complete reference for the main Roo Code API interfaces:

- **RooCodeAPI**: Core API interface with task management, configuration, and profile methods
- **RooCodeSettings**: Complete settings and configuration types
- **RooCodeIpcServer**: IPC server interface for inter-process communication

### 🔔 [Event System](roo-api-events.md)

Documentation for the event-driven architecture:

- **RooCodeAPIEvents**: All event types and their payloads
- **Event lifecycle**: Task creation, execution, completion, and error events
- **Event handlers**: How to listen and respond to events

### ⚙️ [Provider Configuration](roo-api-providers.md)

Provider settings and API configuration:

- **ProviderSettings**: All supported AI provider configurations
- **ProviderSettingsEntry**: Profile management types
- **Provider-specific**: Anthropic, OpenAI, OpenRouter, and other provider settings

### 🛠️ [Tools & Data Types](roo-api-tools.md)

Tool usage, data types, and inter-process communication:

- **ToolUsage & ToolName**: Available tools and usage tracking
- **Data types of `message.text`**: Complete reference for JSON structures in message text fields
- **IPC Messages**: Inter-process communication protocol
- **MCP Integration**: Model Context Protocol support

## Core API Concepts

### Task Management

Roo Code operates on a task-based model where each interaction is encapsulated in a task with a unique ID. Tasks can be:

- Created with initial configuration and messages
- Resumed from history
- Spawned as subtasks
- Monitored through events

### Configuration System

The API supports hierarchical configuration through:

- **Global Settings**: Application-wide settings
- **Provider Settings**: AI provider-specific configurations
- **Profile Management**: Named configuration profiles
- **Mode-specific**: Configuration per mode (code, debug, etc.)

### Event-Driven Architecture

All significant operations emit events that can be monitored:

- Task lifecycle events (created, started, completed, etc.)
- Message events (new messages, updates)
- Error and failure events
- Token usage updates

### Type Safety

All interfaces are fully typed using TypeScript with Zod schemas for runtime validation:

- Compile-time type checking
- Runtime validation
- Schema-based documentation
- Type inference support

## Quick Start Example

```typescript
import { RooCodeAPI, RooCodeSettings } from "@roo-code/types";

// Get API instance
const api: RooCodeAPI = getRooCodeAPI();

// Start a new task
const taskId = await api.startNewTask({
  configuration: { mode: "code" },
  text: "Help me refactor this function",
  images: ["data:image/png;base64,..."],
});

// Listen for events
api.on("taskCompleted", (taskId, tokenUsage, toolUsage) => {
  console.log(`Task ${taskId} completed`, { tokenUsage, toolUsage });
});

// Send a message
await api.sendMessage("Please add error handling");
```

## Version Information

- **API Version**: 2.x
- **Type System**: TypeScript with Zod validation
- **Node.js**: 14.0.0+ required
- **VSCode Extension**: Compatible with VSCode 1.60+

## Related Documentation

- [VSCode Extension API](https://github.com/RooCodeInc/Roo-Code/tree/main/src/extension/api.ts)
- [Provider Implementation](https://github.com/RooCodeInc/Roo-Code/tree/main/src/api/providers/)
- [Tool Implementation](https://github.com/RooCodeInc/Roo-Code/tree/main/src/tools/)
- [Settings Management](https://github.com/RooCodeInc/Roo-Code/tree/main/docs/settings.md)

---

**Note**: This documentation is generated from the TypeScript types in `packages/types/src/`. For the most up-to-date type definitions, refer to the source files.
