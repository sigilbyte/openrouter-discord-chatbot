/**
 * Dropdown component handler
 */

import { 
  Client, 
  StringSelectMenuInteraction, 
  GuildMemberRoleManager,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from 'discord.js';
import type { Interaction, ButtonInteraction } from 'discord.js';
import type { Component } from '../types/component.types';
import { OpenRouterService } from '../services/openrouter.service';

export const dropdownComponent: Component = {
  options: {
    customId: 'dropdown',
    type: 'SELECT_MENU',
  },
  execute: async (client: Client, interaction: Interaction | ButtonInteraction | StringSelectMenuInteraction): Promise<void> => {
    // Check if interaction is a select menu interaction
    if (!interaction.isStringSelectMenu()) return;
    
    try {
      const customId = interaction.customId;
      const selectedValue = interaction.values[0];
      
      // Handle different dropdown types
      if (customId === 'role_select' || customId.startsWith('role_select')) {
        await handleRoleSelection(client, interaction, selectedValue);
      } else if (customId === 'config_select' || customId.startsWith('config_select')) {
        await handleConfigSelection(client, interaction, selectedValue);
      } else if (customId === 'model_select' || customId.startsWith('model_select')) {
        await handleModelSelection(client, interaction, selectedValue);
      } else {
        await handleDefaultSelection(client, interaction, selectedValue);
      }
    } catch (error) {
      console.error('Dropdown Component Error:', error);
      
      // Reply with error message if interaction hasn't been replied to
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'An error occurred while processing your selection. Please try again later.',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: 'An error occurred while processing your selection. Please try again later.',
          ephemeral: true,
        });
      }
    }
  },
};

/**
 * Handles role selection
 * @param client The Discord client
 * @param interaction The interaction
 * @param selectedValue The selected value
 */
const handleRoleSelection = async (
  client: Client,
  interaction: StringSelectMenuInteraction,
  selectedValue: string
): Promise<void> => {
  // Get the role
  const role = interaction.guild?.roles.cache.get(selectedValue);
  
  // If role doesn't exist, send error message
  if (!role) {
    await interaction.reply({
      content: 'The selected role does not exist.',
      ephemeral: true,
    });
    return;
  }
  
  // Get the member's roles
  const memberRoles = interaction.member?.roles as GuildMemberRoleManager;
  
  // Check if member already has the role
  if (memberRoles.cache.has(selectedValue)) {
    // Remove the role
    await memberRoles.remove(role);
    
    await interaction.update({
      content: `You no longer have the ${role.name} role.`,
      components: [],
    });
  } else {
    // Add the role
    await memberRoles.add(role);
    
    // Create config dropdown if needed
    const configSelect = new StringSelectMenuBuilder()
      .setCustomId('config_select')
      .setPlaceholder('Select configuration options')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Notifications')
          .setDescription('Configure notification settings')
          .setValue('notifications_config'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Permissions')
          .setDescription('Configure permission settings')
          .setValue('permissions_config')
      );
    
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(configSelect);
    
    await interaction.update({
      content: `You now have the ${role.name} role. Would you like to configure additional settings?`,
      components: [row],
    });
  }
};

/**
 * Handles configuration selection
 * @param client The Discord client
 * @param interaction The interaction
 * @param selectedValue The selected value
 */
const handleConfigSelection = async (
  client: Client,
  interaction: StringSelectMenuInteraction,
  selectedValue: string
): Promise<void> => {
  switch (selectedValue) {
    case 'welcome_config':
      await interaction.update({
        content: 'Welcome message configuration is not yet implemented.',
        components: [],
      });
      break;
    case 'ai_config':
      await interaction.update({
        content: 'AI settings configuration is not yet implemented.',
        components: [],
      });
      break;
    case 'permissions_config':
      await interaction.update({
        content: 'Permissions configuration is not yet implemented.',
        components: [],
      });
      break;
    case 'notifications_config':
      await interaction.update({
        content: 'Notification settings configuration is not yet implemented.',
        components: [],
      });
      break;
    default:
      await interaction.update({
        content: `Selected configuration: ${selectedValue}`,
        components: [],
      });
      break;
  }
};

/**
 * Handles model selection
 * @param client The Discord client
 * @param interaction The interaction
 * @param selectedValue The selected value
 */
const handleModelSelection = async (
  client: Client,
  interaction: StringSelectMenuInteraction,
  selectedValue: string
): Promise<void> => {
  // Get OpenRouter service
  const openRouterService = OpenRouterService.getInstance();
  
  // Set model ID
  openRouterService.setModelId(selectedValue);
  
  await interaction.update({
    content: `AI model successfully changed to: ${selectedValue}`,
    components: [],
  });
};

/**
 * Handles default selection
 * @param client The Discord client
 * @param interaction The interaction
 * @param selectedValue The selected value
 */
const handleDefaultSelection = async (
  client: Client,
  interaction: StringSelectMenuInteraction,
  selectedValue: string
): Promise<void> => {
  await interaction.update({
    content: `You selected: ${selectedValue}`,
    components: [],
  });
};
