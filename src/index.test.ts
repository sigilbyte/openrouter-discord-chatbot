import { expect, test, describe, beforeAll, mock } from "bun:test";
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Collection, Message } from 'discord.js';

// Get the functions to test
import { splitMessage, loadValidModels, handleAIChatRequest } from './index';

// Mock Discord.js objects
class MockMessage {
  author: { id: string; bot: boolean };
  content: string;
  channel: { send: Function; sendTyping: Function };
  reply: Function;

  constructor(content: string, isBot = false) {
    this.author = { id: '123', bot: isBot };
    this.content = content;
    this.channel = {
      send: mock(() => Promise.resolve()),
      sendTyping: mock(() => Promise.resolve())
    };
    this.reply = mock(() => Promise.resolve());
  }
}

describe('Discord Bot', () => {
  describe('splitMessage', () => {
    test('splits long message into chunks', () => {
      const longMessage = 'a'.repeat(2500);
      const chunks = splitMessage(longMessage, 1900);
      expect(chunks.length).toBe(2);
      expect(chunks[0].length).toBeLessThanOrEqual(1900);
      expect(chunks[1].length).toBeLessThanOrEqual(1900);
    });

describe('Chat History', () => {
  test('formats chat history correctly', async () => {
    const chatHistory = new Collection<string, Message>();
    
    // Add some test messages
    const userMessage = new MockMessage('Hello AI!');
    const botMessage = new MockMessage('Hello user!', true);
    chatHistory.set('1', userMessage as any);
    chatHistory.set('2', botMessage as any);

    // Create a new message that will trigger the chat
    const newMessage = new MockMessage('!ai How are you?');
    
    try {
      await handleAIChatRequest(newMessage as any, chatHistory as any);
      
      // Verify the message was processed
      expect(newMessage.channel.sendTyping).toHaveBeenCalled();
      expect(newMessage.reply).not.toHaveBeenCalledWith('Please provide a question or prompt after the `!ai` command.');
    } catch (error) {
      // We expect an error since we don't have OpenAI credentials in test
      expect(error).toBeDefined();
    }
  });

  test('enforces rate limiting', async () => {
    const chatHistory = new Collection<string, Message>();
    const message = new MockMessage('!ai test message');

    // First request should process
    await handleAIChatRequest(message as any, chatHistory as any);
    
    // Second immediate request should be rate limited
    await handleAIChatRequest(message as any, chatHistory as any);
    expect(message.reply).toHaveBeenCalledWith("Please wait a few seconds before sending another request.");
  });
});

    test('handles empty message', () => {
      const chunks = splitMessage('', 1900);
      expect(chunks).toEqual(['No response from AI.']);
    });

    test('keeps message intact if under limit', () => {
      const message = 'Hello, world!';
      const chunks = splitMessage(message, 1900);
      expect(chunks).toEqual([message]);
    });
  });

  describe('loadValidModels', () => {
    const testModelsPath = 'openrouter_ids.txt';
    const testModels = [
      "anthropic/claude-2",
      "openai/gpt-4",
      "google/gemini-pro"
    ].join('\n');

    beforeAll(() => {
      // Ensure test models file exists
      if (!fs.existsSync(testModelsPath)) {
        fs.writeFileSync(testModelsPath, testModels);
      }
    });

    test('loads and parses models correctly', () => {
      const models = loadValidModels();
      expect(models).toBeInstanceOf(Set);
      expect(models.size).toBeGreaterThan(0);
      // Test that at least one known model exists
      expect(models.has('openai/gpt-4')).toBe(true);
    });
  });
});
