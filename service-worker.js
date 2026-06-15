const CACHE_NAME = 'crisma-shalom-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/frequencia.html',
  '/crismandos.html',
  '/aprovacoes.html',
  '/onboarding.html',
  '/anamnese.html',
  '/css/style.css',
  '/css/animations.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Não intercepta requisições ao Supabase (sempre vai para rede)
  if (event.request.url.includes('supabase.co')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match('/index.html'));
    })
  );
});

// Push notification
self.addEventListener('push', (event) => {
  const data = event.data?.json() || { title: 'Lembrete', body: 'Não esqueça de registrar a frequência!' };
  const options = {
    body: data.body,
    icon: '/assets/icons/icon-192.png',
    badge: '/assets/icons/icon-192.png',
    vibrate: [100, 50, 100],
    tag: 'lembrete-frequencia',
    renotify: true
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('/frequencia.html') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('/frequencia.html');
    })
  );
});
