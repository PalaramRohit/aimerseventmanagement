import { NextRequest } from 'next/server'

/**
 * Returns the base URL of the application.
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL (Explicit Production)
 * 2. NEXT_PUBLIC_VERCEL_URL (Vercel Deployments)
 * 3. http://localhost:3000 (Local Development fallback)
 */
export function getSiteUrl(): string {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? 
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 
    'http://localhost:3000';

  // Ensure it has a protocol
  if (!url.startsWith('http')) {
    url = `https://${url}`;
  }

  // Ensure it does not have a trailing slash
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }

  // Prevent localhost from bleeding into production if not strictly explicitly set
  // Note: Vercel sets VERCEL=1 or VERCEL_ENV
  if (process.env.VERCEL === '1' && url.includes('localhost')) {
    throw new Error('Localhost fallback is strictly forbidden in Vercel production environments. Set NEXT_PUBLIC_SITE_URL or ensure NEXT_PUBLIC_VERCEL_URL is available.')
  }

  return url;
}

/**
 * Ensures that auth callbacks use the statically trusted deployment domain.
 */
export function getSafeCallbackUrl(req?: NextRequest, path: string = '/auth/callback'): string {
  const baseUrl = getSiteUrl()
  
  // ensure path starts with a slash
  const safePath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${safePath}`
}
