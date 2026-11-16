/* 目录页悬停粒子化：鸟贴图按不透明像素溶解成粒子，点击时爆散。
   状态机全部带版本令牌（rev / onRaf）：任何被推迟的 rAF 或定时器执行前
   都会先核对令牌与 states 中的现役状态，杜绝“reset 之后旧回调把贴图
   写成透明”这类永久卡死；粒子在视觉上耗尽后自动复位，不再依赖人工清理。 */
(() => {
  'use strict';
  const A = 28, M = 560;
  const C = {
    '普通鵟':[36,6.5,'#896343','#493326',1.5,.85],'金腰燕':[36,4,'#23385D','#E9C59B',1.5,1.32],
    '金翅雀':[38,5.4,'#ffca42','#64432B',1,.96],'苍鹭':[48,4.6,'#838b95','#e5ebf1',1.15,.78],
    '麻雀':[34,4.1,'#9D4B3D','#e5c7a4',1.2,1.05],'普通翠鸟':[30,3.5,'#38c9cc','#99dbc2',1,1.18],
    '普通雨燕':[36,3.4,'#26353D','#B8C4C7',.7,1.35],'太平鸟':[38,5.4,'#A58D73','#fbbb32',1,.96],
    '小䴙䴘':[32,4.6,'#795548','#5f1707',1,1.0],'针尾沙锥':[36,4.4,'#796044','#E1CAA1',1.1,1.06],
    '震旦鸦雀':[34,4.2,'#f3bc44','#9a5b28',1.2,1.08],'珠颈斑鸠':[38,4.8,'#A58D8C','#514945',1.5,.92],
    '红隼':[38,5.1,'#B87652','#332724',1.8,1.25],'白鹡鸰':[34,4.5,'#E4E6E3','#303331',1.5,1.12],
    '斑头雁':[46,5,'#D5D2C8','#343536',2.2,.92],'大斑啄木鸟':[38,5.3,'#B8322A','#52231F',2,1.0],
    '戴胜':[36,5,'#D98232','#5A351D',1.4,1.0],'黑水鸡':[36,4.5,'#541c2d','#282424',1,.98],
    '鸿雁':[46,5,'#89674F','#cab69b',1.8,.9],'家燕':[36,4,'#263E47','#e45b21',2,1.32],
    '栗鹀':[52,4.8,'#C15A28','#9A3D1D',1.1,1.05]
  };
  const cache = new Map(), states = new WeakMap(), pending = new WeakMap();
  let raf = 0, last = performance.now();
  let sampleEvent = null, lastSampleEvent = null, sampleScheduled = false, cursorHits = 0;

  // 粒子出现时鼠标必须是手型：光标类与粒子命中同步切换，
  // 即使有异常遮罩挡在条目上，悬停到手感也不会再丢。
  const cursorStyle = document.createElement('style');
  cursorStyle.textContent = 'html.birdHoverCursor,html.birdHoverCursor *{cursor:pointer!important}';
  document.head.append(cursorStyle);

  const name = e => e?.querySelector('img')?.alt || '';
  const cfg = e => C[name(e)] || null;
  const items = () => document.querySelectorAll('#canvas .item:not(.tag)');

  function inside(m, x, y) {
    if (!m || x < 0 || x > 1 || y < 0 || y > 1) return false;
    const X = Math.min(m.w - 1, Math.max(0, (x * m.w) | 0)), Y = Math.min(m.h - 1, Math.max(0, (y * m.h) | 0));
    return m.data[(Y * m.w + X) * 4 + 3] > A;
  }
  function mask(src) {
    if (cache.has(src)) return cache.get(src);
    const p = new Promise(ok => {
      const im = new Image();
      im.onload = () => {
        try {
          const s = Math.min(1, M / im.naturalWidth, M / im.naturalHeight);
          const w = Math.max(1, Math.round(im.naturalWidth * s)), h = Math.max(1, Math.round(im.naturalHeight * s));
          const c = document.createElement('canvas'); c.width = w; c.height = h;
          const x = c.getContext('2d', { willReadFrequently: true });
          x.drawImage(im, 0, 0, w, h);
          ok({ w, h, data: x.getImageData(0, 0, w, h).data });
        } catch { ok(null); }
      };
      im.onerror = () => ok(null);
      im.src = src;
    });
    cache.set(src, p);
    p.then(v => { p.__value = v; }).catch(() => {});
    return p;
  }
  function pool(m) {
    const a = [], sx = Math.max(1, (m.w / 120) | 0), sy = Math.max(1, (m.h / 120) | 0);
    for (let y = 0; y < m.h; y += sy) for (let x = 0; x < m.w; x += sx)
      if (m.data[(y * m.w + x) * 4 + 3] > A) a.push({ x: (x + .5) / m.w, y: (y + .5) / m.h });
    return a;
  }
  function spread(P, n, w, h) {
    if (!P.length) return Array.from({ length: n }, () => ({ x: .5, y: .5 }));
    const out = [P[(Math.random() * P.length) | 0]];
    while (out.length < n) {
      let best = P[(Math.random() * P.length) | 0], bd = -1;
      for (let k = 0; k < Math.min(420, P.length); k++) {
        const q = P[(Math.random() * P.length) | 0];
        let d = 1e20;
        for (const p of out) { const dx = (q.x - p.x) * w, dy = (q.y - p.y) * h; d = Math.min(d, dx * dx + dy * dy); }
        if (d > bd) { bd = d; best = q; }
      }
      out.push({ x: best.x, y: best.y });
    }
    return out;
  }
  function count(el, m, c) {
    const r = el.getBoundingClientRect();
    let s = 0, t = 0, step = Math.max(1, Math.floor(Math.sqrt(m.w * m.h / 9000)));
    for (let y = 0; y < m.h; y += step) for (let x = 0; x < m.w; x += step) { t++; if (m.data[(y * m.w + x) * 4 + 3] > A) s++; }
    return Math.max(20, Math.min(c[0], Math.round(Math.sqrt(r.width * r.height * s / Math.max(1, t)) / 5.2)));
  }
  function particle(q, s, i) {
    const a = Math.random() * 6.283, sp = s.c[5] * (.88 + Math.random() * .24);
    return { x: q.x, y: q.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, alpha: 0, i, turn: (Math.random() - .5) * .18 };
  }

  /* 粒子速度只看同一页内的相对大小：本页最大的鸟为基准速度，越小的鸟
     稍快一点（最多 +25%），不采用绝对像素——跨页的大小对比没有意义。
     每个粒子的瞬时速率在 move() 中每帧都归一化，全程恒定。 */
  function speedMul(s) {
    const rel = Math.min(1, s.rel || 1);
    return 1 + (1 - rel) * 0.25;
  }

  function setCursor(on) {
    cursorHits = on ? cursorHits + 1 : 0;
    const want = on || cursorHits > 0;
    if (want !== document.documentElement.classList.contains('birdHoverCursor'))
      document.documentElement.classList.toggle('birdHoverCursor', want);
  }
  function clearCursor() { cursorHits = 0; document.documentElement.classList.remove('birdHoverCursor'); }

  function reset(el) {
    const s = states.get(el);
    if (!s) return;
    s.rev++;                       // 让所有尚未执行的 rAF / 定时器全部失效
    s.hover = false; s.burst = false;
    s.im.style.opacity = '';
    s.im.style.transition = '';
    s.cv.remove();
    states.delete(el);
  }
  function resetAll() {
    items().forEach(reset);
    clearCursor();
  }
  window.resetCatalogParticles = resetAll;
  window.resetHeronCatalogParticles = resetAll;

  async function ensure(el) {
    let s = states.get(el);
    if (s) return s;
    let p = pending.get(el);
    if (p) return p;
    p = (async () => {
      const im = el.querySelector('img'), c = cfg(el), m = await mask(im.src);
      const again = states.get(el);
      if (again) return again;
      if (!c || !m || !preview || !el.isConnected) { pending.delete(el); return null; }
      const r = el.getBoundingClientRect(), P = pool(m), n = count(el, m, c);
      // 本页所有鸟里的最大尺寸作为速度基准：粒子速度只反映同页内的相对大小。
      let pageMax = 1;
      items().forEach(other => {
        const b = other.getBoundingClientRect();
        pageMax = Math.max(pageMax, b.width, b.height);
      });
      const cv = document.createElement('canvas');
      cv.className = 'catalogParticleLayer';
      cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3';
      el.append(cv);
      im.style.transition = 'opacity .28s ease';
      s = { el, im, cv, m, c, P, w: r.width, h: r.height, hover: false, burst: false, rev: 0, onRaf: 0,
            rel: Math.max(r.width, r.height) / pageMax, p: [] };
      s.p = spread(P, n, r.width, r.height).map((q, i) => particle(q, s, i));
      states.set(el, s);
      if (!raf) raf = requestAnimationFrame(tick);
      pending.delete(el);
      return s;
    })();
    pending.set(el, p);
    return p;
  }

  function hover(el, on) {
    if (on) {
      ensure(el).then(s => {
        if (!s || s.burst || states.get(el) !== s) return;
        s.rev++;                    // 抵消仍在倒计时的旧 off 定时器
        const my = ++s.onRaf;
        s.hover = true;
        requestAnimationFrame(() => {
          if (states.get(el) === s && s.hover && !s.burst && s.onRaf === my) s.im.style.opacity = '0';
        });
        setCursor(true);
      }).catch(() => {});
    } else {
      const s = states.get(el);
      if (!s || s.burst) return;
      s.rev++; s.onRaf++;
      s.hover = false;
      s.im.style.opacity = '1';
      const my = s.rev;
      setTimeout(() => { if (states.get(el) === s && !s.hover && !s.burst && s.rev === my) reset(el); }, 330);
      setCursor(false);
    }
  }

  function move(s, p, dt) {
    const sp = 1.7 * speedMul(s);
    const oldX = p.x, oldY = p.y;
    const current = Math.atan2(p.vy, p.vx);
    const step = Math.min(24, sp * dt * 60);
    const tryAngle = a => {
      const nx = p.x + Math.cos(a) * step / s.w, ny = p.y + Math.sin(a) * step / s.h;
      return inside(s.m, nx, ny) ? { a, nx, ny } : null;
    };
    let a = current + p.turn * dt, pick = tryAngle(a);
    if (!pick) {
      let best = null;
      for (let j = 1; j <= 28 && !best; j++) {
        const d = j * .075;
        const first = Math.random() < .5 ? 1 : -1;
        best = tryAngle(current + d * first) || tryAngle(current - d * first);
      }
      if (pick = best) { p.turn += (Math.random() - .5) * .04; }
      else {
        for (let j = 0; j < 30 && !pick; j++) {
          const q = s.P[(Math.random() * s.P.length) | 0];
          const ta = Math.atan2((q.y - p.y) * s.h, (q.x - p.x) * s.w);
          pick = tryAngle(ta);
        }
      }
    }
    if (pick) {
      const desiredX = Math.cos(pick.a) * sp, desiredY = Math.sin(pick.a) * sp, k = 1 - Math.exp(-dt * 9);
      p.vx += (desiredX - p.vx) * k; p.vy += (desiredY - p.vy) * k;
      const d = Math.hypot(p.vx, p.vy) || 1;
      p.vx = p.vx / d * sp; p.vy = p.vy / d * sp;
      const nx = p.x + p.vx * dt * 60 / s.w, ny = p.y + p.vy * dt * 60 / s.h;
      if (inside(s.m, nx, ny)) { p.x = nx; p.y = ny; }
      else { p.x = pick.nx; p.y = pick.ny; p.vx = Math.cos(pick.a) * sp; p.vy = Math.sin(pick.a) * sp; }
    }
    if (p.x === oldX && p.y === oldY) {
      const q = s.P[(Math.random() * s.P.length) | 0];
      const a2 = Math.atan2((q.y - p.y) * s.h, (q.x - p.x) * s.w);
      p.vx = Math.cos(a2) * sp; p.vy = Math.sin(a2) * sp;
    }
  }

  /* 返回 true 表示仍有可见/活动粒子；false 表示视觉已耗尽，调用方应复位该状态。 */
  function draw(s, dt) {
    const r = s.el.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
    s.w = r.width; s.h = r.height;
    const W = Math.max(1, Math.round(r.width * dpr)), H = Math.max(1, Math.round(r.height * dpr));
    if (s.cv.width !== W || s.cv.height !== H) { s.cv.width = W; s.cv.height = H; }
    const x = s.cv.getContext('2d');
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    x.clearRect(0, 0, r.width, r.height);
    let alive = s.hover;
    // 爆散速度同样只随同页相对大小微调，不随绝对像素变化。
    const boost = Math.min(1.45, Math.max(1.15, 1.25 + (1 - Math.min(1, s.rel || 1)) * 0.2));
    for (const p of s.p) {
      if (s.burst) {
        p.x += p.vx * dt * 70 * boost / r.width;
        p.y += p.vy * dt * 70 * boost / r.height;
        p.vx *= 1.02; p.vy *= 1.02;
        p.alpha = Math.max(0, p.alpha - dt * 1.8);
      } else {
        p.alpha = Math.max(0, Math.min(1, p.alpha + (s.hover ? dt * 5 : -dt * 5)));
        move(s, p, dt);
      }
      if (p.alpha > 0) alive = true;
      if (p.alpha <= 0) continue;
      x.globalAlpha = p.alpha;
      x.beginPath();
      x.arc(p.x * r.width, p.y * r.height, s.c[1], 0, 6.283);
      x.fillStyle = s.c[2]; x.fill();
      x.lineWidth = s.c[4]; x.strokeStyle = s.c[3]; x.stroke();
    }
    x.globalAlpha = 1;
    return alive;
  }

  function tick(now) {
    const dt = Math.min(.03, Math.max(.008, (now - last) / 1000));
    last = now;
    let active = false;
    items().forEach(el => {
      const s = states.get(el);
      if (s && el.isConnected) {
        if (draw(s, dt)) active = true;
        else reset(el);            // 粒子耗尽：悬停丢失或爆散孤儿状态自动复位
      }
    });
    raf = active ? requestAnimationFrame(tick) : 0;
  }

  /* 指针采样合并到每帧一次：高报告率鼠标不再每个事件都全量遍历条目。 */
  function sample(e) {
    let hits = 0;
    const probes = [];
    for (const el of items()) {
      if (!cfg(el)) continue;
      probes.push({ el, r: el.getBoundingClientRect(), im: el.querySelector('img') });
    }
    for (const { el, r, im } of probes) {
      let hit = false;
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
        hit = inside(maskSync(im.src), (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
        if (!hit) {
          // 蒙版可能尚未解码完成：异步补判一次，命中再补开粒子。
          mask(im.src).then(m => {
            if (states.get(el)?.hover) return;
            if (m && inside(m, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height) && samePoint(e)) hover(el, true);
          }).catch(() => {});
        }
      }
      const s = states.get(el);
      if (hit) { hits++; if (!s || !s.hover) hover(el, true); }
      else if (s?.hover && !s.burst) hover(el, false);
    }
    setCursor(hits > 0);
  }
  const maskSync = src => cache.get(src)?.__value;
  const samePoint = e => lastSampleEvent && Math.abs(lastSampleEvent.clientX - e.clientX) < 48 && Math.abs(lastSampleEvent.clientY - e.clientY) < 48;

  document.addEventListener('pointermove', e => {
    if (!preview) return;
    sampleEvent = e;
    if (sampleScheduled) return;
    sampleScheduled = true;
    requestAnimationFrame(() => {
      sampleScheduled = false;
      if (sampleEvent) { const ev = sampleEvent; lastSampleEvent = ev; sampleEvent = null; sample(ev); }
    });
  }, { passive: true });

  function unhoverAll() {
    items().forEach(el => { const s = states.get(el); if (s?.hover && !s.burst) hover(el, false); });
    clearCursor();
  }
  document.addEventListener('pointerleave', unhoverAll, true);
  document.addEventListener('pointercancel', unhoverAll, true);
  window.addEventListener('blur', unhoverAll);

  window.addEventListener('resize', () => {
    items().forEach(el => {
      const s = states.get(el);
      if (s) { const r = el.getBoundingClientRect(); s.w = r.width; s.h = r.height; }
    });
  }, { passive: true });

  const old = activate;
  activate = function (b, part) {
    if (!preview || part !== 'bird' || !C[b?.name]) return old(b, part);
    const el = [...items()].find(n => name(n) === b.name);
    if (!el) return old(b, part);
    const currentPage = page();
    let opened = false;
    const proceed = () => {
      if (opened) return;
      opened = true;
      clearTimeout(fallback);
      // 页面已被翻走或条目已重建时放弃打开，残余爆散状态由 tick 自动复位。
      if (preview && page() === currentPage && el.isConnected) old(b, part);
    };
    const fallback = setTimeout(proceed, 900);
    ensure(el).then(s => {
      if (opened) return;
      if (!s) return proceed();
      s.hover = false; s.rev++; s.onRaf++; s.burst = true;
      s.im.style.opacity = '0';
      const r = s.el.getBoundingClientRect();
      s.p.forEach(p => {
        const dx = (p.x - .5) * r.width, dy = (p.y - .5) * r.height, d = Math.hypot(dx, dy) || 1;
        const out = (1.05 + Math.random() * .55);
        p.vx = dx / d * out + 1;
        p.vy = dy / d * out - .55;
        p.alpha = 1;
      });
      if (!raf) raf = requestAnimationFrame(tick);
      setTimeout(proceed, 420);
    }).catch(proceed);
  };

  const oldRender = render;
  render = function () {
    resetAll();
    oldRender();
    // 每次渲染后预热全部蒙版（含同步快照），首次悬停零延迟。
    document.querySelectorAll('#canvas .item img').forEach(preheatMask);
  };
  // 渲染包装链的接入顺序存在竞态：无论本模块的 render 钩子是否在最外层，
  // 条目一进 DOM 就开始解码蒙版，保证首次悬停必定有粒子。
  function preheatMask(im) {
    if (!C[im.alt]) return;
    mask(im.src).then(v => { const p = cache.get(im.src); if (p) p.__value = v; }).catch(() => {});
  }
  new MutationObserver(muts => {
    for (const m of muts) for (const n of m.addedNodes) {
      if (n.nodeType !== 1) continue;
      if (n.matches?.('#canvas .item img')) preheatMask(n);
      n.querySelectorAll?.('#canvas .item img').forEach(preheatMask);
    }
  }).observe(document.querySelector('#canvas'), { childList: true, subtree: true });
})();
