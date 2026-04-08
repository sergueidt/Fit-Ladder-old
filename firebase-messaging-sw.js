// ════════════════════════════════════════════════════════
//  firebase-messaging-sw.js
//  Service Worker para notificaciones push — Fit Ladder
//  Colocá este archivo en la RAÍZ del sitio (junto a index.html)
// ════════════════════════════════════════════════════════

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyBrKfGGS8V-GJZY1t3EHJGXzBPCbgWJb5k",
  authDomain:        "fit-ladder-py.firebaseapp.com",
  projectId:         "fit-ladder-py",
  storageBucket:     "fit-ladder-py.firebasestorage.app",
  messagingSenderId: "1089939861001",
  appId:             "1:1089939861001:web:35b669d3cdc03bf090d2d8"
});

const messaging = firebase.messaging();

// ── Notificación recibida con la app en BACKGROUND ───────────────────────
messaging.onBackgroundMessage(function(payload) {
  const { title, body, icon, data } = payload.notification || {};
  const notifTitle = title || '🏋️ Fit Ladder';
  const notifOpts  = {
    body:  body  || '',
    icon:  icon  || '/icon-192.png',
    badge: '/icon-192.png',
    data:  data  || {},
    vibrate: [200, 100, 200],
    tag: 'fitladder-push',          // agrupa notificaciones del mismo tipo
    renotify: true,
  };
  self.registration.showNotification(notifTitle, notifOpts);
});

// ── Click en la notificación → abrir/enfocar la app ──────────────────────
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Si la app ya está abierta, enfocala
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no, abrila
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
