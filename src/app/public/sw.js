// self.addEventListener("push", function (event) {
//   const data = event.data.json();

//   self.registration.showNotification(data.title, {
//     body: data.body,
//     icon: "assets/dolan.png",
//     badge: "assets/dolan.png",
//   });
// });



self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Pesan Baru";
  const body = data.body || "Anda memiliki pesan baru.";
  const icon = data.icon || "assets/dolan.png";
  const badge = data.badge || "assets/dolan.png";
  const url = data.data?.url || "/";

  const options = {
    body: body,
    icon: icon,
    badge: badge,
    data: { url: url },
    vibrate: [200, 100, 200],
    actions: [
      { action: 'view', title: 'Lihat Pesan' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
