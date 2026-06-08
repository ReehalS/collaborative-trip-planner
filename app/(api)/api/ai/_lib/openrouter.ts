import { createOpenAI } from '@ai-sdk/openai';

export const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
});

// Cost-efficient model for most tasks
export const defaultModel = openrouter('google/gemini-2.0-flash-001');

// Web-search capable model for real-time info (hotels, prices, current events)
export const webSearchModel = openrouter('perplexity/sonar');
