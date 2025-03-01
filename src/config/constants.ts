/**
 * Constants used throughout the Discord bot
 */

// Command prefixes
export const BOT_PREFIX = '!ai'; // to send message
export const MODEL_PREFIX = '!ai-model'; // to change model
export const PROMPT_PREFIX = '!ai-prompt'; // to set system prompt
export const AVAILABLE_MODELS_PREFIX = '!ai-list'; // to list available models

// Rate limiting
export const RATE_LIMIT_SECONDS = 5;
export const RATE_LIMIT_MESSAGE = "Please wait a few seconds before sending another request.";

// Default settings
export const DEFAULT_MODEL_ID = 'openai/gpt-4o';
export const DEFAULT_SYSTEM_PROMPT = '';

// File paths
export const OPENROUTER_IDS_PATH = 'assets/docs/openrouter_ids.txt';

// Message limits
export const MAX_MESSAGE_LENGTH = 1900;
export const MAX_CHAT_HISTORY = 50;

// Welcome message
export const DEFAULT_WELCOME_MESSAGE = `Welcome to the server! I'm an AI-powered Discord bot.

Here's how to use me:
- Use \`!ai <message>\` to chat with me
- Use \`!ai-model <model-id>\` to switch AI models
- Use \`!ai-list\` to list available models
- Use \`!ai-prompt <prompt>\` to set a custom system prompt

Try it out by saying \`!ai Hello!\``;
