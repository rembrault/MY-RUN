// Custom service worker additions for MY RUN
// Ce fichier est importé par le SW généré par VitePWA

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    // Ouvrir l'app ou la ramener au premier plan
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
