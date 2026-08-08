/**
 * Configuration options for the Counter client
 */
export interface CounterConfig {
  /** The workspace identifier */
  workspace?: string;
  /** Request timeout in milliseconds (optional, defaults to 10000) */
  timeout?: number;
  /** Enable debug logging (optional, defaults to false) */
  debug?: boolean;
  /** Authentication token for API requests */
  accessToken?: string;
}

/**
 * Counter data payload returned by get/up/down/reset
 */
export interface CounterData {
  id: number;
  name: string;
  slug: string;
  description: string;
  team_id: number;
  user_id: number;
  workspace_id: number;
  workspace_slug: string;
  /** Omitted from the reset response */
  up_count?: number;
  /** Omitted from the reset response */
  down_count?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Counter response structure
 */
export interface CounterResponse {
  code: string;
  message?: string;
  data: CounterData;
}

/**
 * Up/down counts for a period of time
 */
export interface CounterPeriodStats {
  up: number;
  down: number;
}

/**
 * Counter stats data payload
 */
export interface CounterStatsData {
  id: number;
  counter_id: number;
  up_count: number;
  down_count: number;
  stats: {
    today: CounterPeriodStats;
    this_week: CounterPeriodStats;
    temporal: {
      hours: Record<string, CounterPeriodStats>;
      weekdays: Record<string, CounterPeriodStats>;
      quarters: Record<string, CounterPeriodStats>;
    };
  };
  created_at: string;
  updated_at: string;
}

/**
 * Counter stats response structure
 */
export interface CounterStatsResponse {
  code: string;
  message?: string;
  data: CounterStatsData;
}

/**
 * HTTP client interface for dependency injection
 */
export interface HttpClient {
  get<T>(url: string, config?: Record<string, unknown>): Promise<T>;
  post<T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T>;
  createUrl(endpoint: string, params: Record<string, string | number>): string;
}

/**
 * API configuration structure
 */
export interface ApiConfig {
  baseUrl: string;
  endpoints: {
    up: string;
    down: string;
    get: string;
    reset: string;
    stats: string;
  };
}

/**
 * Error response structure from the API
 */
export interface ApiError {
  /** Error message */
  message: string;
  /** Error code */
  code?: string;
  /** HTTP status code */
  status?: number;
  /** Additional error details */
  details?: Record<string, unknown>;
} 