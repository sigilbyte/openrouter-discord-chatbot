/**
 * AI prompt command handler
 */

import { Client, Message } from 'discord.js';
import type { Command } from '../types/command.types';
import { PROMPT_PREFIX } from '../config/constants';
import { OpenRouterService } from '../services/openrouter.service';

export const aiPromptCommand: Command = {
  options: {
    name: 'ai-prompt',
    description: 'Set a custom system prompt for the AI',
    usage: `${PROMPT_PREFIX} <prompt>`,
  },
  execute: async (client: Client, message: Message, args: string[], openRouterService: OpenRouterService): Promise<void> => {
    // Use the provided OpenRouter service
    console.log(`[ai-prompt.command] Using provided OpenRouterService instance`);
    
    const newPrompt = args.join(' ');
    
    if (!newPrompt) {
      await message.reply('Please provide a system prompt after the `!ai-prompt` command.');
      return;
    }
    
    try {
      openRouterService.setSystemPrompt(newPrompt);
      await message.reply(`System prompt successfully updated to: "${newPrompt}"`);
    } catch (error) {
      console.error('Prompt Update Error:', error);
      await message.reply('Failed to update the system prompt. Please try again.');
    }
  },
};
