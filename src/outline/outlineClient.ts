import axios, { AxiosInstance } from 'axios';
import { config } from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { RequestContext } from '../utils/toolRegistry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env') });

const DEFAULT_API_URL = 'https://app.getoutline.com/api';

/**
 * Normalizes the API URL by ensuring it ends with /api
 */
function normalizeApiUrl(url: string): string {
  if (!url) return DEFAULT_API_URL;
  
  const original = url;
  
  // Remove trailing slash if present
  url = url.replace(/\/$/, '');
  
  // Add /api if not already present
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  
  console.error(`[URL Normalization] ${original} -> ${url}`);
  
  return url;
}

/**
 * Creates an Outline API client with the specified API key and URL
 */
export function createOutlineClient(apiKey?: string, apiUrl?: string): AxiosInstance {
  const key = apiKey || process.env.OUTLINE_API_KEY;
  const rawUrl = apiUrl || process.env.OUTLINE_API_URL || DEFAULT_API_URL;
  const url = normalizeApiUrl(rawUrl);

  if (!key) {
    throw new Error('OUTLINE_API_KEY must be provided either as parameter or environment variable');
  }

  return axios.create({
    baseURL: url,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
}

/**
 * Gets an outline client using context API key and URL first, then environment variables
 */
export function getOutlineClient(): AxiosInstance {
  const context = RequestContext.getInstance();
  const contextApiKey = context.getApiKey();
  const contextApiUrl = context.getApiUrl();

  if (contextApiKey || contextApiUrl) {
    return createOutlineClient(contextApiKey, contextApiUrl);
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
