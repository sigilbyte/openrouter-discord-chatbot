import { Client, Message, ChatInputCommandInteraction } from 'discord.js';
import type { SlashCommandBuilder } from 'discord.js';

export interface CommandOptions {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
}

export interface Command {
  options: CommandOptions;
  execute: (client: Client, message: Message, args: string[]) => Promise<void>;
}

export interface SlashCommand {
  data: any; // Using 'any' temporarily to bypass TypeScript errors
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
