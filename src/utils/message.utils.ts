/**
 * Utility functions for handling Discord messages
 */

/**
 * Splits a message into chunks that fit within Discord's message length limits
 * @param text The text to split
 * @param maxLength The maximum length of each chunk
 * @returns An array of message chunks
 */
export const splitMessage = (text: string, maxLength: number): string[] => {
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
