/* ============================================
   SERVICE WORKER - Mi Agenda 🤎
   Cache offline + Push notifications
   ============================================ */

const CACHE_NAME = 'mi-agenda-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// ─── INSTALL: cachear assets ────────────────
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(() => {
        // Si algún ícono no existe aún, continúa igual
        return cache.addAll(['/', '/index.html', '/style.css', '/app.js']);
      });
    })
  );
  self.skipWaiting();
});

// ─── ACTIVATE: limpiar caches viejos ────────
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ─── FETCH: cache first, network fallback ───
self.addEventListener('fetch', (e) => {
  // Solo cachear GETs al mismo origen
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Cachear la respuesta fresca
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // Sin conexión y no en cache
        if (e.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// ─── PUSH NOTIFICATIONS ─────────────────────
self.addEventListener('push', (e) => {
  let data = { title: 'Mi Agenda 🤎', body: 'Tienes tareas pendientes' };
  try { data = e.data.json(); } catch {}
  
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'agenda-push',
      requireInteraction: false,
    })
  );
});

// ─── NOTIFICATION CLICK ──────────────────────
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
