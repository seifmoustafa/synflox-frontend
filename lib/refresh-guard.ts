type Waiter = (token: string | null) => void;

let isRefreshing = false;
let waiters: Waiter[] = [];

export async function withRefreshSingleFlight<T>(doRefresh: () => Promise<string | null>): Promise<string | null> {
  if (isRefreshing) {
    return new Promise<string | null>((resolve) => waiters.push(resolve));
  }
  isRefreshing = true;
  try {
    const token = await doRefresh();
    waiters.forEach((resolve) => resolve(token));
    waiters = [];
    return token;
  } finally {
    isRefreshing = false;
  }
}


