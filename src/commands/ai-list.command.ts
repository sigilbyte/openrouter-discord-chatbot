/**
 * AI list command handler
 */

import { Client, Message } from 'discord.js';
import type { Command } from '../types/command.types';
import { AVAILABLE_MODELS_PREFIX } from '../config/constants';
import { splitMessage } from '../utils/message.utils';

export const aiListCommand: Command = {
  options: {
    name: 'ai-list',
    description: 'List available AI models',
    usage: `${AVAILABLE_MODELS_PREFIX}`,
  },
  execute: async (client: Client, message: Message, args: string[]): Promise<void> => {
    console.log('Entered ai-list command handler');
    
    await message.reply('Fetching available models from OpenRouter API...');
    
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
      const modelIds = data.data.map((model: { id: string }) => model.id).sort();
      
      if (modelIds.length === 0) {
        await message.reply('No models available from OpenRouter API.');
        return;
      }
      
      const modelList = modelIds.join('\n');
      
      // Split into chunks if needed
      const chunks = splitMessage(modelList, 1900);
      
      // Send each chunk
      for (const chunk of chunks) {
        if ('send' in message.channel && typeof message.channel.send === 'function') {
          await message.channel.send(`\`\`\`\n${chunk}\n\`\`\``);
        }
      }
    } catch (error) {
      console.error('Error fetching model list from OpenRouter API:', error);
      await message.reply('Error fetching model list from OpenRouter API. Please try again later.');
    }
  },
};
