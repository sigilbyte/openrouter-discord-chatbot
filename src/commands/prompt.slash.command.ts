/**
 * System prompt slash command
 */

import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import type { SlashCommand } from '../types/command.types';
import { OpenRouterService } from '../services/openrouter.service';

export const promptSlashCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('prompt')
    .setDescription('Set or view the system prompt')
    .addSubcommand(subcommand =>
      subcommand
        .setName('set')
        .setDescription('Set the system prompt')
        .addStringOption(option =>
          option.setName('prompt')
            .setDescription('The system prompt to use')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('view')
        .setDescription('View the current system prompt'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('clear')
        .setDescription('Clear the system prompt')),
  
  execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
    const subcommand = interaction.options.getSubcommand();
    
    // Get OpenRouter service
    const openRouterService = OpenRouterService.getInstance();
    
    if (subcommand === 'set') {
      const prompt = interaction.options.getString('prompt', true);
      
      try {
        openRouterService.setSystemPrompt(prompt);
        await interaction.reply({
          content: `System prompt successfully updated to: "${prompt}"`,
          ephemeral: true
        });
      } catch (error) {
        console.error('Prompt Update Error:', error);
        await interaction.reply({
          content: 'Failed to update the system prompt. Please try again.',
          ephemeral: true
        });
      }
    } else if (subcommand === 'view') {
      const currentPrompt = openRouterService.getSystemPrompt();
      
      if (currentPrompt) {
        await interaction.reply({
          content: `Current system prompt: "${currentPrompt}"`,
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: 'No system prompt is currently set.',
          ephemeral: true
        });
      }
    } else if (subcommand === 'clear') {
      try {
        openRouterService.setSystemPrompt('');
        await interaction.reply({
          content: 'System prompt successfully cleared.',
          ephemeral: true
        });
      } catch (error) {
        console.error('Prompt Clear Error:', error);
        await interaction.reply({
          content: 'Failed to clear the system prompt. Please try again.',
          ephemeral: true
        });
      }
    }
  },
};
