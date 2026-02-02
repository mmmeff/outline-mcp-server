import axios, { AxiosInstance } from 'axios';
import { config } from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { RequestContext } from '../utils/toolRegistry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env'), quiet: true });

const API_URL = process.env.OUTLINE_API_URL || 'https://app.getoutline.com/api';

/**
 * Creates an Outline API client with the specified API key
 */
export function createOutlineClient(apiKey?: string): AxiosInstance {
  const key = apiKey || process.env.OUTLINE_API_KEY;

  if (!key) {
    throw new Error('OUTLINE_API_KEY must be provided either as parameter or environment variable');
  }

  return axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
}

/**
 * Gets an outline client using context API key first, then environment variable
 */
export function getOutlineClient(): AxiosInstance {
  const context = RequestContext.getInstance();
  const contextApiKey = context.getApiKey();

  if (contextApiKey) {
    return createOutlineClient(contextApiKey);
  }

  return createOutlineClient();
}

/**
 * Gets the default outline client using environment variable
 * Only validates when called, not on import
 */
export function getDefaultOutlineClient(): AxiosInstance {
  return createOutlineClient();
}

/**
 * Default client instance for backward compatibility
 * Note: This will only validate API key when first accessed, not on import
 */
let _defaultClient: AxiosInstance | null = null;
export const outlineClient = new Proxy({} as AxiosInstance, {
  get(target, prop) {
    if (!_defaultClient) {
      _defaultClient = getDefaultOutlineClient();
    }
    const value = _defaultClient[prop as keyof AxiosInstance];
    return typeof value === 'function' ? value.bind(_defaultClient) : value;
  },
});
