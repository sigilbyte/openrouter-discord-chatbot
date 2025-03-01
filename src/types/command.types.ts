import { Client, Message } from 'discord.js';
import { OpenRouterService } from '../services/openrouter.service';

export interface CommandOptions {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
}

export interface Command {
  options: CommandOptions;
  execute: (client: Client, message: Message, args: string[], openRouterService: OpenRouterService) => Promise<void>;
}
