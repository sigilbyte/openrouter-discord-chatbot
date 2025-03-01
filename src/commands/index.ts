/**
 * Command registration system
 */

import { Client } from 'discord.js';
import type { Message } from 'discord.js';
import type { Command } from '../types/command.types';
import { BOT_PREFIX, MODEL_PREFIX, PROMPT_PREFIX, AVAILABLE_MODELS_PREFIX } from '../config/constants';
import { RateLimiterService } from '../services/rate-limiter.service';

// Import commands
import { aiCommand } from './ai.command';
import { aiModelCommand } from './ai-model.command';
import { aiPromptCommand } from './ai-prompt.command';
import { aiListCommand } from './ai-list.command';

/**
 * Command manager for registering and handling commands
 */
export class CommandManager {
  private commands: Map<string, Command>;
  private prefixMap: Map<string, Command>;
  private rateLimiterService: RateLimiterService;
  private static instance: CommandManager;

  /**
   * Creates a new command manager
   */
  private constructor() {
    this.commands = new Map<string, Command>();
    this.prefixMap = new Map<string, Command>();
    this.rateLimiterService = RateLimiterService.getInstance();
    this.registerCommands();
  }

  /**
   * Gets the command manager instance (singleton)
   * @returns The command manager instance
   */
  public static getInstance(): CommandManager {
    if (!CommandManager.instance) {
      CommandManager.instance = new CommandManager();
    }
    return CommandManager.instance;
  }

  /**
   * Gets the rate limiter
   * @returns The rate limiter
   */
  public getRateLimiter() {
    return this.rateLimiterService.getRateLimiter();
  }

  /**
   * Registers all commands
   */
  private registerCommands(): void {
    // Register commands
    this.registerCommand(aiCommand, BOT_PREFIX);
    this.registerCommand(aiModelCommand, MODEL_PREFIX);
    this.registerCommand(aiPromptCommand, PROMPT_PREFIX);
    this.registerCommand(aiListCommand, AVAILABLE_MODELS_PREFIX);
  }

  /**
   * Registers a command
   * @param command The command to register
   * @param prefix The command prefix
   */
  private registerCommand(command: Command, prefix: string): void {
    this.commands.set(command.options.name, command);
    this.prefixMap.set(prefix, command);
    console.log(`Registered command: ${command.options.name}`);
  }

  /**
   * Handles a message
   * @param client The Discord client
   * @param message The message to handle
   * @returns True if the message was handled, false otherwise
   */
  public async handleMessage(client: Client, message: Message): Promise<boolean> {
    try {
      console.log(`Processing message: "${message.content}"`);
      
      // Sort prefixes by length (descending) to ensure longer, more specific prefixes are checked first
      const sortedPrefixes = Array.from(this.prefixMap.entries())
        .sort((a, b) => b[0].length - a[0].length);
      
      // Check if message starts with any of the registered prefixes
      for (const [prefix, command] of sortedPrefixes) {
        if (message.content.startsWith(prefix)) {
          // Get arguments (everything after the prefix)
          const args = message.content.slice(prefix.length).trim().split(/ +/);
          
          // Ensure this is an exact command match or has valid arguments
          // If the prefix is followed by another command character (like '-'), 
          // it might be a more specific command that we haven't matched yet
          const remainingText = message.content.slice(prefix.length).trim();
          if (remainingText.startsWith('-') && !remainingText.includes(' ')) {
            // This might be a more specific command (e.g., "!ai-list" when we matched "!ai")
            // Continue to the next prefix to see if we have a more specific match
            continue;
          }
          
          console.log(`Command matched: "${prefix}" -> "${command.options.name}"`);
          console.log(`Arguments: [${args.join(', ')}]`);      
          
          // Execute the command
          console.log(`Executing command: ${command.options.name}`);
          await command.execute(client, message, args);
          console.log(`Command execution completed: ${command.options.name}`);
          return true;
        }
      }
      
      console.log('No command prefix matched');
      return false;
    } catch (error) {
      console.error('Command Execution Error:', error);
      return false;
    }
  }
}
