/**
 * Utility functions for handling OpenRouter models
 */

import fs from 'fs';
import { OPENROUTER_IDS_PATH } from '../config/constants';

/**
 * Loads valid OpenRouter model IDs from the models file
 * @returns A Set of valid model IDs
 */
export const loadValidModels = (): Set<string> => {
  try {
    const content = fs.readFileSync(OPENROUTER_IDS_PATH, 'utf-8');
    return new Set(
      content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .map(line => line.replace(/"/g, ''))
    );
  } catch (error) {
    console.error(`Error loading model IDs from ${OPENROUTER_IDS_PATH}:`, error);
    return new Set();
  }
};

/**
 * Checks if a model ID is valid
 * @param modelId The model ID to check
 * @param validModels Set of valid model IDs
 * @returns True if the model ID is valid, false otherwise
 */
export const isValidModel = (modelId: string, validModels: Set<string>): boolean => {
  return validModels.has(modelId);
};
