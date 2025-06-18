# RooCode API Documentation Index

This directory contains comprehensive documentation for the RooCode API, covering all major components and systems that make up the RooCode extension's programmatic interface.

## Documentation Structure

The RooCode API documentation is organized into four main sections:

### 📋 [API Overview](./roocode-api-overview.md)

The main API interfaces and core functionality documentation. This file covers:

- Primary API classes and their methods
- Core extension interfaces
- Main service implementations
- Integration patterns and usage examples

### 🔄 [Event System](./roocode-api-events.md)

Comprehensive documentation of RooCode's event-driven architecture. This file covers:

- All 12 event types with detailed schemas
- Event emission patterns and lifecycle
- Event listener registration and handling
- Real-world usage examples for each event type

### 🤖 [AI Provider Configuration](./roocode-api-providers.md)

Complete reference for AI provider integration and configuration. This file covers:

- Configuration for all 22 supported AI providers
- Provider-specific parameters and options
- Authentication and API key management
- Provider selection and switching mechanisms

### 🛠️ [Tools & IPC Communication](./roocode-api-tools-ipc.md)

Documentation for the tool system and inter-process communication. This file covers:

- Tool definition and registration
- IPC message protocols and schemas
- Communication patterns between extension components
- Tool execution lifecycle and error handling

## Navigation Guide

### For New Developers

1. Start with the [API Overview](./roocode-api-overview.md) to understand the core interfaces
2. Review the [Event System](./roocode-api-events.md) to understand how components communicate
3. Explore [AI Provider Configuration](./roocode-api-providers.md) for AI integration
4. Deep dive into [Tools & IPC](./roocode-api-tools-ipc.md) for advanced functionality

### For Integration Tasks

- **Adding new AI providers**: See [AI Provider Configuration](./roocode-api-providers.md)
- **Creating custom tools**: Reference [Tools & IPC Communication](./roocode-api-tools-ipc.md)
- **Event handling**: Consult [Event System](./roocode-api-events.md)
- **Core API usage**: Check [API Overview](./roocode-api-overview.md)

### For Troubleshooting

- **Event-related issues**: [Event System](./roocode-api-events.md) - Event schemas and validation
- **Provider connectivity**: [AI Provider Configuration](./roocode-api-providers.md) - Configuration troubleshooting
- **Tool execution**: [Tools & IPC Communication](./roocode-api-tools-ipc.md) - IPC debugging
- **General API issues**: [API Overview](./roocode-api-overview.md) - Core interface documentation

## Documentation Statistics

Each documentation file is comprehensive (600+ lines) and includes:

- **Complete interface definitions** with TypeScript types
- **Real-world code examples** demonstrating usage patterns
- **Detailed parameter documentation** with validation rules
- **Error handling patterns** and troubleshooting guides
- **Cross-references** to related functionality

---

_This documentation was generated to provide comprehensive coverage of the RooCode API for developers, integrators, and contributors working with the RooCode extension ecosystem._
