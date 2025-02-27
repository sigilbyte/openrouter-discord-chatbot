/**
 * Welcome message template
 */

/**
 * Default welcome message template
 * @param username The username of the new member
 * @returns The formatted welcome message
 */
export const defaultWelcomeTemplate = (username: string): string => {
  return `
Welcome to the server, ${username}! 👋

I'm an AI-powered Discord bot that can help you with various tasks. Here's how to use me:

🤖 **Chat with AI**
- Use \`!ai <message>\` to chat with me
- I'll remember the context of our conversation

🔄 **Switch AI Models**
- Use \`!ai-model <model-id>\` to switch between different AI models
- Use \`!ai-model list\` to see all available models

⚙️ **Customize System Prompt**
- Use \`!ai-prompt <prompt>\` to set a custom system prompt
- This affects how I respond to your messages

Try it out by saying \`!ai Hello!\` in the chat!

If you need any help, feel free to ask a server admin or moderator.
`;
};

/**
 * Role selection welcome message template
 * @param username The username of the new member
 * @returns The formatted welcome message
 */
export const roleSelectionWelcomeTemplate = (username: string): string => {
  return `
Welcome to the server, ${username}! 👋

Please use the dropdown menu below to select your roles. This will help us tailor your experience on the server.

Once you've selected your roles, you can chat with me using the following commands:

- \`!ai <message>\` - Chat with the AI
- \`!ai-model <model-id>\` - Switch AI models
- \`!ai-model list\` - List available models
- \`!ai-prompt <prompt>\` - Set a custom system prompt

Enjoy your time on the server!
`;
};

/**
 * Server rules welcome message template
 * @param username The username of the new member
 * @returns The formatted welcome message
 */
export const serverRulesWelcomeTemplate = (username: string): string => {
  return `
Welcome to the server, ${username}! 👋

Before you start chatting, please take a moment to read our server rules:

1. Be respectful to all members
2. No spamming or excessive self-promotion
3. Keep discussions in the appropriate channels
4. No NSFW content
5. Follow Discord's Terms of Service

You can interact with me using the following commands:

- \`!ai <message>\` - Chat with the AI
- \`!ai-model <model-id>\` - Switch AI models
- \`!ai-model list\` - List available models
- \`!ai-prompt <prompt>\` - Set a custom system prompt

If you have any questions, feel free to ask a server admin or moderator.
`;
};
