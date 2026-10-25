// 飞鸟集 · 工作台扩展：效果链接 / 沉浸层 / 撤销重做 / 编号调整 / 发布支持
// 依赖 app.js 的全局：book, pi, selected, part, preview, toast, changed, render, bird, renumberBirds, go, $
(function(){
  'use strict';

  /* ---- 双击打开守卫：统一走本地服务 ---- */
  if(location.protocol==='file:'){
    document.body.innerHTML='<div style="position:fixed;inset:0;z-index:999;background:#eae9e2;color:#293b34;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;font-family:Georgia,\'Microsoft Yahei\',serif;text-align:center;padding:20px">'
      +'<div style="font-size:24px;letter-spacing:.25em">请通过「启 动 . bat」打开本页面</div>'
      +'<div style="opacity:.7;font-size:14px;line-height:2">双击方式无法读取你布置的目录（数据存在本地服务一侧）<br>正在自动跳转，若失败请先双击文件夹里的 启动.bat</div>'
      +'<button onclick="location.href=\'http://localhost:8765/index.html?from=file\'" style="font:inherit;font-size:15px;letter-spacing:.2em;padding:10px 26px;background:#334e40;color:#fff;border:none;cursor:pointer;border-radius:5px">已启动，进入</button>'
      +'</div>';
    setTimeout(()=>{location.href='http://localhost:8765/index.html?from=file';},1500);
    return;
  }

  /* ---- 访客/编辑者 ---- */
  const CAN_EDIT=location.hostname==='localhost'||location.hostname==='127.0.0.1'||location.search.includes('edit');

  /* ---- 效果页链接登记表：鸟名 → 网址 ---- */
  const LINKS={};

  /* ---- p5 分享链接自动转 embed ---- */
  function normalize(url){
    if(/editor\.p5js\.org\//.test(url)&&url.includes('/full/')) return url.replace('/full/','/embed/');
    return url;
  }
  function syncLinks(){
    book.pages.flatMap(p=>p.birds).forEach(b=>{
      if(LINKS[b.name]&&(!b.url||/^pages\//.test(b.url))) b.url=LINKS[b.name];
    });
  }

  /* ---- 沉浸式效果层（裁掉 p5 顶栏） ---- */
  const evStyle=document.createElement('style');
  evStyle.textContent=[
    '#effectView{position:fixed;inset:0;z-index:90;background:#27252e;display:none;flex-direction:column}',
    '#effectView.on{display:flex}',
    '.ev-bar{height:42px;flex:0 0 42px;display:flex;align-items:center;gap:16px;padding:0 16px;background:#f9f8f3;color:#293b34;border-bottom:1px solid #d4d8ce}',
    '.ev-bar button{cursor:pointer;font:inherit;border:1px solid #c9cec6;background:#fffef9;color:#34483c;padding:6px 14px;border-radius:5px}',
    '.ev-bar button:hover{background:#e8eee4}',
    '#evName{font-size:13px;letter-spacing:.3em}',
    '#evTip{margin-left:auto;font-size:11px;letter-spacing:.15em;opacity:.5}',
    '.ev-body{position:relative;flex:1;overflow:hidden}',
    '.ev-body iframe{position:absolute;top:-56px;left:0;width:100%;height:calc(100% + 56px);border:0;background:#fff}'
  ].join('');
  document.head.append(evStyle);
  const ev=document.createElement('div');
  ev.id='effectView';
  ev.innerHTML='<div class="ev-bar"><button id="evBack">← 返回目录</button><span id="evName"></span><span id="evTip">ESC 退出</span></div><div class="ev-body"><iframe title="效果页"></iframe></div>';
  document.body.append(ev);
  let effectOpen=false;
  function openEffect(url,name){
    ev.querySelector('iframe').src=normalize(url);
    ev.querySelector('#evName').textContent=name||'';
    ev.classList.add('on');
    effectOpen=true;
    document.body.style.overflow='hidden';
  }
  function closeEffect(){
    ev.classList.remove('on');
    ev.querySelector('iframe').src='about:blank';
    effectOpen=false;
    document.body.style.overflow='';
  }
  ev.querySelector('#evBack').onclick=closeEffect;
  document.addEventListener('keydown',e=>{if(effectOpen&&e.key==='Escape')closeEffect();});

  /* ---- 点击鸟类 → 打开效果页 ---- */
  const prevActivate=activate;
  activate=function(b,part){
    if(!preview) return prevActivate(b,part);
    const url=normalize((b.url||'').trim()||LINKS[b.name]||'');
    if(!url){toast('「'+(b.name||'这只鸟')+'」的效果链接还没有填写');return;}
    openEffect(url,b.name);
  };

  /* ---- 撤销 / 重做 ---- */
  let hist=[],hi=-1,htimer=null;
  function snap(){
    const j=JSON.stringify(book);
    if(hist[hi]===j)return;
    hist=hist.slice(0,hi+1);
    hist.push(j);
    if(hist.length>40)hist.shift();
    hi=hist.length-1;
  }
  const prevChanged=changed;
  changed=function(){prevChanged();clearTimeout(htimer);htimer=setTimeout(snap,350);};
  function applyHist(){
    book=JSON.parse(hist[hi]);
    pi=Math.min(pi,book.pages.length-1);
    selected=null;
    render();dirty=true;prevChanged();
  }
  function undo(){
    if(!preview&&!document.body.classList.contains('preview')){}
    if(hi<=0){toast('没有可撤销的操作');return;}
    hi--;applyHist();
  }
  function redo(){
    if(hi>=hist.length-1){toast('没有可重做的操作');return;}
    hi++;applyHist();
  }
  document.addEventListener('keydown',e=>{
    if(effectOpen)return;
    if(/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)||document.activeElement.isContentEditable)return;
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!e.shiftKey){e.preventDefault();undo();}
    else if((e.ctrlKey||e.metaKey)&&(e.key.toLowerCase()==='y'||(e.key.toLowerCase()==='z'&&e.shiftKey))){e.preventDefault();redo();}
  });
  const act=document.querySelector('.actions');
  const rb=document.createElement('button');rb.textContent='重做';rb.className='editOnly';rb.onclick=redo;
  const ub=document.createElement('button');ub.textContent='撤销';ub.className='editOnly';ub.onclick=undo;
  const saveBtn=document.querySelector('#save');
  act.insertBefore(rb,saveBtn);act.insertBefore(ub,rb);

  /* ---- 链接与编号面板 ---- */
  const box=document.createElement('details');
  box.className='stylePanel editOnly';
  box.innerHTML='<summary>效果链接 · 编号调整</summary><div></div>';
  const nb=box.querySelector('div');
  const info=document.createElement('p');
  info.className='status';info.textContent='点击选中一只鸟后在这里调整';
  nb.append(info);
  const urlInput=document.createElement('input');
  urlInput.type='text';urlInput.placeholder='https:// 效果页地址';
  urlInput.style.cssText='width:100%;padding:9px;margin-top:6px;border:1px solid #cdd2c7;border-radius:4px;background:#fffef9;color:#30412f';
  nb.append(urlInput);
  urlInput.addEventListener('change',()=>{
    const b0=bird();if(!b0)return;
    b0.url=urlInput.value.trim();changed();toast('链接已更新');
  });
  function flatOrdered(){
    return book.pages.flatMap(p=>p.birds)
      .map((b,i)=>({b,i,n:/^\d+$/.test(String(b.number).trim())?Number(b.number):Infinity}))
      .sort((a,b)=>a.n-b.n||a.i-b.i);
  }
  function moveNumber(b0,dir){
    const list=flatOrdered();
    const i=list.findIndex(x=>x.b===b0), j=i+dir;
    if(j<0||j>=list.length){toast('已经到头了');return;}
    const t=list[i].b.number; list[i].b.number=list[j].b.number; list[j].b.number=t;
    renumberBirds();changed();render();
  }
  const mkBtn=(t,d)=>{
    const b=document.createElement('button');b.type='button';b.className='wide';
    b.textContent=t;b.onclick=()=>{const b0=bird();if(!b0){toast('先选中一只鸟');return;}moveNumber(b0,d);};
    nb.append(b);
  };
  mkBtn('编号前移',-1);mkBtn('编号后移',1);
  function refreshPanel(){
    if(!document.body.contains(box)) document.querySelector('.right').append(box);
    const b0=bird();
    info.textContent=b0? (b0.name+' · 当前编号 '+b0.number) : '点击选中一只鸟后在这里调整';
    if(b0&&document.activeElement!==urlInput) urlInput.value=b0.url||'';
    urlInput.disabled=!b0;
  }

  /* ---- 挂进渲染链 ---- */
  const prevRender=render;
  render=function(){
    syncLinks();
    prevRender();
    refreshPanel();
  };

  /* ---- 访客模式：只读 + 加载随仓库分发的布局 ---- */
  if(!CAN_EDIT){
    preview=true;
    document.body.classList.add('preview');
    const m=document.querySelector('#mode'); if(m)m.style.display='none';
    fetch('布局.json',{cache:'no-store'})
      .then(r=>r.ok?r.json():null)
      .then(v=>{
        if(!v||!Array.isArray(v.pages)||!v.pages.length)return;
        book=v;pi=0;selected=null;render();
      }).catch(()=>{});
  }else{
    preview=false;
  }

  /* ---- 初始快照 ---- */
  setTimeout(snap,1500);
})();
