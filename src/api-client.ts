import type { ApiError } from './types/api-types.js';

/**
 * HTTP client for Car2DB API v3
 * Supports automatic authorization, retry logic, and error handling
 */
export class Car2DBApiClient {
  private readonly baseUrl = 'https://v3.api.car2db.com';
  private readonly apiKey: string;
  private referer: string;
  private readonly language: string;
  private readonly timeout = 30000; // 30 seconds
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second base delay

  constructor(apiKey: string, referer: string = 'unknown', language: string = 'en-US') {
    this.apiKey = apiKey;
    this.referer = referer;
    this.language = language;
  }

  /**
   * Sets the Referer header value
   */
  setReferer(referer: string): void {
    this.referer = referer;
  }

  /**
   * Performs a GET request to the API
   */
  async get<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
    const url = this.buildUrl(path, params);
    return this.fetchWithRetry<T>(url);
  }

  /**
   * Building URL with query parameters
   */
  private buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  }

  /**
   * Executes request with retry logic
   */
  private async fetchWithRetry<T>(url: string, retryCount = 0): Promise<T> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return await response.json() as T;
    } catch (error) {
      // Retry on network errors or 5xx
      if (
        retryCount < this.maxRetries &&
        (this.isRetryableError(error) || (error instanceof Error && error.name === 'AbortError'))
      ) {
        const delay = this.retryDelay * Math.pow(2, retryCount);
        await this.sleep(delay);
        return this.fetchWithRetry<T>(url, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Getting headers for the request
   */
  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Referer': this.referer,
      'Accept-Language': this.language,
      'Accept': 'application/json',
    };
  }

  /**
   * HTTP error handling
   */
  private async handleErrorResponse(response: Response): Promise<ApiError> {
    const status = response.status;
    const statusText = response.statusText;

    let details = '';
    try {
      const body = await response.json() as Record<string, unknown>;
      details = String(body.message || body.detail || body.error || '');
    } catch {
      // Failed to parse body, using statusText
    }

    const error: ApiError = {
      error: statusText || 'Unknown Error',
      status,
      details: details || undefined,
      hint: this.getErrorHint(status),
    };

    return error;
  }

  /**
   * Getting hint for error by status code
   */
  private getErrorHint(status: number): string {
    switch (status) {
      case 400:
        return 'Check parameter values and types';
      case 401:
        return 'Invalid API key. Get one at https://car2db.com/api/';
      case 403:
        return 'Access denied. Check your API key permissions and Referer header';
      case 404:
        return 'Resource not found. Verify the ID using search or list tools';
      case 429:
        return 'Rate limit exceeded. Wait before retrying';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Server error. Try again in a moment';
      default:
        return 'Unexpected error occurred';
    }
  }

  /**
   * Checking if the error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as ApiError).status;
      return status >= 500 && status < 600;
    }
    return false;
  }

  /**
   * Utility for delay
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
