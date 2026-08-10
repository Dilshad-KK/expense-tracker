// next-pwa v5 API: withPWA(pwaOptions) → wrapperFn → wrapperFn(nextConfig)
// The two calls MUST be separate — merging them sends Next.js keys (e.g.
// reactStrictMode) into workbox's GenerateSW plugin, causing warnings/errors.
// @ts-expect-error: next-pwa has no types
import withPWA from 'next-pwa';

const nextConfig = {
  reactStrictMode: false,
};

const pwaWrapper = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // Disable PWA entirely in dev — avoids the fallback-build-manifest.json
  // ENOENT crash that next-pwa v5 triggers against Next.js 14/15 builds.
  disable: process.env.NODE_ENV === 'development',
  // Use a custom service worker (injectManifest mode)
  swSrc: 'service-worker.js',
  // Avoid caching Next.js middleware manifest
  buildExcludes: [/middleware-manifest\.json$/],
});

export default pwaWrapper(nextConfig);

