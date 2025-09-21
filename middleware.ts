import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'hi'],
 
  // Used when no locale matches
  defaultLocale: 'en'
});
 
export const config = {
  // The matcher determines on which paths the middleware runs.
  matcher: [
    // Match the root path to enable a redirect to the default locale.
    '/',

    // Match all pathnames starting with a locale prefix (e.g., `/en/dashboard`).
    // This is used to set a cookie so the locale is remembered.
    '/(hi|en)/:path*',

    // Match all pathnames that are NOT system paths (e.g., /_next) and do NOT have a file extension
    // (e.g., .ico, .svg), and are NOT API routes.
    // This is the crucial part that adds the locale prefix to paths without one (e.g. /dashboard -> /en/dashboard).
    '/((?!_next|api|.*\\..*).*)'
  ]
};