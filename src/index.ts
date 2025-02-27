/**
 * Discord bot main entry point
 */

import { Client, Events, Collection, REST, Routes, TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import type { ChatInputCommandInteraction, Interaction, Message } from 'discord.js';
import { DiscordService } from './services/discord.service';
import { ComponentManager } from './components';
import { validateEnvironment, DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, OPENROUTER_API_KEY } from './config/environment';
import { DEFAULT_WELCOME_MESSAGE, BOT_PREFIX, MODEL_PREFIX, PROMPT_PREFIX, RATE_LIMIT_SECONDS, RATE_LIMIT_MESSAGE } from './config/constants';
import type { SlashCommand } from './types/command.types';
import { OpenRouterService } from './services/openrouter.service';
import { RateLimiter } from './utils/rate-limiter.utils';
import { splitMessage } from './utils/message.utils';
import { loadValidModels } from './utils/model.utils';

// Import slash commands
import { aiSlashCommand, modelSlashCommand, promptSlashCommand } from './commands';

// Create a rate limiter for AI commands
const rateLimiter = new RateLimiter(RATE_LIMIT_SECONDS);

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
    
    // Create a collection for slash commands
    const commands = new Collection<string, SlashCommand>();
    
    // Register slash commands directly
    [aiSlashCommand, modelSlashCommand, promptSlashCommand].forEach(cmd => 
      commands.set(cmd.data.name, cmd)
    );
    
    // Register slash commands with Discord API
    const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN || '');
    
    try {
      console.log('Started refreshing application (/) commands.');
      
      await rest.put(
        Routes.applicationCommands(DISCORD_CLIENT_ID || ''),
        { body: commands.map(command => command.data.toJSON()) }
      );
      
      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error('Error registering slash commands:', error);
    }
    
    // Get component manager for buttons and select menus
    const componentManager = ComponentManager.getInstance();
    
    // Set up interaction handler for slash commands and components
    client.on(Events.InteractionCreate, async (interaction: Interaction) => {
      try {
        // Handle slash commands
        if (interaction.isChatInputCommand()) {
          const command = commands.get(interaction.commandName);
          
          if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
          }
          
          await command.execute(interaction);
        }
        // Handle component interactions
        else if (interaction.isButton() || interaction.isStringSelectMenu()) {
          await componentManager.handleInteraction(client, interaction);
        }
      } catch (error) {
        console.error('Interaction Error:', error);
        
        if (interaction.isChatInputCommand() && interaction.replied) {
          await interaction.followUp({ 
            content: 'There was an error executing this command!', 
            ephemeral: true 
          });
        } else if (interaction.isChatInputCommand()) {
          await interaction.reply({ 
            content: 'There was an error executing this command!', 
            ephemeral: true 
          });
        }
      }
    });
    
    // Set up message handler for prefix commands
    client.on(Events.MessageCreate, async (message: Message) => {
      if (message.author.bot) return;
      
      try {
        // Handle prompt command
        if (message.content.startsWith(PROMPT_PREFIX)) {
          await handlePromptCommand(message, openRouterService);
        } 
        // Handle model command
        else if (message.content.startsWith(MODEL_PREFIX)) {
          await handleModelCommand(message, openRouterService);
        } 
        // Handle AI chat command
        else if (message.content.startsWith(BOT_PREFIX)) {
          await handleAIChatCommand(message, openRouterService, rateLimiter);
        } 
        // Log other messages
        else {
          console.log(`${message.author.tag} said: ${message.content}`);
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

// Handle prompt command
async function handlePromptCommand(message: Message, openRouterService: OpenRouterService): Promise<void> {
  const newPrompt = message.content.slice(PROMPT_PREFIX.length).trim();
  
  if (!newPrompt) {
    await message.reply('Please provide a system prompt after the `!ai-prompt` command.');
    return;
  }
  
  try {
    openRouterService.setSystemPrompt(newPrompt);
    await message.reply(`System prompt successfully updated to: "${newPrompt}"`);
  } catch (error) {
    console.error('Prompt Update Error:', error);
    await message.reply('Failed to update the system prompt. Please try again.');
  }
}

// Handle model command
async function handleModelCommand(message: Message, openRouterService: OpenRouterService): Promise<void> {
  const command = message.content.slice(MODEL_PREFIX.length).trim();
  
  if (command === 'list') {
    await message.reply('Fetching available models...');
    
    try {
      const validModels = await loadValidModels();
      const modelList = Array.from(validModels).sort().join('\n');
      
      if (modelList.length === 0) {
        await message.reply('No models available.');
        return;
      }
      
      // Split into chunks if needed
      const chunks = splitMessage(modelList, 1900);
      
      // Send each chunk
      for (const chunk of chunks) {
        if ('send' in message.channel && typeof message.channel.send === 'function') {
          await message.channel.send(`\`\`\`\n${chunk}\n\`\`\``);
        }
      }
    } catch (error) {
      console.error('Error fetching model list:', error);
      await message.reply('Error fetching model list. Please try again later.');
    }
    
    return;
  }
  
  if (!command) {
    await message.reply('Please provide a model ID after the `!ai-model` command.');
    return;
  }
  
  const validModels = await loadValidModels();
  
  if (!validModels.has(command)) {
    await message.reply('Invalid model ID. Please provide a valid model from the supported list.');
    return;
  }
  
  try {
    openRouterService.setModelId(command);
    await message.reply(`AI model successfully changed to: ${command}`);
  } catch (error) {
    console.error('Model Change Error:', error);
    await message.reply('Failed to change the AI model. Please try again with a valid model ID.');
  }
}

// Handle AI chat command
async function handleAIChatCommand(message: Message, openRouterService: OpenRouterService, rateLimiter: RateLimiter): Promise<void> {
  const userId = message.author.id;
  
  // Check rate limiting
  if (rateLimiter.isRateLimited(userId)) {
    await message.reply(RATE_LIMIT_MESSAGE);
    return;
  }
  
  // Update rate limit timestamp
  rateLimiter.updateTimestamp(userId);
  
  // Get the query from arguments
  const query = message.content.slice(BOT_PREFIX.length).trim();
  
  if (!query) {
    await message.reply('Please provide a question or prompt after the `!ai` command.');
    return;
  }
  
  try {
    // Send typing indicator
    if ('sendTyping' in message.channel && typeof message.channel.sendTyping === 'function') {
      await message.channel.sendTyping();
    }
    
    // Get chat history
    const chatHistory = await message.channel.messages.fetch({ limit: 50 });
    
    // Send chat completion
    const { responseText, responseId } = await openRouterService.sendChatCompletion(
      query,
      chatHistory
    );
    
    // Split response into chunks if needed
    const chunks = splitMessage(responseText, 1900);
    
    // Send each chunk
    for (const chunk of chunks) {
      if ('send' in message.channel && typeof message.channel.send === 'function') {
        await message.channel.send(chunk);
      }
    }
    
    // Get response metadata
    const responseMetadata = await openRouterService.getResponseMetadata(responseId);
    
    // Send metadata if available
    if (responseMetadata) {
      const formattedMetadata = `\`\`\`\nCost: ${responseMetadata.total_cost}$\nTokens: ${responseMetadata.tokens_completion}\n\`\`\``;
      
      if ('send' in message.channel && typeof message.channel.send === 'function') {
        await message.channel.send(formattedMetadata);
      }
    }
  } catch (error: any) {
    console.error('OpenAI Error:', error);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      await message.reply(`OpenAI Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else {
      await message.reply('An error occurred while processing your request. Please try again later.');
    }
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
