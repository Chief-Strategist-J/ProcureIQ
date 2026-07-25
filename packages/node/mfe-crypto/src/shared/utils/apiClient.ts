import { ApiValidationError } from '@/config/api-endpoints';
import { withTraceSpan } from '@/infra/tracing/tracer';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

export async function request<T>(
  url: string,
  options: RequestInit = {},
  actionContext: string,
  retryOpts: RetryOptions = {}
): Promise<T> {
  const httpMethod = options.method || 'GET';
  return withTraceSpan(`HTTP ${httpMethod} ${actionContext}`, async (span) => {
    span.setAttribute('http.url', url);
    span.setAttribute('http.method', httpMethod);
    span.setAttribute('action.context', actionContext);

    const maxRetries = retryOpts.maxRetries ?? 3;
    const baseDelayMs = retryOpts.baseDelayMs ?? 300;
    const maxDelayMs = retryOpts.maxDelayMs ?? 3000;

    const mergedHeaders = { ...DEFAULT_HEADERS, ...options.headers };
    const config: RequestInit = {
      ...options,
      headers: mergedHeaders,
    };

    let attempt = 0;

    while (true) {
      try {
        const response = await fetch(url, config);
        span.setAttribute('http.status_code', response.status);

        if (!response.ok) {
          if (response.status === 400) {
            const errorJson = await response.json();
            if (errorJson.data && errorJson.data.details) {
              throw new ApiValidationError(errorJson.data.message || 'Validation failed', errorJson.data.details);
            }
          }
          
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            throw new Error(`Request failed with status ${response.status}: ${response.statusText}`);
          }

          throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return result.data as T;

      } catch (e: any) {
        if (e.name === 'AbortError' || e instanceof ApiValidationError) {
          throw e;
        }

        attempt++;
        if (attempt > maxRetries) {
          throw new Error(`Failed to ${actionContext} after ${maxRetries} attempts. Error: ${e.message}`);
        }

        const expBackoff = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt - 1));
        const jitter = Math.random() * 0.5 * expBackoff;
        const totalDelay = Math.round(expBackoff + jitter);

        console.warn(`[Retry ${attempt}/${maxRetries}] ${actionContext} failed (${e.message}). Retrying in ${totalDelay}ms...`);
        await delay(totalDelay);
      }
    }
  });
}
