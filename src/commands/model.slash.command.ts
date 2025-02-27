/**
 * Model selection slash command
 */

import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import type { SlashCommand } from '../types/command.types';
import { OpenRouterService } from '../services/openrouter.service';
import { loadValidModels } from '../utils/model.utils';
import { DEFAULT_MODEL_ID } from '../config/constants';

export const modelSlashCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('model')
    .setDescription('Change or view the AI model')
    .addSubcommand(subcommand =>
      subcommand
        .setName('set')
        .setDescription('Set the AI model to use')
        .addStringOption(option =>
          option.setName('model_id')
            .setDescription('The model ID to use')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List available AI models'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('current')
        .setDescription('Show the current AI model')),
  
  execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
    const subcommand = interaction.options.getSubcommand();
    
    // Get OpenRouter service
    const openRouterService = OpenRouterService.getInstance();
    
    if (subcommand === 'set') {
      const modelId = interaction.options.getString('model_id', true);
      const validModels = await loadValidModels();
      
      if (!validModels.has(modelId)) {
        await interaction.reply({
          content: 'Invalid model ID. Please provide a valid model from the supported list.',
          ephemeral: true
        });
        return;
      }
      
      try {
        openRouterService.setModelId(modelId);
        await interaction.reply(`AI model successfully changed to: ${modelId}`);
      } catch (error) {
        console.error('Model Change Error:', error);
        await interaction.reply({
          content: 'Failed to change the AI model. Please try again with a valid model ID.',
          ephemeral: true
        });
      }
    } else if (subcommand === 'list') {
      await interaction.deferReply();
      
      try {
        const validModels = await loadValidModels();
        const modelList = Array.from(validModels).sort().join('\n');
        
        if (modelList.length === 0) {
          await interaction.editReply('No models available.');
          return;
        }
        
        // Split into chunks if needed
        const chunks = [];
        let currentChunk = '';
        
        for (const line of modelList.split('\n')) {
          if (currentChunk.length + line.length + 1 > 1900) {
            chunks.push(currentChunk);
            currentChunk = line;
          } else {
            currentChunk += (currentChunk ? '\n' : '') + line;
          }
        }
        
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        
        // Send first chunk as reply
        await interaction.editReply(`Available models:\n\`\`\`\n${chunks[0]}\n\`\`\``);
        
        // Send additional chunks as follow-ups
        for (let i = 1; i < chunks.length; i++) {
          await interaction.followUp(`\`\`\`\n${chunks[i]}\n\`\`\``);
        }
      } catch (error) {
        console.error('Error fetching model list:', error);
        await interaction.editReply('Error fetching model list. Please try again later.');
      }
    } else if (subcommand === 'current') {
      const currentModel = openRouterService.getModelId() || DEFAULT_MODEL_ID;
      await interaction.reply(`Current AI model: ${currentModel}`);
    }
  },
};
