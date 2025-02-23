import { Client, Events, GatewayIntentBits, Message, Collection } from 'discord.js';
import OpenAI from 'openai';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const loadValidModels = (): Set<string> => {
  const content = fs.readFileSync('openrouter_ids.txt', 'utf-8');
  return new Set(
    content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .map(line => line.replace(/"/g, ''))
  );
};

const VALID_MODELS: Set<string> = loadValidModels();
let MODEL_ID: string = 'openai/gpt-4o';

const BOT_PREFIX = '!ai';
const MODEL_PREFIX = '!ai-model';
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

client.once(Events.ClientReady, () => {
  if (client.user) {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity('AI Chatbot');
  }
});

const execPromise = promisify(exec);

const handlePrintModels = async (message: Message) => {
  try {
    const { stdout, stderr } = await execPromise('curl -s https://openrouter.ai/api/v1/models | jq \'.data[].id\'');
    if (stderr) {
      console.error('Error:', stderr);
      await message.reply('Error fetching model list. Please try again later.');
      return;
    }
    
    const sortedModels = stdout.split('\n').sort().join('\n');
    const chunks = splitMessage(sortedModels, 1900);
    
    for (const chunk of chunks) {
      const wrappedChunk = 'Available models:\n```bash\n' + chunk + '```';
      if ('send' in message.channel) {
        await message.channel.send(wrappedChunk);
      }
    }
  } catch (error) {
    console.error('Error executing command:', error);
    await message.reply('Error fetching model list. Please try again later.');
  }
};

const handleAIModelRequest = async (message: Message) => {
  const command = message.content.slice(MODEL_PREFIX.length).trim();
  if (command === 'print') {
    await handlePrintModels(message);
    return;
  }
  if (!command) {
    await message.reply('Please provide a model ID after the `!ai-model` command.');
    return;
  }
  if (!VALID_MODELS.has(command)) {
    await message.reply('Invalid model ID. Please provide a valid model from the supported list.');
    return;
  }
  try {
    MODEL_ID = command;
    await message.reply(`AI model successfully changed to: ${MODEL_ID}`);
  } catch (error) {
    console.error('Model Change Error:', error);
    await message.reply('Failed to change the AI model. Please try again with a valid model ID.');
  }
};

const handleAIChatRequest = async (message: Message, chatHistory: Collection<string, Message>) => {
  const userId = message.author.id;
  const now = Date.now();
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

  const formattedChatHistory = chatHistory.map(msg => ({
    role: (msg.author.bot ? 'assistant' : 'user') as 'assistant' | 'user',
    content: msg.content,
  }));

  try {
    if ('sendTyping' in message.channel) {
      await message.channel.sendTyping();
    }

    formattedChatHistory.push({ role: 'user', content: query });

    const completion = await openai.chat.completions.create({
      model: MODEL_ID,
      messages: formattedChatHistory
        //{ role: 'system', content: googleGeminiPro }
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

const splitMessage = (text: string, maxLength: number): string[] => {
  if (text.length === 0) {
    return ['No response from AI.'];
  }

  const lines = text.split('\n');
  const chunks: string[] = [];
  let currentChunk = '';

  for (let line of lines) {
    if ((currentChunk + line).length + (currentChunk ? 1 : 0) <= maxLength) {
      currentChunk += (currentChunk ? '\n' : '') + line;
    } else {
      if (line.length > maxLength) {
        while (line.length > maxLength) {
          chunks.push(line.substring(0, maxLength));
          line = line.substring(maxLength);
        }
        if (line.length > 0) {
          currentChunk = line;
        }
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = '';
        }
        currentChunk = line;
      }
    }
  }
  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
};

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith(MODEL_PREFIX)) {
    await handleAIModelRequest(message);
  } else if (message.content.startsWith(BOT_PREFIX)) {
    const chatHistory = await message.channel.messages.fetch({ limit: 50 });
    console.log(chatHistory.map(m => `${m.author.tag}: ${m.content}`).join('\n'));
    await handleAIChatRequest(message, chatHistory);
  } else {
    console.log(`${message.author.tag} said: ${message.content}`);
  }
});

const handleError = (error: Error) => {
  console.error('Unhandled Error:', error);
};

process.on('unhandledRejection', handleError);
process.on('uncaughtException', handleError);

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
if (!DISCORD_TOKEN) {
  console.error('Discord bot token is missing. Please set DISCORD_BOT_TOKEN in your environment variables.');
  process.exit(1);
}

client.login(DISCORD_TOKEN);
