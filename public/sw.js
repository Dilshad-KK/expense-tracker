// Dev service worker for next dev only.
// Provides minimal lifecycle and push handling so FCM token retrieval works.
// In production, next-pwa will generate its own sw.js from service-worker.js.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Basic push handler to surface data-only messages
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {};
  }
  const title = data.title || 'Notification';
  const body = data.body || '';
  const icon = data.icon || '/assets/icon-192x192.png';
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      data,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification && event.notification.data && event.notification.data.click_action) || '/';
  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of allClients) {
      const url = new URL(client.url);
      if (url.pathname === target && 'focus' in client) return client.focus();
    }
    if (self.clients.openWindow) return self.clients.openWindow(target);
  })());
});

