/**
 * Refresh Guard - Single Flight Pattern
 * Ensures only one token refresh happens at a time across all concurrent requests
 */

type Waiter = (token: string | null) => void;

let isRefreshing = false;
let waiters: Waiter[] = [];

/**
 * Wrap a refresh function to ensure only one refresh happens at a time.
 * If a refresh is already in progress, subsequent calls will wait for it to complete
 * and receive the same token result.
 * 
 * @param doRefresh - Function that performs the actual token refresh
 * @returns The new access token or null if refresh failed
 */
export async function withRefreshSingleFlight(
  doRefresh: () => Promise<string | null>
): Promise<string | null> {
  if (isRefreshing) {
    // Already refreshing - queue this waiter
    return new Promise<string | null>((resolve) => waiters.push(resolve));
  }
  
  isRefreshing = true;
  try {
    const token = await doRefresh();
    // Notify all waiting requests
    waiters.forEach((resolve) => resolve(token));
    waiters = [];
    return token;
  } finally {
    isRefreshing = false;
  }
}
