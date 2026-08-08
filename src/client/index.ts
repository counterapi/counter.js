import { 
  CounterConfig, 
  CounterResponse,
  CounterStatsResponse,
  HttpClient 
} from '../types/index.js';
import { AxiosHttpClient, API_CONFIG } from '../http/index.js';

/**
 * Main Counter client class
 */
export class Counter {
  private http: HttpClient;
  private workspace: string;

  constructor(config: CounterConfig) {
    this.workspace = config.workspace || '';

    if (!this.workspace) {
      throw new Error('Workspace is required');
    }

    // Initialize HTTP client
    this.http = new AxiosHttpClient({
      timeout: config.timeout,
      debug: config.debug,
      accessToken: config.accessToken
    });
  }

  /**
   * Get the current counter value
   * @param name - The counter name
   * @returns Promise resolving to counter response
   */
  async get(name: string): Promise<CounterResponse> {
    if (!name) {
      throw new Error('Counter name is required');
    }

    const endpoint = this.createEndpointUrl('get', { name });
    return await this.http.get<CounterResponse>(endpoint);
  }

  /**
   * Increment the counter value by 1
   * @param name - The counter name
   * @returns Promise resolving to counter response
   */
  async up(name: string): Promise<CounterResponse> {
    if (!name) {
      throw new Error('Counter name is required');
    }

    const endpoint = this.createEndpointUrl('up', { name });
    return await this.http.get<CounterResponse>(endpoint);
  }

  /**
   * Decrement the counter value by 1
   * @param name - The counter name
   * @returns Promise resolving to counter response
   */
  async down(name: string): Promise<CounterResponse> {
    if (!name) {
      throw new Error('Counter name is required');
    }

    const endpoint = this.createEndpointUrl('down', { name });
    return await this.http.get<CounterResponse>(endpoint);
  }

  /**
   * Reset the counter value to 0
   * @param name - The counter name
   * @returns Promise resolving to counter response
   */
  async reset(name: string): Promise<CounterResponse> {
    if (!name) {
      throw new Error('Counter name is required');
    }

    const endpoint = this.createEndpointUrl('reset', { name });
    return await this.http.get<CounterResponse>(endpoint);
  }

  /**
   * Get counter statistics
   * @param name - The counter name
   * @returns Promise resolving to counter stats response
   */
  async stats(name: string): Promise<CounterStatsResponse> {
    if (!name) {
      throw new Error('Counter name is required');
    }

    const endpoint = this.createEndpointUrl('stats', { name });
    return await this.http.get<CounterStatsResponse>(endpoint);
  }

  /**
   * Creates a URL by replacing placeholders in the endpoint pattern
   */
  private createEndpointUrl(method: string, params: { name: string }): string {
    const endpointPattern = API_CONFIG.endpoints[method as keyof typeof API_CONFIG.endpoints];

    if (!endpointPattern) {
      throw new Error(`Invalid method: ${method}`);
    }

    const urlParams = {
      workspace: this.workspace,
      ...params
    };

    // In axios HTTP client, create the URL by replacing placeholders
    return (this.http as AxiosHttpClient).createUrl(endpointPattern, urlParams);
  }
}

// Backward compatibility alias
export const CounterClient = Counter; 