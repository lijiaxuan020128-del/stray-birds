(() => {
  const panel = document.createElement('dialog');
  panel.setAttribute('aria-label', '飞鸟集沉浸展示');
  panel.style.cssText = 'position:fixed;inset:0;width:100vw;height:100dvh;max-width:none;max-height:none;margin:0;padding:0;border:0;background:#22282b;overflow:hidden';
  const frame = document.createElement('iframe');
  frame.title = '鸟类动态效果';
  frame.allow = 'fullscreen';
  frame.style.cssText = 'display:block;width:100%;height:100%;border:0';
  const controls = document.createElement('div');
  controls.style.cssText = 'position:absolute;top:16px;left:16px;display:flex;gap:8px';
  const back = document.createElement('button');
  back.textContent = '← 返回目录';
  const full = document.createElement('button');
  full.textContent = '全屏';
  controls.append(back, full);
  panel.append(frame, controls);
  document.body.append(panel);
  let previousFocus, previousOverflow;
  async function close() {
    if (document.fullscreenElement === panel) await document.exitFullscreen().catch(() => {});
    panel.close();
    frame.src = 'about:blank';
    document.body.style.overflow = previousOverflow;
    previousFocus?.focus();
  }
  back.onclick = close;
  panel.addEventListener('cancel', event => { event.preventDefault(); close(); });
  full.onclick = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await panel.requestFullscreen();
    } catch { toast('此浏览器暂不支持全屏，仍可在窗口内观看'); }
  };
  document.addEventListener('fullscreenchange', () => { full.textContent = document.fullscreenElement ? '退出全屏' : '全屏'; });
  function open(url) {
    const target = new URL(url, location.href);
    if (!['http:', 'https:'].includes(target.protocol)) { toast('效果链接格式不正确'); return; }
    if (target.hostname === 'editor.p5js.org') { toast('请填写独立效果页面地址；p5.js 分享链接仍会显示分享界面'); return; }
    previousFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    frame.src = target.href;
    panel.showModal();
    document.body.style.overflow = 'hidden';
    back.focus();
  }
  const originalActivate = activate;
  activate = function(b, part) {
    if (!preview) return originalActivate(b, part);
    if (b.name.includes('苍鹭')) return open('birds/heron/');
    if (b.url) return open(b.url);
    toast('这只鸟的效果链接还没有填写');
  };
})();
