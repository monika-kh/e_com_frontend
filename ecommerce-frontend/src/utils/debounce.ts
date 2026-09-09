/**
 * Debounce Utility
 * Delays function execution until after specified milliseconds of inactivity
 */

export interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): Promise<ReturnType<T>>;
  cancel: () => void;
  flush: () => Promise<void>;
  pending: boolean;
}

/**
 * Creates a debounced version of a function
 * Multiple calls within the delay window are coalesced into a single execution
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): DebouncedFunction<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;
  let pending = false;
  let lastPromise: Promise<any> | null = null;

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args;
    pending = true;

    // Return the last promise to maintain consistency
    lastPromise = new Promise((resolve, reject) => {
      if (timeoutId) clearTimeout(timeoutId);

      timeoutId = setTimeout(async () => {
        try {
          const result = await func(...lastArgs!);
          pending = false;
          resolve(result);
        } catch (error) {
          pending = false;
          reject(error);
        } finally {
          timeoutId = null;
          lastArgs = null;
        }
      }, delay);
    });

    return lastPromise;
  };

  // Allow manual cancellation
  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    pending = false;
    lastArgs = null;
  };

  // Allow manual flushing (immediate execution of pending call)
  debounced.flush = async () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      timeoutId = null;
      const args = lastArgs;
      lastArgs = null;
      pending = false;
      return await func(...args);
    }
    return Promise.resolve();
  };

  // Track pending state
  Object.defineProperty(debounced, 'pending', {
    get: () => pending,
  });

  return debounced as DebouncedFunction<T>;
}

/**
 * Creates a map-based debouncer for handling multiple independent operations
 * Each key gets its own debounce timer
 * Useful for cart updates where each product has independent debounce
 */
export class DebouncedMap<K extends number | string, V> {
  private debouncedFunctions: Record<string, { timeout: NodeJS.Timeout | null; args: V; pending: boolean }> = {};
  private delay: number;
  private executor: (key: K, value: V) => Promise<void>;

  constructor(delay: number, executor: (key: K, value: V) => Promise<void>) {
    this.delay = delay;
    this.executor = executor;
  }

  /**
   * Queue an update for a specific key
   * If an update is already pending for this key, it will be replaced
   */
  async set(key: K, value: V): Promise<void> {
    const keyStr = String(key);

    // Clear existing timeout if any
    const existing = this.debouncedFunctions[keyStr];
    if (existing?.timeout) {
      clearTimeout(existing.timeout);
    }

    // Create new pending timeout
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(async () => {
        try {
          await this.executor(key, value);
          this.debouncedFunctions[keyStr] = { timeout: null, args: value, pending: false };
          resolve();
        } catch (error) {
          reject(error);
        }
      }, this.delay);

      this.debouncedFunctions[keyStr] = { timeout, args: value, pending: true };
    });
  }

  /**
   * Immediately flush all pending updates
   */
  async flushAll(): Promise<void> {
    const promises: Promise<void>[] = [];
    const keys = Object.keys(this.debouncedFunctions);

    for (let i = 0; i < keys.length; i++) {
      const keyStr = keys[i];
      const state = this.debouncedFunctions[keyStr];

      if (state && state.pending && state.timeout) {
        clearTimeout(state.timeout);
        const key = keyStr as unknown as K;
        promises.push(
          this.executor(key, state.args).then(() => {
            this.debouncedFunctions[keyStr] = { timeout: null, args: state.args, pending: false };
          })
        );
      }
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  /**
   * Flush a specific key's pending update
   */
  async flush(key: K): Promise<void> {
    const keyStr = String(key);
    const state = this.debouncedFunctions[keyStr];

    if (state?.pending && state.timeout) {
      clearTimeout(state.timeout);
      await this.executor(key, state.args);
      this.debouncedFunctions[keyStr] = { timeout: null, args: state.args, pending: false };
    }
  }

  /**
   * Cancel all pending updates
   */
  cancelAll(): void {
    const keys = Object.keys(this.debouncedFunctions);

    for (let i = 0; i < keys.length; i++) {
      const keyStr = keys[i];
      const state = this.debouncedFunctions[keyStr];

      if (state?.timeout) {
        clearTimeout(state.timeout);
      }
    }

    this.debouncedFunctions = {};
  }

  /**
   * Check if there are any pending updates
   */
  hasPending(): boolean {
    const keys = Object.keys(this.debouncedFunctions);

    for (let i = 0; i < keys.length; i++) {
      const state = this.debouncedFunctions[keys[i]];
      if (state?.pending) return true;
    }
    return false;
  }

  /**
   * Get pending updates count
   */
  getPendingCount(): number {
    let count = 0;
    const keys = Object.keys(this.debouncedFunctions);

    for (let i = 0; i < keys.length; i++) {
      const state = this.debouncedFunctions[keys[i]];
      if (state?.pending) count++;
    }
    return count;
  }
}
