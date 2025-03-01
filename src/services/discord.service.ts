/**
 * Discord service for managing the Discord client
 */

import { Client, Events, GatewayIntentBits } from 'discord.js';
import { DISCORD_BOT_TOKEN } from '../config/environment';

/**
 * Service for managing the Discord client
 */
export class DiscordService {
  private client: Client;
  private static instance: DiscordService;

  /**
   * Creates a new Discord service
   */
  private constructor() {
    try {
      // Define base intents that are always needed
      const baseIntents = [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ];
      
      // Try to include GuildMembers intent, but don't fail if it's not available
      const intents = [...baseIntents, GatewayIntentBits.GuildMembers];
      
      this.client = new Client({ intents });
      
      // Set up error handling
      this.setupErrorHandling();
      
      console.log('Discord client initialized with intents:', intents);
    } catch (error) {
      console.warn('Failed to initialize with GuildMembers intent, trying without it...');
      
      this.client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
        ],
      });
      
      // Set up error handling
      this.setupErrorHandling();
      
      console.log('Discord client initialized without GuildMembers intent');
    }
  }

  /**
   * Gets the Discord service instance (singleton)
   * @returns The Discord service instance
   */
  public static getInstance(): DiscordService {
    if (!DiscordService.instance) {
      DiscordService.instance = new DiscordService();
    }
    return DiscordService.instance;
  }

  /**
   * Gets the Discord client
   * @returns The Discord client
   */
  public getClient(): Client {
    return this.client;
  }

  /**
   * Initializes the Discord client
   * @returns A promise that resolves when the client is ready
   */
  public async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.once(Events.ClientReady, () => {
        if (this.client.user) {
          console.log(`Logged in as ${this.client.user.tag}`);
          this.client.user.setActivity('AI Chatbot');
        }
        resolve();
      });

      this.client.login(DISCORD_BOT_TOKEN).catch(reject);
    });
  }

  /**
   * Sets up error handling for the Discord client
   */
  private setupErrorHandling(): void {
    this.client.on('error', (error) => {
      console.error('Discord Client Error:', error);
    });

    process.on('unhandledRejection', (error) => {
      console.error('Unhandled Promise Rejection:', error);
    });

    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
    });
  }
}
