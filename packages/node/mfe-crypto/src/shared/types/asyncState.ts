export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AsyncState<T> {
  data: T;
  status: RequestStatus;
  error: string | null;
  /** Human-readable message set after a successful mutation (create/update/delete). Cleared on next request. */
  lastAction: string | null;
}

export function createAsyncState<T>(initial: T): AsyncState<T> {
  return { data: initial, status: 'idle', error: null, lastAction: null };
}
