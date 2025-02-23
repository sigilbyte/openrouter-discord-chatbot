import { Client, Events, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, // servers
    GatewayIntentBits.GuildMessages, // messages within servers
    GatewayIntentBits.MessageContent, // content of messages within servers
  ],
});

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Logged in as ${readyClient.user?.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  console.log(`${message.author.tag} said ${message.content}`);
});

await client.login(process.env.DISCORD_BOT_TOKEN);