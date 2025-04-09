// @ts-expect-error: next-pwa has no types
import withPWA from 'next-pwa';

const nextConfig = {
  reactStrictMode: true,
};

const pwaConfig = withPWA({
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
  },
});

// Merge them manually to avoid reactStrictMode getting into PWA config
export default {
  ...nextConfig,
  ...pwaConfig,
};