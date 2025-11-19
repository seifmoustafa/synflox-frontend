/**
 * URL Helper Functions
 * Utilities for constructing full URLs for static assets
 */

/**
 * Get the backend base URL (without /api)
 * Removes /api from the API URL to get the static files base
 */
export function getBackendBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
  
  // Remove /api suffix if present
  if (apiUrl.endsWith("/api")) {
    return apiUrl.slice(0, -4);
  }
  
  return apiUrl;
}

/**
 * Get the full URL for a profile picture
 * @param profilePictureUrl - The relative path like "/profile/profile_username.jpg"
 * @returns Full URL like "http://localhost:5035/profile/profile_username.jpg"
 */
export function getFullProfilePictureUrl(profilePictureUrl: string | null | undefined): string | null {
  if (!profilePictureUrl) return null;
  
  const baseUrl = getBackendBaseUrl();
  
  // If it's already a full URL, return as-is
  if (profilePictureUrl.startsWith("http://") || profilePictureUrl.startsWith("https://")) {
    return profilePictureUrl;
  }
  
  // Remove leading slash if present (baseUrl might or might not have trailing slash)
  const path = profilePictureUrl.startsWith("/") ? profilePictureUrl : `/${profilePictureUrl}`;
  
  return `${baseUrl}${path}`;
}

/**
 * Get the full URL for any static file
 * @param path - The relative path like "/images/logo.png" or "/videos/demo.mp4"
 * @returns Full URL like "http://localhost:5035/images/logo.png"
 */
export function getFullStaticFileUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  
  const baseUrl = getBackendBaseUrl();
  
  // If it's already a full URL, return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  
  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  return `${baseUrl}${cleanPath}`;
}
