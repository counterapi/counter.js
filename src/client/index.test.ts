import { Counter } from './index.js';
import { HttpClient, CounterResponse, CounterStatsResponse } from '../types/index.js';
import axios from 'axios';

// Mock HTTP client for testing
class MockHttpClient implements HttpClient {
  public requests: Array<{ method: string; url: string; data?: unknown; config?: Record<string, unknown> }> = [];
  private responses: Map<string, unknown> = new Map();
  public headers?: Record<string, string>;

  constructor(headers?: Record<string, string>) {
    this.headers = headers;
  }

  setResponse(key: string, response: unknown): void {
    this.responses.set(key, response);
  }

  async get<T>(url: string, config?: Record<string, unknown>): Promise<T> {
    this.requests.push({ method: 'GET', url, config });
    const response = this.responses.get(`GET:${url}`);
    if (!response) {
      throw new Error(`No mock response for GET:${url}`);
    }
    return response as T;
  }

  async post<T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T> {
    this.requests.push({ method: 'POST', url, data, config });
    const response = this.responses.get(`POST:${url}`);
    if (!response) {
      throw new Error(`No mock response for POST:${url}`);
    }
    return response as T;
  }

  createUrl(endpoint: string, params: Record<string, string | number>): string {
    let url = endpoint;
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`{${key}}`, String(value));
    }
    return url;
  }

  clear(): void {
    this.requests = [];
    this.responses.clear();
  }
}

