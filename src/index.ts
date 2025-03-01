/**
 * Discord bot main entry point
 */

import { Client, Events, TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import type { Interaction, Message } from 'discord.js';
import { DiscordService } from './services/discord.service';
import { ComponentManager } from './components';
import { CommandManager } from './commands';
import { validateEnvironment, DISCORD_BOT_TOKEN, OPENROUTER_API_KEY } from './config/environment';
import { DEFAULT_WELCOME_MESSAGE } from './config/constants';
import { OpenRouterService } from './services/openrouter.service';

async function main() {
  try {
    // Validate environment variables
    if (!validateEnvironment()) {
      process.exit(1);
    }
    
    console.log('Starting Discord bot...');
    
    // Get Discord service
    const discordService = DiscordService.getInstance();
    const client = discordService.getClient();
    
    // Get OpenRouter service
    const openRouterService = OpenRouterService.getInstance();
    console.log('[INDEX] Initialized OpenRouterService');
    
    // Set the model ID (example of extended usage)
    openRouterService.setModelId('openai/gpt-4o');
    console.log('[INDEX] Set default model ID to openai/gpt-4o');
    
    // Set default parameters
    openRouterService.setDefaultParams({
      temperature: 0.7,
      max_tokens: 200 // Example value. Adjust as needed.
    });
    console.log('[INDEX] Set default parameters for OpenRouterService');
    
    // Get command manager for prefix commands and pass the OpenRouterService
    const commandManager = CommandManager.getInstance(openRouterService);
    console.log('[INDEX] Initialized CommandManager with OpenRouterService');
    
    // Get component manager for buttons and select menus
    const componentManager = ComponentManager.getInstance();
    
    // Set up interaction handler for components
    client.on(Events.InteractionCreate, async (interaction: Interaction) => {
      try {
        // Handle component interactions
        if (interaction.isButton() || interaction.isStringSelectMenu()) {
          await componentManager.handleInteraction(client, interaction);
        }
      } catch (error) {
        console.error('Interaction Error:', error);
        
        console.error('Error handling interaction:', error);
      }
    });
    
    // Set up message handler for prefix commands
    client.on(Events.MessageCreate, async (message: Message) => {
      if (message.author.bot) return;
      
      try {
        console.log(`[INDEX] Received message: "${message.content}"`);
        
        // Handle commands using the command manager
        console.log('[INDEX] Passing message to CommandManager');
        const handled = await commandManager.handleMessage(client, message);
        
        // Log other messages
        if (!handled) {
          console.log(`[INDEX] Message not handled as command: ${message.author.tag} said: ${message.content}`);
        } else {
          console.log('[INDEX] Message was handled as a command');
        }
      } catch (error) {
        console.error('Message Command Error:', error);
      }
    });
    
    // Initialize Discord client
    await discordService.initialize();
    
    console.log('Discord bot is ready!');
    
    // Send welcome message to all guilds
    if (client.guilds.cache.size > 0) {
      console.log(`Sending startup welcome messages to ${client.guilds.cache.size} guilds...`);
    } else {
      console.log('No guilds found. The bot is not in any servers yet.');
    }
    
    client.guilds.cache.forEach(async (guild) => {
      try {
        // Find a suitable channel
        const welcomeChannel = guild.systemChannel || 
          guild.channels.cache.find(
            channel => channel.type === 0 && (channel as TextChannel).permissionsFor(client.user!)?.has('SendMessages')
          ) as TextChannel | null;
        
        if (welcomeChannel) {
          // Create welcome buttons
          const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('welcome_button')
                .setLabel('Get Started')
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId('role_button')
                .setLabel('Select Roles')
                .setStyle(ButtonStyle.Secondary)
            );
          
          // Send welcome message
          await welcomeChannel.send({
            content: `**Bot Restarted!**\n\n${DEFAULT_WELCOME_MESSAGE}`,
            components: [row],
          });
          
          console.log(`Sent startup welcome message to ${guild.name}`);
        }
      } catch (error) {
        console.error(`Error sending welcome message to ${guild.name}:`, error);
      }
    });
  } catch (error) {
    console.error('Startup Error:', error);
    process.exit(1);
  }
}


// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Start the bot
main().catch(console.error);
