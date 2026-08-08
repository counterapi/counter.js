import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpClient, ApiError, ApiConfig } from '../types/index.js';

/**
 * API Configuration
 */
export const API_CONFIG: ApiConfig = {
  baseUrl: 'https://api.counterapi.dev/v2',
  endpoints: {
    up: '/{workspace}/{name}/up',
    down: '/{workspace}/{name}/down',
    get: '/{workspace}/{name}',
    reset: '/{workspace}/{name}/reset',
    stats: '/{workspace}/{name}/stats',
  },
};

/**
 * Axios-based HTTP client implementation
 */
export class AxiosHttpClient implements HttpClient {
  private client: AxiosInstance;
  private accessToken?: string;

  constructor(config: {
    timeout?: number;
    debug?: boolean;
    accessToken?: string;
  }) {
    this.accessToken = config.accessToken;

    this.client = axios.create({
      baseURL: API_CONFIG.baseUrl,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.accessToken && { 'Authorization': `Bearer ${config.accessToken}` })
      }
    });

    // Request interceptor for debugging
    if (config.debug) {
      this.client.interceptors.request.use((request) => {
        console.log('[CounterAPI] Request:', {
          method: request.method?.toUpperCase(),
          url: request.url,
          headers: request.headers,
          data: request.data
        });
        return request;
      });
    }

    // Response interceptor for debugging and error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        if (config.debug) {
          console.log('[CounterAPI] Response:', {
            status: response.status,
            data: response.data
          });
        }
        return response;
      },
      (error) => {
        if (config.debug) {
          console.log('[CounterAPI] Error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
          });
        }

        // Transform axios error to our custom error format
        const apiError: ApiError = {
          message: error.response?.data?.message || error.message || 'Request failed',
          status: error.response?.status,
          code: error.response?.data?.code || error.code,
          details: error.response?.data
        };

        throw apiError;
      }
    );
  }

  /**
   * Creates a URL by replacing placeholders in the endpoint pattern
   */
  createUrl(endpoint: string, params: Record<string, string | number>): string {
    let url = endpoint;
    
    // Replace named parameters in URL pattern
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`{${key}}`, String(value));
    }
    
    return url;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }
} 