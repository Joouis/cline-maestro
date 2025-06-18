# RooCode API Provider Settings

Comprehensive documentation for AI provider configuration, profiles, and settings management in the RooCode API.

## Table of Contents

1. [Overview](#overview)
2. [Provider Types](#provider-types)
3. [Provider Settings](#provider-settings)
4. [Profile Management](#profile-management)
5. [Configuration Examples](#configuration-examples)
6. [Provider-Specific Settings](#provider-specific-settings)
7. [Model Configuration](#model-configuration)
8. [Authentication Methods](#authentication-methods)
9. [Best Practices](#best-practices)

---

## Overview

The RooCode API supports multiple AI providers with flexible configuration management through profiles. Each provider has its own set of configuration options, authentication methods, and features.

### Key Features

- **Multiple Providers**: Support for 20+ AI providers
- **Profile System**: Named configurations for easy switching
- **Hot Swapping**: Change providers without restarting
- **Provider-Specific Settings**: Optimized configurations per provider
- **Secure Storage**: API keys stored securely in VS Code secret storage
- **Model Selection**: Provider-specific model configuration

---

## Provider Types

### Supported Providers

```typescript
type ProviderName =
  | "anthropic" // Anthropic Claude models
  | "openai" // OpenAI GPT models (via OpenAI-compatible API)
  | "openai-native" // OpenAI native API
  | "openrouter" // OpenRouter proxy service
  | "bedrock" // AWS Bedrock
  | "vertex" // Google Vertex AI
  | "gemini" // Google Gemini
  | "ollama" // Local Ollama models
  | "vscode-lm" // VS Code Language Models
  | "lmstudio" // LM Studio local server
  | "mistral" // Mistral AI
  | "deepseek" // DeepSeek models
  | "groq" // Groq inference
  | "xai" // xAI (Grok)
  | "glama" // Glama service
  | "unbound" // Unbound models
  | "requesty" // Requesty service
  | "chutes" // Chutes AI
  | "litellm" // LiteLLM proxy
  | "human-relay" // Human-in-the-loop
  | "fake-ai"; // Testing/debugging
```

### Provider Categories

**Cloud Providers**:

- `anthropic` - Direct Anthropic API
- `openai-native` - Direct OpenAI API
- `mistral` - Direct Mistral API
- `deepseek` - Direct DeepSeek API
- `groq` - Groq cloud inference
- `xai` - xAI models

**Proxy Services**:

- `openrouter` - Multi-provider proxy
- `glama` - Model aggregator
- `unbound` - AI model proxy
- `requesty` - Request proxy service
- `chutes` - AI service proxy
- `litellm` - Universal LLM proxy

**Cloud Platforms**:

- `bedrock` - AWS Bedrock
- `vertex` - Google Cloud Vertex AI
- `gemini` - Google AI Studio

**Local/Self-Hosted**:

- `ollama` - Local Ollama server
- `lmstudio` - LM Studio local server
- `openai` - OpenAI-compatible servers

**IDE Integration**:

- `vscode-lm` - VS Code's built-in language models

**Special Providers**:

- `human-relay` - Human assistance mode
- `fake-ai` - Testing and development

---

## Provider Settings

### ProviderSettingsEntry

Profile metadata for provider configurations:

```typescript
interface ProviderSettingsEntry {
  id: string; // Unique profile identifier
  name: string; // Human-readable profile name
  apiProvider?: ProviderName; // Provider type
}
```

### Base Provider Settings

Common settings available across all providers:

```typescript
interface BaseProviderSettings {
  // Model Configuration
  includeMaxTokens?: boolean; // Include max_tokens in requests
  modelTemperature?: number | null; // Model temperature (0.0-2.0)
  modelMaxTokens?: number; // Maximum output tokens
  modelMaxThinkingTokens?: number; // Maximum reasoning tokens

  // Reasoning Support (for capable models)
  enableReasoningEffort?: boolean; // Enable reasoning effort control
  reasoningEffort?: "low" | "medium" | "high"; // Reasoning intensity

  // Performance Settings
  rateLimitSeconds?: number; // Minimum delay between requests
  diffEnabled?: boolean; // Enable diff generation
  fuzzyMatchThreshold?: number; // Fuzzy matching sensitivity
}
```

### Complete Provider Settings

The full provider settings interface includes all provider-specific options:

```typescript
interface ProviderSettings extends BaseProviderSettings {
  apiProvider?: ProviderName;

  // Anthropic Settings
  apiKey?: string; // Anthropic API key
  apiModelId?: string; // Model ID (claude-3-5-sonnet-20241022, etc.)
  anthropicBaseUrl?: string; // Custom API endpoint
  anthropicUseAuthToken?: boolean; // Use auth token instead of API key

  // OpenAI Settings
  openAiApiKey?: string; // OpenAI API key
  openAiModelId?: string; // Model ID (gpt-4, gpt-3.5-turbo, etc.)
  openAiBaseUrl?: string; // Custom API endpoint
  openAiLegacyFormat?: boolean; // Use legacy API format
  openAiR1FormatEnabled?: boolean; // Enable R1 format features
  openAiCustomModelInfo?: ModelInfo; // Custom model information
  openAiUseAzure?: boolean; // Use Azure OpenAI
  azureApiVersion?: string; // Azure API version
  openAiStreamingEnabled?: boolean; // Enable streaming responses
  openAiHeaders?: Record<string, string>; // Custom headers

  // AWS Bedrock Settings
  awsAccessKey?: string; // AWS access key
  awsSecretKey?: string; // AWS secret key
  awsSessionToken?: string; // AWS session token
  awsRegion?: string; // AWS region
  awsUseCrossRegionInference?: boolean; // Cross-region inference
  awsUsePromptCache?: boolean; // Enable prompt caching
  awsProfile?: string; // AWS profile name
  awsUseProfile?: boolean; // Use AWS profile
  awsCustomArn?: string; // Custom model ARN
  awsModelContextWindow?: number; // Model context window size
  awsBedrockEndpointEnabled?: boolean; // Use VPC endpoint
  awsBedrockEndpoint?: string; // VPC endpoint URL

  // Google Vertex AI Settings
  vertexKeyFile?: string; // Service account key file path
  vertexJsonCredentials?: string; // JSON credentials
  vertexProjectId?: string; // Google Cloud project ID
  vertexRegion?: string; // Vertex AI region

  // Google Gemini Settings
  geminiApiKey?: string; // Gemini API key
  googleGeminiBaseUrl?: string; // Custom Gemini endpoint

  // OpenRouter Settings
  openRouterApiKey?: string; // OpenRouter API key
  openRouterModelId?: string; // Model ID
  openRouterBaseUrl?: string; // Custom OpenRouter endpoint
  openRouterSpecificProvider?: string; // Force specific provider
  openRouterUseMiddleOutTransform?: boolean; // Middle-out optimization

  // Ollama Settings
  ollamaModelId?: string; // Local model name
  ollamaBaseUrl?: string; // Ollama server URL

  // LM Studio Settings
  lmStudioModelId?: string; // Model ID
  lmStudioBaseUrl?: string; // LM Studio server URL
  lmStudioDraftModelId?: string; // Draft model for speculative decoding
  lmStudioSpeculativeDecodingEnabled?: boolean; // Enable speculative decoding

  // VS Code Language Models
  vsCodeLmModelSelector?: {
    // Model selection criteria
    vendor?: string; // Model vendor
    family?: string; // Model family
    version?: string; // Model version
    id?: string; // Specific model ID
  };

  // Provider-specific model IDs and API keys for other providers...
  // (Mistral, DeepSeek, Groq, xAI, Glama, Unbound, Requesty, Chutes, LiteLLM)
}
```

---

## Profile Management

### Creating Profiles

```typescript
// Create a new profile
const profileId = await api.createProfile(
  "Production Claude",
  {
    apiProvider: "anthropic",
    apiKey: "sk-ant-...", // Stored securely
    apiModelId: "claude-3-5-sonnet-20241022",
    modelTemperature: 0.1,
    rateLimitSeconds: 2,
  },
  true,
); // Auto-activate

console.log(`Created profile with ID: ${profileId}`);
```

### Managing Profiles

```typescript
// List all profiles
const profiles = api.getProfiles();
console.log("Available profiles:", profiles);

// Get profile details
const profile = api.getProfileEntry("Production Claude");
if (profile) {
  console.log(`Profile: ${profile.name} (${profile.apiProvider})`);
}

// Update existing profile
await api.updateProfile("Production Claude", {
  apiProvider: "anthropic",
  apiModelId: "claude-3-5-haiku-20241022", // Switch to Haiku
  modelTemperature: 0.2,
});

// Create or update (upsert)
await api.upsertProfile("Development", {
  apiProvider: "openai",
  openAiModelId: "gpt-4",
  modelTemperature: 0.7,
});

// Switch active profile
await api.setActiveProfile("Development");
console.log(`Active profile: ${api.getActiveProfile()}`);

// Delete profile
await api.deleteProfile("Old Profile");
```

### Profile Switching

```typescript
// Get current configuration
const currentConfig = api.getConfiguration();
console.log(`Current provider: ${currentConfig.apiProvider}`);

// Switch to different profile for specific tasks
await api.setActiveProfile("High Performance");

// Start task with new profile
const taskId = await api.startNewTask({
  text: "Optimize this code for performance",
  // Uses "High Performance" profile settings
});

// Switch back after task
await api.setActiveProfile("Default");
```

---

## Configuration Examples

### Anthropic Claude Configuration

```typescript
const claudeConfig: ProviderSettings = {
  apiProvider: "anthropic",
  apiKey: "sk-ant-api03-...", // Stored in VS Code secrets
  apiModelId: "claude-3-5-sonnet-20241022",
  modelTemperature: 0.1,
  modelMaxTokens: 4096,
  enableReasoningEffort: true,
  reasoningEffort: "medium",
  rateLimitSeconds: 1,
  includeMaxTokens: true,
  diffEnabled: true,
};

await api.createProfile("Claude Sonnet", claudeConfig);
```

### OpenAI GPT Configuration

```typescript
const openaiConfig: ProviderSettings = {
  apiProvider: "openai-native",
  openAiNativeApiKey: "sk-proj-...",
  apiModelId: "gpt-4",
  modelTemperature: 0.2,
  modelMaxTokens: 2048,
  rateLimitSeconds: 0.5,
  includeMaxTokens: false,
  diffEnabled: true,
  fuzzyMatchThreshold: 0.8,
};

await api.createProfile("GPT-4", openaiConfig);
```

### AWS Bedrock Configuration

```typescript
const bedrockConfig: ProviderSettings = {
  apiProvider: "bedrock",
  awsRegion: "us-west-2",
  awsAccessKey: "AKIA...", // Or use AWS profile
  awsSecretKey: "...", // Stored securely
  apiModelId: "anthropic.claude-3-5-sonnet-20241022-v2:0",
  awsUseCrossRegionInference: true,
  awsUsePromptCache: true,
  modelTemperature: 0.1,
  modelMaxTokens: 4096,
};

await api.createProfile("Bedrock Claude", bedrockConfig);
```

### Local Ollama Configuration

```typescript
const ollamaConfig: ProviderSettings = {
  apiProvider: "ollama",
  ollamaBaseUrl: "http://localhost:11434",
  ollamaModelId: "llama3.1:70b",
  modelTemperature: 0.3,
  modelMaxTokens: 2048,
  rateLimitSeconds: 0, // No rate limiting for local
  includeMaxTokens: true,
};

await api.createProfile("Local Llama", ollamaConfig);
```

### OpenRouter Multi-Provider

```typescript
const openrouterConfig: ProviderSettings = {
  apiProvider: "openrouter",
  openRouterApiKey: "sk-or-v1-...",
  openRouterModelId: "anthropic/claude-3.5-sonnet",
  openRouterSpecificProvider: "anthropic", // Force specific provider
  openRouterUseMiddleOutTransform: true,
  modelTemperature: 0.1,
  rateLimitSeconds: 1,
};

await api.createProfile("OpenRouter Claude", openrouterConfig);
```

### Google Vertex AI Configuration

```typescript
const vertexConfig: ProviderSettings = {
  apiProvider: "vertex",
  vertexProjectId: "my-gcp-project",
  vertexRegion: "us-central1",
  vertexJsonCredentials: JSON.stringify(serviceAccountKey),
  apiModelId: "gemini-1.5-pro",
  modelTemperature: 0.2,
  modelMaxTokens: 8192,
};

await api.createProfile("Vertex Gemini", vertexConfig);
```

---

## Provider-Specific Settings

### Anthropic

**Key Features**:

- Advanced reasoning capabilities
- Large context windows (up to 200K tokens)
- Tool use and computer use
- Prompt caching

**Configuration Options**:

```typescript
{
  apiProvider: "anthropic",
  apiKey: string,                    // Required: API key
  apiModelId: string,                // Model: claude-3-5-sonnet-20241022, etc.
  anthropicBaseUrl?: string,         // Custom endpoint
  anthropicUseAuthToken?: boolean,   // Use auth token method
  enableReasoningEffort?: boolean,   // Enable o1-style reasoning
  reasoningEffort?: "low" | "medium" | "high"
}
```

**Recommended Models**:

- `claude-3-5-sonnet-20241022` - Best overall performance
- `claude-3-5-haiku-20241022` - Fast and cost-effective
- `claude-3-opus-20240229` - Maximum capability

### OpenAI

**Key Features**:

- GPT-4 and GPT-3.5 models
- Function calling
- Vision capabilities
- Reasoning models (o1-preview, o1-mini)

**Configuration Options**:

```typescript
{
  apiProvider: "openai-native",
  openAiNativeApiKey: string,        // Required: API key
  apiModelId: string,                // Model: gpt-4, gpt-3.5-turbo, etc.
  openAiNativeBaseUrl?: string,      // Custom endpoint
  modelMaxThinkingTokens?: number,   // For reasoning models
  enableReasoningEffort?: boolean    // o1 reasoning control
}
```

**Recommended Models**:

- `gpt-4` - Best general performance
- `gpt-4-turbo` - Faster with large context
- `o1-preview` - Advanced reasoning
- `gpt-3.5-turbo` - Cost-effective

### AWS Bedrock

**Key Features**:

- Multiple model providers (Anthropic, Meta, Mistral, etc.)
- Enterprise security and compliance
- VPC endpoints support
- Cross-region inference

**Configuration Options**:

```typescript
{
  apiProvider: "bedrock",
  awsRegion: string,                     // Required: AWS region
  awsAccessKey?: string,                 // Access key (or use profile/IAM)
  awsSecretKey?: string,                 // Secret key
  awsProfile?: string,                   // AWS profile name
  awsUseProfile?: boolean,               // Use AWS profile
  apiModelId: string,                    // Model ARN or ID
  awsUseCrossRegionInference?: boolean,  // Cross-region routing
  awsUsePromptCache?: boolean,           // Enable caching
  awsBedrockEndpointEnabled?: boolean,   // Use VPC endpoint
  awsBedrockEndpoint?: string            // VPC endpoint URL
}
```

**Popular Models**:

- `anthropic.claude-3-5-sonnet-20241022-v2:0`
- `anthropic.claude-3-haiku-20240307-v1:0`
- `meta.llama3-1-70b-instruct-v1:0`
- `mistral.mistral-large-2402-v1:0`

### Ollama (Local)

**Key Features**:

- Local model hosting
- No API costs
- Privacy and offline capability
- Custom model support

**Configuration Options**:

```typescript
{
  apiProvider: "ollama",
  ollamaBaseUrl: string,         // Server URL (default: http://localhost:11434)
  ollamaModelId: string,         // Model name (must be pulled first)
  rateLimitSeconds: 0            // No rate limiting needed for local
}
```

**Popular Models**:

- `llama3.1:70b` - Large, capable model
- `llama3.1:8b` - Smaller, faster
- `codellama:34b` - Code-specialized
- `mistral-nemo:12b` - Balanced performance

### OpenRouter

**Key Features**:

- Access to 100+ models from multiple providers
- Unified API
- Cost optimization
- Provider redundancy

**Configuration Options**:

```typescript
{
  apiProvider: "openrouter",
  openRouterApiKey: string,              // Required: API key
  openRouterModelId: string,             // Model path (provider/model)
  openRouterSpecificProvider?: string,   // Force specific provider
  openRouterUseMiddleOutTransform?: boolean, // Optimization
  openRouterBaseUrl?: string             // Custom endpoint
}
```

**Popular Models**:

- `anthropic/claude-3.5-sonnet`
- `openai/gpt-4`
- `meta-llama/llama-3.1-70b-instruct`
- `google/gemini-pro-1.5`

---

## Model Configuration

### ModelInfo Structure

Detailed model information and capabilities:

```typescript
interface ModelInfo {
  maxTokens?: number | null; // Maximum output tokens
  maxThinkingTokens?: number | null; // Maximum reasoning tokens
  contextWindow: number; // Total context window
  supportsImages?: boolean; // Vision capabilities
  supportsComputerUse?: boolean; // Computer use tools
  supportsPromptCache?: boolean; // Prompt caching support
  supportsReasoningBudget?: boolean; // Reasoning budget control
  requiredReasoningBudget?: boolean; // Reasoning budget required
  supportsReasoningEffort?: boolean; // Reasoning effort levels
  supportedParameters?: ModelParameter[]; // Supported API parameters
  inputPrice?: number; // Input token price (per 1M tokens)
  outputPrice?: number; // Output token price (per 1M tokens)
  cacheWritesPrice?: number; // Cache write price
  cacheReadsPrice?: number; // Cache read price
  description?: string; // Model description
  reasoningEffort?: ReasoningEffort; // Default reasoning effort
  minTokensPerCachePoint?: number; // Minimum tokens for caching
  maxCachePoints?: number; // Maximum cache points
  cachableFields?: string[]; // Fields that can be cached
  tiers?: ModelTier[]; // Pricing tiers by context size
}
```

### Custom Model Information

```typescript
// Define custom model info for OpenAI-compatible endpoints
const customModelInfo: ModelInfo = {
  contextWindow: 32768,
  maxTokens: 4096,
  supportsImages: false,
  supportsPromptCache: false,
  inputPrice: 0.5, // $0.50 per 1M tokens
  outputPrice: 1.5, // $1.50 per 1M tokens
  description: "Custom fine-tuned model",
};

await api.createProfile("Custom Model", {
  apiProvider: "openai",
  openAiBaseUrl: "https://my-custom-endpoint.com/v1",
  openAiModelId: "my-custom-model",
  openAiCustomModelInfo: customModelInfo,
});
```

### Reasoning Models

Configuration for models with reasoning capabilities:

```typescript
// Configure o1-style reasoning model
const reasoningConfig: ProviderSettings = {
  apiProvider: "openai-native",
  apiModelId: "o1-preview",
  enableReasoningEffort: true,
  reasoningEffort: "high",
  modelMaxThinkingTokens: 32768, // Allow extensive reasoning
  modelMaxTokens: 4096, // Output tokens
  rateLimitSeconds: 5, // Higher rate limits for reasoning models
};

await api.createProfile("O1 Reasoning", reasoningConfig);
```

---

## Authentication Methods

### API Key Authentication

Most providers use API key authentication:

```typescript
// Direct API key (stored securely in VS Code secrets)
{
  apiProvider: "anthropic",
  apiKey: "sk-ant-api03-..."
}

{
  apiProvider: "openai-native",
  openAiNativeApiKey: "sk-proj-..."
}

{
  apiProvider: "openrouter",
  openRouterApiKey: "sk-or-v1-..."
}
```

### AWS Authentication

Multiple authentication methods for AWS Bedrock:

```typescript
// Method 1: Access key and secret
{
  apiProvider: "bedrock",
  awsAccessKey: "AKIA...",
  awsSecretKey: "...",
  awsSessionToken: "..." // Optional for temporary credentials
}

// Method 2: AWS Profile
{
  apiProvider: "bedrock",
  awsUseProfile: true,
  awsProfile: "my-profile" // Uses ~/.aws/credentials
}

// Method 3: IAM Role (when running on AWS)
{
  apiProvider: "bedrock"
  // Uses instance/role credentials automatically
}
```

### Google Cloud Authentication

Authentication for Vertex AI:

```typescript
// Method 1: Service Account Key File
{
  apiProvider: "vertex",
  vertexKeyFile: "/path/to/service-account.json",
  vertexProjectId: "my-gcp-project"
}

// Method 2: JSON Credentials String
{
  apiProvider: "vertex",
  vertexJsonCredentials: JSON.stringify(serviceAccountKey),
  vertexProjectId: "my-gcp-project"
}

// Method 3: Application Default Credentials
{
  apiProvider: "vertex",
  vertexProjectId: "my-gcp-project"
  // Uses gcloud auth application-default login
}
```

### No Authentication

Some providers don't require authentication:

```typescript
// Local Ollama server
{
  apiProvider: "ollama",
  ollamaBaseUrl: "http://localhost:11434"
  // No API key needed
}

// VS Code built-in models
{
  apiProvider: "vscode-lm",
  vsCodeLmModelSelector: {
    vendor: "copilot"
  }
  // Uses VS Code authentication
}
```

---

## Best Practices

### Profile Organization

```typescript
// ✅ Good: Descriptive profile names
await api.createProfile("Claude Sonnet - Production", config);
await api.createProfile("GPT-4 - Development", config);
await api.createProfile("Local Llama - Testing", config);

// ❌ Bad: Generic names
await api.createProfile("Profile 1", config);
await api.createProfile("Config", config);
```

### Cost Management

```typescript
// ✅ Good: Set appropriate rate limits
const productionConfig = {
  apiProvider: "anthropic",
  rateLimitSeconds: 2, // Prevent rapid-fire requests
  modelMaxTokens: 4096, // Limit output tokens
  modelTemperature: 0.1, // Consistent outputs
};

// Monitor costs via events
api.on("taskTokenUsageUpdated", (taskId, tokenUsage) => {
  if (tokenUsage.totalCost > 5.0) {
    console.warn(
      `High cost alert: Task ${taskId} cost $${tokenUsage.totalCost}`,
    );
  }
});
```

### Security

```typescript
// ✅ Good: Let VS Code handle secret storage
const config = {
  apiProvider: "anthropic",
  apiKey: "sk-ant-...", // Automatically stored in VS Code secrets
};

// ❌ Bad: Don't hardcode secrets
const badConfig = {
  apiProvider: "anthropic",
  apiKey: process.env.ANTHROPIC_KEY, // Avoid env vars in extension code
};
```

### Performance Optimization

```typescript
// ✅ Good: Optimize for your use case
const fastConfig = {
  apiProvider: "anthropic",
  apiModelId: "claude-3-5-haiku-20241022", // Faster model
  modelTemperature: 0.3,
  rateLimitSeconds: 0.5,
  includeMaxTokens: false,
};

const qualityConfig = {
  apiProvider: "anthropic",
  apiModelId: "claude-3-5-sonnet-20241022", // Better model
  modelTemperature: 0.1,
  rateLimitSeconds: 1,
  enableReasoningEffort: true,
  reasoningEffort: "high",
};
```

### Multi-Provider Strategy

```typescript
// Create profiles for different use cases
await api.createProfile("Fast Tasks", {
  apiProvider: "anthropic",
  apiModelId: "claude-3-5-haiku-20241022",
});

await api.createProfile("Complex Tasks", {
  apiProvider: "anthropic",
  apiModelId: "claude-3-5-sonnet-20241022",
  enableReasoningEffort: true,
});

await api.createProfile("Local Development", {
  apiProvider: "ollama",
  ollamaModelId: "llama3.1:8b",
});

await api.createProfile("Backup Provider", {
  apiProvider: "openrouter",
  openRouterModelId: "anthropic/claude-3.5-sonnet",
});

// Switch profiles based on task requirements
const switchToAppropriateProfile = (taskType: string) => {
  switch (taskType) {
    case "quick-question":
      return api.setActiveProfile("Fast Tasks");
    case "complex-analysis":
      return api.setActiveProfile("Complex Tasks");
    case "local-testing":
      return api.setActiveProfile("Local Development");
    default:
      return api.setActiveProfile("Complex Tasks");
  }
};
```

### Error Handling

```typescript
// Handle provider-specific errors
api.on("taskToolFailed", async (taskId, toolName, error) => {
  if (error.includes("rate limit")) {
    // Switch to profile with higher rate limits
    await api.setActiveProfile("Backup Provider");
    console.log("Switched to backup provider due to rate limits");
  } else if (error.includes("authentication")) {
    console.error("Authentication failed - check API keys");
  }
});

// Validate profile before use
const validateProfile = async (profileName: string): Promise<boolean> => {
  const profile = api.getProfileEntry(profileName);
  if (!profile) {
    console.error(`Profile not found: ${profileName}`);
    return false;
  }

  const config = api.getConfiguration();
  if (!config.apiKey && !config.awsAccessKey && !config.vertexKeyFile) {
    console.error("No authentication configured");
    return false;
  }

  return true;
};
```

This comprehensive provider documentation gives developers everything they need to configure and manage AI providers effectively in the RooCode API.
