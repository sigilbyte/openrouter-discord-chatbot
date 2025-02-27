/**
 * Environment configuration for the Discord bot
 */

// Required environment variables
export const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
export const OPENROUTER_REFERER = process.env.OPENROUTER_REFERER || '';
export const OPENROUTER_TITLE = process.env.OPENROUTER_TITLE || 'Discord AI Bot';

// Validate required environment variables
export const validateEnvironment = (): boolean => {
  const requiredVars = [
    { name: 'DISCORD_BOT_TOKEN', value: DISCORD_BOT_TOKEN },
    { name: 'DISCORD_CLIENT_ID', value: DISCORD_CLIENT_ID },
    { name: 'OPENROUTER_API_KEY', value: OPENROUTER_API_KEY }
  ];

  let isValid = true;
  const missingVars: string[] = [];

  requiredVars.forEach(({ name, value }) => {
    if (!value) {
      isValid = false;
      missingVars.push(name);
    }
  });

  if (!isValid) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('Please set these variables in your .env file');
  }

  return isValid;
};
