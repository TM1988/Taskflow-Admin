/**
 * App URL utility
 * 
 * Use this to get the correct app URL for the current environment.
 * In development, it will use http://localhost:3000
 * In production, set NEXT_PUBLIC_APP_URL to your actual domain
 */

/**
 * Get the base app URL from environment variable
 * Falls back to localhost:3000 in development if not set
 */
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

/**
 * Get the WebSocket URL from environment variable
 * Falls back to localhost:3000 in development if not set
 */
export function getWsUrl(): string {
  return process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000';
}

/**
 * Build a full URL for a given path
 * @param path - The path to append to the app URL (e.g., '/api/users', '/invite/abc123')
 * @returns Full URL including protocol and domain
 */
export function buildAppUrl(path: string): string {
  const baseUrl = getAppUrl();
  // Remove trailing slash from baseUrl and leading slash from path if both exist
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}
