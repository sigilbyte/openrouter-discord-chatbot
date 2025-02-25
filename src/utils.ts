import fs from 'fs';


export const loadValidModels = (): Set<string> => {
  const content = fs.readFileSync('assets/docs/openrouter_ids.txt', 'utf-8');
  return new Set(
    content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .map(line => line.replace(/"/g, ''))
  );
};
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