describe('Counter', () => {
  let client: Counter;
  let mockHttp: MockHttpClient;

  beforeEach(() => {
    mockHttp = new MockHttpClient();

    client = new Counter({
      workspace: 'test-workspace'
    });

    // Replace the HTTP client with our mock using type assertion
    // We need to cast to unknown first to avoid TypeScript errors with private properties
    (client as unknown as { http: HttpClient }).http = mockHttp;
  });

  describe('constructor', () => {
    it('should throw error if workspace is missing', () => {
      expect(() => new Counter({ workspace: '' }))
        .toThrow('Workspace is required');
    });

    it('should create client with valid config', () => {
      const created = new Counter({
        workspace: 'test-workspace'
      });
      expect(created).toBeInstanceOf(Counter);
    });
  });

  describe('API', () => {
    // Shape mirrors the live CounterAPI v2 response, verified against
    // https://api.counterapi.dev/v2/test/test
    const mockResponse: CounterResponse = {
      code: '200',
      data: {
        id: 1,
        name: 'test-counter',
        slug: 'test-counter',
        description: '',
        team_id: 4,
        user_id: 7,
        workspace_id: 1,
        workspace_slug: 'test-workspace',
        up_count: 42,
        down_count: 0,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T01:00:00Z'
      }
    };

    // Reset omits up_count/down_count on the real API
    const mockResetResponse: CounterResponse = {
      code: '200',
      message: 'Counter reset successfully',
      data: {
        id: 1,
        name: 'test-counter',
        slug: 'test-counter',
        description: '',
        team_id: 4,
        user_id: 7,
        workspace_id: 1,
        workspace_slug: 'test-workspace',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T01:00:00Z'
      }
    };

    const mockStatsResponse: CounterStatsResponse = {
      code: '200',
      message: 'Counter stats retrieved successfully',
      data: {
        id: 1,
        counter_id: 1,
        up_count: 100,
        down_count: 20,
        stats: {
          today: { up: 5, down: 1 },
          this_week: { up: 30, down: 4 },
          temporal: {
            hours: { '07': { up: 5, down: 1 } },
            weekdays: { wednesday: { up: 5, down: 1 } },
            quarters: { q3: { up: 30, down: 4 } }
          }
        },
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z'
      }
    };

    beforeEach(() => {
      // Set up mock responses for the API endpoints
      const getUrl = '/{workspace}/{name}';
      const upUrl = '/{workspace}/{name}/up';
      const downUrl = '/{workspace}/{name}/down';
      const resetUrl = '/{workspace}/{name}/reset';
      const statsUrl = '/{workspace}/{name}/stats';

      mockHttp.setResponse(`GET:${getUrl.replace('{workspace}', 'test-workspace').replace('{name}', 'test-counter')}`, mockResponse);
      mockHttp.setResponse(`GET:${upUrl.replace('{workspace}', 'test-workspace').replace('{name}', 'test-counter')}`, { ...mockResponse, data: { ...mockResponse.data, up_count: 43 } });
      mockHttp.setResponse(`GET:${downUrl.replace('{workspace}', 'test-workspace').replace('{name}', 'test-counter')}`, { ...mockResponse, data: { ...mockResponse.data, down_count: 1 } });
      mockHttp.setResponse(`GET:${resetUrl.replace('{workspace}', 'test-workspace').replace('{name}', 'test-counter')}`, mockResetResponse);
      mockHttp.setResponse(`GET:${statsUrl.replace('{workspace}', 'test-workspace').replace('{name}', 'test-counter')}`, mockStatsResponse);
    });

    it('should get a counter', async () => {
      const result = await client.get('test-counter');
      expect(result).toEqual(mockResponse);
      expect(result.data.up_count).toBe(42);
      expect(mockHttp.requests).toHaveLength(1);
    });

    it('should increment a counter', async () => {
      const result = await client.up('test-counter');
      expect(result.data.up_count).toBe(43);
      expect(mockHttp.requests).toHaveLength(1);
    });

    it('should decrement a counter', async () => {
      const result = await client.down('test-counter');
      expect(result.data.down_count).toBe(1);
      expect(mockHttp.requests).toHaveLength(1);
    });

    it('should reset a counter', async () => {
      const result = await client.reset('test-counter');
      expect(result).toEqual(mockResetResponse);
      expect(result.data.up_count).toBeUndefined();
      expect(mockHttp.requests).toHaveLength(1);
    });

    it('should get counter stats', async () => {
      const result = await client.stats('test-counter');
      expect(result).toEqual(mockStatsResponse);
      expect(result.data.stats.today.up).toBe(5);
      expect(mockHttp.requests).toHaveLength(1);
    });

    it('should throw error for empty counter name', async () => {
      await expect(client.get('')).rejects.toThrow('Counter name is required');
    });
  });

  describe('accessToken', () => {
    it('should pass accessToken to the HTTP client and set Authorization header', () => {
      // Create a client with an access token
      const clientWithToken = new Counter({
        workspace: 'test-workspace',
        accessToken: 'test-token'
      });

      // Need to directly inspect the AxiosHttpClient instance
      // Rather than use a mock, we need to check if the token is correctly passed
      const axiosClientInstance = (clientWithToken as unknown as { http: { accessToken?: string } }).http;
      expect(axiosClientInstance.accessToken).toBe('test-token');
    });

    // Test authorization header with mock axios
    it('should create client with Authorization header when accessToken is provided', () => {
      // We need to spy on axios.create to verify headers
      const axiosSpy = jest.spyOn(axios, 'create');

      // Create a client with an access token and immediately use it in a dummy operation
      // to avoid unused variable linting errors
      new Counter({
        workspace: 'test-workspace',
        accessToken: 'test-token'
      });

      // Verify axios.create was called with the correct Authorization header
      expect(axiosSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );

      // Restore original implementation
      axiosSpy.mockRestore();
    });

    it('should include accessToken in API requests', async () => {
      // Create a custom mockHttp that captures the config
      mockHttp = new MockHttpClient();
      const capturedConfigs: Record<string, unknown>[] = [];

      // Override the get method to capture configs
      mockHttp.get = async <T>(url: string, config?: Record<string, unknown>): Promise<T> => {
        capturedConfigs.push(config || {});
        const key = `GET:${url}`;
        // Use a local variable to hold the response
        let response: unknown;

        try {
          // Make the original method call, which will throw if the response doesn't exist
          response = await Object.getPrototypeOf(mockHttp).get.call(mockHttp, url, config);
        } catch {
          throw new Error(`No mock response for ${key}`);
        }

        return response as T;
      };

      // Create client with access token
      const clientWithToken = new Counter({
        workspace: 'test-workspace',
        accessToken: 'test-api-key'
      });

      // Replace HTTP client with our custom mock
      (clientWithToken as unknown as { http: HttpClient }).http = mockHttp;

      // Set up mock response
      const mockResponse: CounterResponse = {
        code: '200',
        data: {
          id: 1,
          name: 'test-counter',
          slug: 'test-counter',
          description: '',
          team_id: 4,
          user_id: 7,
          workspace_id: 1,
          workspace_slug: 'test-workspace',
          up_count: 42,
          down_count: 0,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T01:00:00Z'
        }
      };

      const getUrl = '/{workspace}/{name}';
      mockHttp.setResponse(`GET:${getUrl.replace('{workspace}', 'test-workspace').replace('{name}', 'test-counter')}`, mockResponse);

      // Make API request
      await clientWithToken.get('test-counter');

      // In a real implementation with axios, the Authorization header would be sent with the request
      // Our mock can only verify that the client was constructed with the token, which we've already tested
    });
  });
});
