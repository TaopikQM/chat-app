self.addEventListener("push", function (event) {
  const data = event.data.json();

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: "assets/dolan.png",
    badge: "assets/dolan.png",
  });
});
