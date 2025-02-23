import { Client, Events, GatewayIntentBits, Message } from 'discord.js';
import OpenAI from 'openai';
import type { ChatCompletion } from 'openai/resources/chat/completions.js';

const BOT_PREFIX = '!ai';
const RATE_LIMIT_SECONDS = 5;
const RATE_LIMIT_MESSAGE = "Please wait a few seconds before sending another request.";
const userMessageTimestamps = new Map<string, number>();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': process.env.OPENROUTER_REFERER || '',
    'X-Title': process.env.OPENROUTER_TITLE || 'Discord AI Bot',
  },
});

// Bot Ready
client.once(Events.ClientReady, () => {
  if (client.user) {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity('AI Chatbot');
  }
});

// Handle AI Chat Requests
const handleAIChatRequest = async (message: Message) => {
  const userId = message.author.id;
  const now = Date.now();

  // Rate Limiting
  const lastMessageTime = userMessageTimestamps.get(userId) || 0;
  if (now - lastMessageTime < RATE_LIMIT_SECONDS * 1000) {
    await message.reply(RATE_LIMIT_MESSAGE);
    return;
  }
  userMessageTimestamps.set(userId, now);

  const query = message.content.slice(BOT_PREFIX.length).trim();
  if (!query) {
    await message.reply('Please provide a question or prompt after the `!ai` command.');
    return;
  }

  try {
    if ('sendTyping' in message.channel) {
      await message.channel.sendTyping();
    }

    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4o',
      messages: [{ role: 'user', content: query }],
    });

    const responseText = completion.choices[0]?.message?.content || 'No response from AI.';
    const chunks = splitMessage(responseText, 1900);

    for (const chunk of chunks) {
      if ('send' in message.channel) {
        await message.channel.send(chunk);
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
};

// Utility: Split Message into Chunks
const splitMessage = (text: string, maxLength: number): string[] => {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += maxLength) {
    chunks.push(text.substring(i, i + maxLength));
  }
  return chunks.length ? chunks : ['No response from AI.'];
};

// Event: Message Created
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith(BOT_PREFIX)) {
    await handleAIChatRequest(message);
  } else {
    console.log(`${message.author.tag} said: ${message.content}`);
  }
});

// Handle Uncaught Errors
const handleError = (error: Error) => {
  console.error('Unhandled Error:', error);
  // Optionally notify a specific channel or admin
};

process.on('unhandledRejection', handleError);
process.on('uncaughtException', handleError);

// Log in to Discord
const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
if (!DISCORD_TOKEN) {
  console.error('Discord bot token is missing. Please set DISCORD_BOT_TOKEN in your environment variables.');
  process.exit(1);
}

client.login(DISCORD_TOKEN);
