/**
 * AI model command handler
 */

import { Client, Message } from 'discord.js';
import type { Command } from '../types/command.types';
import { MODEL_PREFIX } from '../config/constants';
import { OpenRouterService } from '../services/openrouter.service';

export const aiModelCommand: Command = {
  options: {
    name: 'ai-model',
    description: 'Change the AI model',
    usage: `${MODEL_PREFIX} <model-id>`,
  },
  execute: async (client: Client, message: Message, args: string[], openRouterService: OpenRouterService): Promise<void> => {
    console.log('Entered ai-model command handler');
    
    // Use the provided OpenRouter service
    console.log(`[ai-model.command] Using provided OpenRouterService instance`);
    
    const modelId = args.join(' ');
    console.log(`ai-model command with args joined: "${modelId}"`);
    
    if (!modelId) {
      await message.reply('Please provide a model ID after the `!ai-model` command.');
      return;
    }
    
    try {
      // Import the API key and headers from environment
      const { OPENROUTER_API_KEY, OPENROUTER_REFERER, OPENROUTER_TITLE } = await import('../config/environment');
      
      if (!OPENROUTER_API_KEY) {
        throw new Error('OpenRouter API key is not configured');
      }
      
      const headers = {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': OPENROUTER_REFERER || '',
        'X-Title': OPENROUTER_TITLE || 'Discord AI Bot'
      };
      
      // Make a direct API call to OpenRouter to get the models
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid response format from OpenRouter API');
      }
      
      // Extract model IDs from the response
      const modelIds = data.data.map((model: { id: string }) => model.id);
      
      // Check if the requested model ID is valid
      if (!modelIds.includes(modelId)) {
        await message.reply('Invalid model ID. Please provide a valid model from the supported list.');
        return;
      }
      
      openRouterService.setModelId(modelId);
      await message.reply(`AI model successfully changed to: ${modelId}`);
    } catch (error) {
      console.error('Model Change Error:', error);
      await message.reply('Failed to change the AI model. Please try again with a valid model ID.');
    }
  },
};
