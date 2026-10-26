(() => {
  'use strict';
  const style = document.createElement('style');
  style.textContent = `
    html, body { margin: 0 !important; padding: 0 !important;
      width: 100% !important; height: 100% !important; overflow: hidden !important; }
    canvas.p5Canvas { position: fixed !important; left: 50% !important;
      top: 50% !important; transform: translate(-50%, -50%) !important;
      margin: 0 !important; max-width: none !important; max-height: none !important;
      display: block !important; }
  `;
  document.head.append(style);
  let canvas;
  function fit() {
    if (!canvas || !canvas.width || !canvas.height) return;
    const w = document.documentElement.clientWidth;
    const h = window.innerHeight;
    const ratio = canvas.width / canvas.height;
    const width = Math.max(w, h * ratio);
    canvas.style.setProperty('width', width + 'px', 'important');
    canvas.style.setProperty('height', width / ratio + 'px', 'important');
  }
  const dimensions = new MutationObserver(fit);
  function find() {
    const next = document.querySelector('canvas.p5Canvas');
    if (next && next !== canvas) {
      canvas = next;
      dimensions.disconnect();
      dimensions.observe(canvas, {attributes: true, attributeFilter: ['width', 'height']});
      fit();
    }
  }
  new MutationObserver(find).observe(document.body, {childList: true, subtree: true});
  window.addEventListener('resize', fit);
  document.addEventListener('fullscreenchange', fit);
  find();
})();
