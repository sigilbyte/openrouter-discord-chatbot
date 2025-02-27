/**
 * AI chat slash command
 */

import { SlashCommandBuilder, ChatInputCommandInteraction, Collection, Message } from 'discord.js';
import type { SlashCommand } from '../types/command.types';
import { OpenRouterService } from '../services/openrouter.service';
import { RateLimiter } from '../utils/rate-limiter.utils';
import { splitMessage } from '../utils/message.utils';
import { MAX_MESSAGE_LENGTH, RATE_LIMIT_MESSAGE, RATE_LIMIT_SECONDS } from '../config/constants';

// Create a rate limiter for the AI command
const rateLimiter = new RateLimiter(RATE_LIMIT_SECONDS);

export const aiSlashCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('ai')
    .setDescription('Chat with the AI')
    .addStringOption(option => 
      option.setName('message')
        .setDescription('Your message to the AI')
        .setRequired(true)),
  
  execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
    const userId = interaction.user.id;
    
    // Check rate limiting
    if (rateLimiter.isRateLimited(userId)) {
      await interaction.reply({ content: RATE_LIMIT_MESSAGE, ephemeral: true });
      return;
    }
    
    // Update rate limit timestamp
    rateLimiter.updateTimestamp(userId);
    
    // Get the query from options
    const query = interaction.options.getString('message', true);
    
    // Defer reply to give us time to process
    await interaction.deferReply();
    
    try {
      // Get OpenRouter service
      const openRouterService = OpenRouterService.getInstance();
      
      // Send chat completion
      let chatHistory: Collection<string, Message<boolean>> = new Collection();
      
      // Try to get chat history if possible
      if (interaction.channel) {
        try {
          chatHistory = await interaction.channel.messages.fetch({ limit: 50 });
        } catch (error) {
          console.error('Error fetching chat history:', error);
          // Continue with empty chat history
        }
      }
      
      const { responseText, responseId } = await openRouterService.sendChatCompletion(
        query,
        chatHistory
      );
      
      // Split response into chunks if needed
      const chunks = splitMessage(responseText, MAX_MESSAGE_LENGTH);
      
      // Send first chunk as reply
      await interaction.editReply(chunks[0]);
      
      // Send additional chunks as follow-ups
      for (let i = 1; i < chunks.length; i++) {
        await interaction.followUp(chunks[i]);
      }
      
      // Get response metadata
      const responseMetadata = await openRouterService.getResponseMetadata(responseId);
      
      // Send metadata if available
      if (responseMetadata) {
        await interaction.followUp({
          content: `Cost: ${responseMetadata.total_cost}$ | Tokens: ${responseMetadata.tokens_completion}`,
          ephemeral: true
        });
      }
    } catch (error: any) {
      console.error('OpenAI Error:', error);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        await interaction.editReply(`OpenAI Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else {
        await interaction.editReply('An error occurred while processing your request. Please try again later.');
      }
    }
  },
};
