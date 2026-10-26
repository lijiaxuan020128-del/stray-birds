(() => {
  const panel = document.createElement('dialog');
  panel.setAttribute('aria-label', '飞鸟集沉浸展示');
  panel.style.cssText = 'position:fixed;inset:0;width:100vw;height:100dvh;max-width:none;max-height:none;margin:0;padding:0;border:0;background:#27252e;overflow:hidden';

  const frame = document.createElement('iframe');
  frame.title = '鸟类动态效果';
  frame.allow = 'fullscreen';
  frame.style.cssText = 'display:block;width:100%;height:100%;border:0';

  const controls = document.createElement('div');
  controls.setAttribute('aria-label', '展示控制');
  controls.style.cssText = [
    'position:absolute',
    'right:28px',
    'bottom:22px',
    'z-index:20',
    'display:flex',
    'align-items:center',
    'gap:14px',
    'padding:7px 11px',
    'border:1px solid rgba(244,239,220,.16)',
    'background:rgba(39,37,46,.72)',
    'backdrop-filter:blur(8px)',
    '-webkit-backdrop-filter:blur(8px)',
    'box-shadow:0 5px 18px rgba(0,0,0,.12)',
    'font-family:Arial,"Microsoft Yahei",sans-serif',
    'letter-spacing:1.4px'
  ].join(';');

  function styleControl(button) {
    button.style.cssText = [
      'appearance:none',
      'border:0',
      'border-radius:0',
      'padding:2px 0',
      'margin:0',
      'background:transparent',
      'color:rgb(244,239,220)',
      'font:10px Arial,"Microsoft Yahei",sans-serif',
      'letter-spacing:1.4px',
      'line-height:1.5',
      'opacity:.58',
      'cursor:pointer',
      'white-space:nowrap'
    ].join(';');
    button.addEventListener('mouseenter', () => button.style.opacity = '1');
    button.addEventListener('mouseleave', () => button.style.opacity = '.58');
    button.addEventListener('focus', () => button.style.opacity = '1');
    button.addEventListener('blur', () => button.style.opacity = '.58');
  }

  const back = document.createElement('button');
  back.textContent = '← 目录';
  back.title = '返回目录';
  styleControl(back);

  const divider = document.createElement('span');
  divider.setAttribute('aria-hidden', 'true');
  divider.style.cssText = 'display:block;width:1px;height:11px;background:rgba(244,239,220,.16)';

  const full = document.createElement('button');
  full.textContent = '全屏 ↗';
  full.title = '全屏观看';
  styleControl(full);

  controls.append(back, divider, full);
  panel.append(frame, controls);
  document.body.append(panel);

  const localBirdPages = [
    ['苍鹭', 'birds/heron/'],
    ['麻雀', 'birds/sparrow/'],
    ['普通翠鸟', 'birds/kingfisher/'],
    ['普通雨燕', 'birds/swift/'],
    ['太平鸟', 'birds/waxwing/'],
    ['小䴙䴘', 'birds/little-grebe/?v=20261026-fit2'],
    ['针尾沙锥', 'birds/pin-tailed-snipe/'],
    ['震旦鸦雀', 'birds/reed-parrotbill/'],
    ['珠颈斑鸠', 'birds/spotted-dove-kestrel/'],
    ['红隼', 'birds/spotted-dove-kestrel/'],
    ['白鹡鸰', 'birds/white-wagtail/'],
    ['斑头雁', 'birds/bar-headed-goose/'],
    ['大斑啄木鸟', 'birds/great-spotted-woodpecker/'],
    ['戴胜', 'birds/hoopoe/'],
    ['黑水鸡', 'birds/moorhen/?v=20261026-fit2'],
    ['鸿雁', 'birds/swan-goose/'],
    ['家燕', 'birds/barn-swallow/']
  ];

  let previousFocus;

  async function close() {
    if (document.fullscreenElement === panel) await document.exitFullscreen().catch(() => {});
    panel.close();
    frame.src = 'about:blank';
    previousFocus?.focus();
  }

  back.onclick = close;
  panel.addEventListener('cancel', event => {
    event.preventDefault();
    close();
  });

  full.onclick = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await panel.requestFullscreen();
    } catch {
      toast('此浏览器暂不支持全屏，仍可在窗口内观看');
    }
  };

  document.addEventListener('fullscreenchange', () => {
    full.textContent = document.fullscreenElement ? '退出全屏' : '全屏 ↗';
  });

  function open(url) {
    if (panel.open) return;
    const target = new URL(url, location.href);
    if (!['http:', 'https:'].includes(target.protocol)) {
      toast('效果链接格式不正确');
      return;
    }
    if (target.hostname === 'editor.p5js.org') {
      toast('请填写独立效果页面地址；p5.js 分享链接仍会显示分享界面');
      return;
    }
    previousFocus = document.activeElement;
    frame.src = target.href;
    panel.showModal();
    back.focus();
  }

  function builtInEffect(name) {
    const item = localBirdPages.find(([birdName]) => name.includes(birdName));
    return item ? item[1] : '';
  }

  const originalActivate = activate;
  activate = function(b, part) {
    if (!preview) return originalActivate(b, part);
    const builtIn = builtInEffect(b.name);
    if (builtIn) return open(builtIn);
    if (b.url) return open(b.url);
    toast('这只鸟的效果链接还没有填写');
  };
})();