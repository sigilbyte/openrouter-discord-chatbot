import { Client } from 'discord.js';
import type { Interaction, ButtonInteraction, StringSelectMenuInteraction } from 'discord.js';

export interface ComponentOptions {
  customId: string;
  type: 'BUTTON' | 'SELECT_MENU';
}

export interface Component {
  options: ComponentOptions;
  execute: (client: Client, interaction: Interaction | ButtonInteraction | StringSelectMenuInteraction) => Promise<void>;
}
