/* One stationary identity strip for every page in the book. */
(() => {
  'use strict';
  const frame = document.querySelector('#frame');
  if (!frame) return;
  frame.querySelector('.bookIdentityFrame')?.remove();
  const layer = document.createElement('div');
  layer.className = 'bookIdentityFrame';
  layer.style.cssText = 'position:absolute;left:0;top:0;width:1200px;height:760px;transform-origin:top left;pointer-events:none;z-index:55';
  const identity = document.createElement('div');
  identity.className = 'bookIdentity';
  identity.textContent = 'FIELD NOTES / 飞鸟集';
  identity.style.cssText = 'position:absolute;left:48px;top:26px;font:12px/14px Arial,"Microsoft Yahei",sans-serif;letter-spacing:2px;white-space:nowrap';
  const line = document.createElement('div');
  line.className = 'bookIdentityRule';
  line.setAttribute('aria-hidden', 'true');
  line.style.cssText = 'position:absolute;left:48px;top:58px;width:1104px;height:1px;background:currentColor;opacity:.25';
  layer.append(identity, line);
  frame.append(layer);
  function sync() {
    layer.style.transform = `scale(${frame.getBoundingClientRect().width / 1200})`;
    layer.style.color = page()?.type === 'cover'
      ? page().cover?.ink || '#f4efdc'
      : theme().ink;
    // Also handles older saved HTML and iframe stylesheet caches.
    frame.querySelectorAll('.catalogKicker,.pageLine').forEach(el => el.remove());
    try {
      const header = document.querySelector('#coverSurface')?.contentDocument?.querySelector('header');
      if (header) header.style.display = 'none';
    } catch {}
  }
  const previousRender = render;
  render = function () { previousRender(); sync(); };
  new ResizeObserver(sync).observe(frame);
  document.querySelector('#coverSurface')?.addEventListener('load', sync);
  sync();
})();
