import { expect, test, describe, beforeAll, mock } from "bun:test";
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Collection, Message } from 'discord.js';

// Import the functions to test from their actual locations
import { splitMessage } from './utils/message.utils';

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
});
