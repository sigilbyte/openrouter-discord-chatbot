import OpenAI from 'openai';
import { Collection, Message } from 'discord.js';
import { OPENROUTER_API_KEY, OPENROUTER_REFERER, OPENROUTER_TITLE } from '../config/environment';
import { DEFAULT_MODEL_ID } from '../config/constants';

interface ChatCompletionParams {
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  max_tokens?: number;
  logit_bias?: { [key: number]: number };
  stop?: string | string[];
  seed?: number; //Integer only.
}

export class OpenRouterService {
  private openai: OpenAI;
  private static instance: OpenRouterService;
  private modelId: string = DEFAULT_MODEL_ID;
  private systemPrompt: string = '';
  private defaultParams: ChatCompletionParams = {};

  /**
   * Creates a new OpenRouter service
   */
  private constructor() {
    this.openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: OPENROUTER_API_KEY || '',
      defaultHeaders: {
        'HTTP-Referer': OPENROUTER_REFERER || '',
        'X-Title': OPENROUTER_TITLE || 'Discord AI Bot',
      },
    });
  }

  /**
   * Gets the OpenRouter service instance (singleton)
   * @returns The OpenRouter service instance
   */
  public static getInstance(): OpenRouterService {
    if (!OpenRouterService.instance) {
      OpenRouterService.instance = new OpenRouterService();
    }
    return OpenRouterService.instance;
  }

  /**
   * Gets the current model ID
   * @returns The current model ID
   */
  public getModelId(): string {
    return this.modelId;
  }

  /**
   * Sets the model ID
   * @param modelId The model ID to set
   */
  public setModelId(modelId: string): void {
    this.modelId = modelId;
  }

  /**
   * Gets the current system prompt
   * @returns The current system prompt
   */
  public getSystemPrompt(): string {
    return this.systemPrompt;
  }

  /**
   * Sets the system prompt
   * @param prompt The system prompt to set
   */
  public setSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt;
  }

  /**
   * Sets default parameters for chat completion requests
   * @param params The default parameters to set
   */
  public setDefaultParams(params: ChatCompletionParams): void {
    this.defaultParams = { ...this.defaultParams, ...params }; // Merge new params
  }

  /**
   * Gets the current default parameters
   * @returns The current default parameters
   */
  public getDefaultParams(): ChatCompletionParams {
    return this.defaultParams;
  }
  
  /**
   * Sends a chat completion request to the OpenRouter API
   * @param query The user's query
   * @param chatHistory The chat history
   * @param overrideParams Optional parameters to override the default ones
   * @returns The AI's response
   */
  public async sendChatCompletion(
    query: string,
    chatHistory: Collection<string, Message>,
    overrideParams?: ChatCompletionParams
  ): Promise<{
    responseText: string;
    responseId: string;
  }> {
    const formattedChatHistory = chatHistory.map(msg => ({
      role: (msg.author.bot ? 'assistant' : 'user') as 'assistant' | 'user',
      content: msg.content,
    }));

    formattedChatHistory.push({ role: 'user', content: query });

    const messages = this.systemPrompt
      ? [{ role: 'system' as const, content: this.systemPrompt }, ...formattedChatHistory]
      : formattedChatHistory;

    const completion = await this.openai.chat.completions.create({
      model: this.modelId,
      messages,
      ...this.defaultParams, // Apply default parameters,
      ...overrideParams //Override with custom parameters.
    });

    const responseText = completion.choices[0]?.message?.content || 'No response from AI.';
    const responseId = completion.id;

    return {
      responseText,
      responseId,
    };
  }

  /**
   * Retrieves metadata for a response
   * @param responseId The response ID
   * @returns The response metadata
   */
  public async getResponseMetadata(responseId: string): Promise<{
    total_cost: number;
    tokens_completion: number;
  } | null> {
    try {
      // Delay for a second to allow processing, as described in the documentation.
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await fetch(`https://openrouter.ai/api/v1/generation?id=${responseId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`
        }
      });

      if (!response.ok) {
        console.error(`Metadata request failed with status: ${response.status}`);
        return null;
      }

      const data = await response.json();

      // Validate the response structure
      if (!data || typeof data !== 'object' || !data.data) {
        console.error('Invalid metadata response structure:', data);
        return null;
      }

      if (typeof data.data.total_cost === 'undefined' || typeof data.data.tokens_completion === 'undefined') {
        console.error('Missing required metadata fields:', data.data);
        return null;
      }

      return {
        total_cost: data.data.total_cost,
        tokens_completion: data.data.tokens_completion
      };

    } catch (error) {
      console.error('Error retrieving generation metadata:', error);
      return null;
    }
  }
}
