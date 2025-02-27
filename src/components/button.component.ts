/**
 * Button component handler
 */

import { 
  Client, 
  ButtonInteraction,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from 'discord.js';
import type { Interaction, StringSelectMenuInteraction } from 'discord.js';
import type { Component } from '../types/component.types';

export const buttonComponent: Component = {
  options: {
    customId: 'button',
    type: 'BUTTON',
  },
  execute: async (client: Client, interaction: Interaction | ButtonInteraction | StringSelectMenuInteraction): Promise<void> => {
    // Check if interaction is a button interaction
    if (!interaction.isButton()) return;
    
    try {
      const customId = interaction.customId;
      
      // Handle different button types
      if (customId === 'welcome_button' || customId.startsWith('welcome_')) {
        await handleWelcomeButton(client, interaction);
      } else if (customId === 'role_button' || customId.startsWith('role_')) {
        await handleRoleButton(client, interaction);
      } else if (customId === 'model_button' || customId.startsWith('model_')) {
        await handleModelButton(client, interaction);
      } else {
        await handleDefaultButton(client, interaction);
      }
    } catch (error) {
      console.error('Button Component Error:', error);
      
      // Reply with error message if interaction hasn't been replied to
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'An error occurred while processing your button click. Please try again later.',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: 'An error occurred while processing your button click. Please try again later.',
          ephemeral: true,
        });
      }
    }
  },
};

/**
 * Handles welcome button
 * @param client The Discord client
 * @param interaction The interaction
 */
const handleWelcomeButton = async (
  client: Client,
  interaction: ButtonInteraction
): Promise<void> => {
  await interaction.reply({
    content: 'Welcome to the server! How can I help you today?',
    ephemeral: true,
  });
};

/**
 * Handles role button
 * @param client The Discord client
 * @param interaction The interaction
 */
const handleRoleButton = async (
  client: Client,
  interaction: ButtonInteraction
): Promise<void> => {
  // Get available roles from the guild
  const availableRoles = interaction.guild?.roles.cache
    .filter(role => !role.managed && role.name !== '@everyone')
    .first(10) || [];
  
  // Create options from available roles
  const options = availableRoles.map(role => 
    new StringSelectMenuOptionBuilder()
      .setLabel(role.name)
      .setDescription(`Select the ${role.name} role`)
      .setValue(role.id)
  );
  
  // If no roles are available, send an error message
  if (options.length === 0) {
    await interaction.reply({
      content: 'No roles available for selection.',
      ephemeral: true,
    });
    return;
  }
  
  const select = new StringSelectMenuBuilder()
    .setCustomId('role_select')
    .setPlaceholder('Select a role')
    .addOptions(options);
  
  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
  
  await interaction.reply({
    content: 'Please select a role:',
    components: [row],
    ephemeral: true,
  });
};

/**
 * Handles model button
 * @param client The Discord client
 * @param interaction The interaction
 */
const handleModelButton = async (
  client: Client,
  interaction: ButtonInteraction
): Promise<void> => {
  const select = new StringSelectMenuBuilder()
    .setCustomId('model_select')
    .setPlaceholder('Select an AI model')
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('GPT-4o')
        .setDescription('OpenAI GPT-4o model')
        .setValue('openai/gpt-4o'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Claude 3 Opus')
        .setDescription('Anthropic Claude 3 Opus model')
        .setValue('anthropic/claude-3-opus'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Llama 3 70B')
        .setDescription('Meta Llama 3 70B model')
        .setValue('meta-llama/llama-3-70b-instruct'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Mistral Large')
        .setDescription('Mistral AI Large model')
        .setValue('mistralai/mistral-large')
    );
  
  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
  
  await interaction.reply({
    content: 'Please select an AI model:',
    components: [row],
    ephemeral: true,
  });
};

/**
 * Handles default button
 * @param client The Discord client
 * @param interaction The interaction
 */
const handleDefaultButton = async (
  client: Client,
  interaction: ButtonInteraction
): Promise<void> => {
  await interaction.reply({
    content: `You clicked: ${interaction.customId}`,
    ephemeral: true,
  });
};
