/* Service worker minimale: notifiche push Casa Mia (scadenze) */
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { title: 'Casa Mia', body: event.data ? event.data.text() : '' }
  }
  const title = data.title || 'Casa Mia'
  const body = data.body || 'Hai scadenze da controllare.'
  const url = data.url || '/deadlines'
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: { url },
      tag: 'casa-mia-deadlines',
      renotify: true,
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const path = event.notification.data?.url || '/deadlines'
  const full = new URL(path, self.location.origin).href
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          return client.focus().then(() => {
            if ('navigate' in client && typeof client.navigate === 'function') {
              try {
                return client.navigate(full)
              } catch {
                /* ignore */
              }
            }
          })
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(full)
      }
    })
  )
})
