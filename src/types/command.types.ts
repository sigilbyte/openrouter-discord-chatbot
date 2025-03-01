import { Client, Message } from 'discord.js';

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
