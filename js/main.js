//registrando a service worker
if ('ServiceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      let reg;
      reg = await navigator.ServiceWorker.register('/sw.js', { type: "module" });

      console.log('Service worker registrada! 😎', reg);
    } catch (err) {
      console.log('😥 Service worker registro falhou: ', err);
    }
  });
}