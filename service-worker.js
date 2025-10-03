// Custom service worker bundled via next-pwa (injectManifest)
// Workbox precaching + Firebase Cloud Messaging background notifications

import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

self.skipWaiting();
clientsClaim();

// Precache assets injected at build time
// eslint-disable-next-line no-undef
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

// Runtime caching for same-origin images and assets
registerRoute(
  ({ request }) => request.destination === 'image' || request.destination === 'style' || request.destination === 'script',
  new StaleWhileRevalidate()
);

// Optional: allow page to trigger skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// --- Firebase Cloud Messaging (background) ---
// Use compat build to initialize in SW
// Keeping versions modestly up-to-date; adjust if needed.
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Read Firebase config from environment at build time. If missing, skip FCM init.
const firebaseConfig = {
  // Prefer NEXT_PUBLIC_FIREBASE_API (no _KEY), fallback to legacy name
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API || process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

try {
  const allPresent = Object.values(firebaseConfig).every((v) => typeof v === 'string' && v.length > 0);
  if (allPresent && self.firebase && typeof self.firebase.initializeApp === 'function') {
    self.firebase.initializeApp(firebaseConfig);
    const messaging = self.firebase.messaging();

    // Handle background notification payloads
    messaging.onBackgroundMessage((payload) => {
      const d = payload?.data || {};
      const n = payload?.notification || {};
      const title = d.title || n.title || 'Notification';
      const body = d.body || n.body || '';
      const icon = d.icon || n.icon || '/assets/icon-192x192.png';
      const badge = d.badge || n.badge;
      const image = d.image || n.image;
      const requireInteraction = (d.requireInteraction || n.requireInteraction) === 'true' || (d.requireInteraction === true);
      let actions = undefined;
      try { if (d.actions) actions = JSON.parse(d.actions); } catch {}
      let vibrate = undefined;
      try {
        if (d.vibrate) {
          vibrate = Array.isArray(d.vibrate) ? d.vibrate : JSON.parse(d.vibrate);
        }
      } catch {}

      const options = {
        body,
        icon,
        badge,
        image,
        requireInteraction,
        vibrate,
        actions,
        data: d,
      };
      self.registration.showNotification(title, options);
    });
  } else {
    // No config present; FCM disabled in SW
    // console.debug('FCM not initialized in SW: missing config');
  }
} catch (e) {
  // console.error('FCM init error in SW', e);
}

// --- Standards Web Push (for iOS and others) ---
// Only handle payloads explicitly marked as web push to avoid duplicate handling with FCM
self.addEventListener('push', (event) => {
  try {
    const data = event.data ? event.data.json() : null;
    if (!data || (data && data.source !== 'wp')) return;
    const title = data.title || 'Notification';
    const body = data.body || '';
    const icon = data.icon || '/assets/icon-192x192.png';
    const badge = data.badge;
    const image = data.image;
    const requireInteraction = data.requireInteraction === true || data.requireInteraction === 'true';
    const actions = data.actions;
    const vibrate = data.vibrate;
    const options = { body, icon, badge, image, requireInteraction, actions, vibrate, data };
    // Also inform open clients so they can show an in-app toast when foreground
    event.waitUntil((async () => {
      try {
        const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        clientList.forEach((c) => {
          try { c.postMessage({ type: 'PUSH', title, body, icon, image, data }); } catch {}
        });
      } catch {}
      await self.registration.showNotification(title, options);
    })());
  } catch (e) {
    // ignore malformed payloads
  }
});

// Focus/open a window when the notification is clicked
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification && event.notification.data ? event.notification.data : {};
  // If an action button was clicked, prefer its URL if provided
  let target = data.click_action || '/';
  if (event.action && data.actions) {
    try {
      const actions = Array.isArray(data.actions) ? data.actions : JSON.parse(data.actions);
      const matched = (actions || []).find((a) => a.action === event.action && a.url);
      if (matched && matched.url) target = matched.url;
    } catch {}
  }
  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of allClients) {
      const url = new URL(client.url);
      if (url.pathname === target && 'focus' in client) {
        return client.focus();
      }
    }
    if (self.clients.openWindow) {
      return self.clients.openWindow(target);
    }
  })());
});
