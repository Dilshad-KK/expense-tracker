// @ts-expect-error: next-pwa has no types
import withPWA from 'next-pwa';

const nextConfig = {
  reactStrictMode: false,
};

const pwaConfig = withPWA({
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    // Use a custom service worker (injectManifest mode)
    swSrc: 'service-worker.js',
    // Avoid caching Next.js middleware manifest
    buildExcludes: [/middleware-manifest\.json$/],
  },
});

// Merge them manually to avoid reactStrictMode getting into PWA config
export default {
  ...nextConfig,
  ...pwaConfig,
};
