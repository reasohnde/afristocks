// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Configuration Firebase (remplacer par vos clés)
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

// Gérer les messages en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Message reçu en arrière-plan:', payload);

  const notificationTitle = payload.notification?.title || 'AfriStocks';
  const notificationOptions = {
    body: payload.notification?.body || 'Nouvelle notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: payload.data?.tag || 'afristocks-notification',
    data: payload.data,
    requireInteraction: payload.data?.importance === 'URGENT',
    actions: []
  };

  // Ajouter des actions selon le type
  if (payload.data?.type === 'news') {
    notificationOptions.actions = [
      { action: 'view', title: 'Lire' },
      { action: 'dismiss', title: 'Fermer' }
    ];
  } else if (payload.data?.type === 'investment') {
    notificationOptions.actions = [
      { action: 'view', title: 'Voir détails' },
      { action: 'portfolio', title: 'Mon portfolio' }
    ];
  }

  // Afficher la notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gérer les clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Clic sur notification:', event);
  
  event.notification.close();

  let url = '/';
  
  // Déterminer l'URL selon l'action
  if (event.action === 'view') {
    url = event.notification.data?.url || '/actualites';
  } else if (event.action === 'portfolio') {
    url = '/portfolio';
  } else if (event.notification.data?.url) {
    url = event.notification.data.url;
  }

  // Ouvrir ou focus la fenêtre
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Chercher une fenêtre existante
        for (let client of windowClients) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Ouvrir une nouvelle fenêtre si nécessaire
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Gérer la fermeture des notifications
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification fermée:', event);
  
  // Envoyer analytics
  if (event.notification.data?.id) {
    fetch('/api/v1/analytics/notification-closed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationId: event.notification.data.id,
        timestamp: new Date().toISOString()
      })
    }).catch(console.error);
  }
});