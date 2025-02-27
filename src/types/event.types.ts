import { Client } from 'discord.js';

export interface EventOptions {
  name: string;
  once?: boolean;
}

export interface Event {
  options: EventOptions;
  execute: (client: Client, ...args: any[]) => Promise<void>;
}
