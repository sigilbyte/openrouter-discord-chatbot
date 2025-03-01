/**
 * AI chat command handler
 */

import { Client, Message } from 'discord.js';
import type { Command } from '../types/command.types';
import { BOT_PREFIX, RATE_LIMIT_MESSAGE } from '../config/constants';
import { OpenRouterService } from '../services/openrouter.service';
import { RateLimiterService } from '../services/rate-limiter.service';
import { splitMessage } from '../utils/message.utils';

export const aiCommand: Command = {
  options: {
    name: 'ai',
    description: 'Chat with the AI assistant',
    usage: `${BOT_PREFIX} <message>`,
  },
  execute: async (client: Client, message: Message, args: string[]): Promise<void> => {
    console.log('Entered ai command handler for chat completion');
    console.log(`Message content: "${message.content}"`);
    console.log(`Arguments: [${args.join(', ')}]`);
    
    // Get OpenRouter service
    const openRouterService = OpenRouterService.getInstance();
    
    // Get rate limiter service
    const rateLimiterService = RateLimiterService.getInstance();
    const rateLimiter = rateLimiterService.getRateLimiter();
    
    const userId = message.author.id;
    
    // Check rate limiting
    if (rateLimiter.isRateLimited(userId)) {
      await message.reply(RATE_LIMIT_MESSAGE);
      return;
    }
    
    // Update rate limit timestamp
    rateLimiter.updateTimestamp(userId);
    
    // Get the query from arguments
    const query = args.join(' ');
    
    if (!query) {
      await message.reply('Please provide a question or prompt after the `!ai` command.');
      return;
    }
    
    try {
      // Send typing indicator
      if ('sendTyping' in message.channel && typeof message.channel.sendTyping === 'function') {
        await message.channel.sendTyping();
      }
      
      // Get chat history
      const chatHistory = await message.channel.messages.fetch({ limit: 50 });
      
      // Send chat completion
      const { responseText, responseId } = await openRouterService.sendChatCompletion(
        query,
        chatHistory
      );
      
      // Split response into chunks if needed
      const chunks = splitMessage(responseText, 1900);
      
      // Send each chunk
      for (const chunk of chunks) {
        if ('send' in message.channel && typeof message.channel.send === 'function') {
          await message.channel.send(chunk);
        }
      }
      
      // Get response metadata
      const responseMetadata = await openRouterService.getResponseMetadata(responseId);
      
      // Send metadata if available
      if (responseMetadata) {
        const formattedMetadata = `\`\`\`\nCost: ${responseMetadata.total_cost}$\nTokens: ${responseMetadata.tokens_completion}\n\`\`\``;
        
        if ('send' in message.channel && typeof message.channel.send === 'function') {
          await message.channel.send(formattedMetadata);
        }
      }
    } catch (error: any) {
      console.error('OpenAI Error:', error);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        await message.reply(`OpenAI Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else {
        await message.reply('An error occurred while processing your request. Please try again later.');
      }
    }
  },
};
