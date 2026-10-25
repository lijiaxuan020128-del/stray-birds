// 预览模式等比完整显示（纯 CSS 定宽，原 ResizeObserver 自动按宽度缩放）
(function(){
  'use strict';
  const prevRender=render;
  render=function(){
    prevRender();
    const t=theme();
    if(t&&t.dream){ document.body.style.background=preview?(t.paper||'#76708e'):(t.desk||'#27252e'); }
  };
  const st=document.createElement('style');
  st.textContent=[
    'html{overflow-x:hidden}',
    'body.preview{overflow:hidden;padding-bottom:0!important}',
    'body.preview .workhead{display:none!important}',
    'body.preview .work{max-width:none!important;padding:0!important}',
    'body.preview #frame{width:min(calc(100vw - 40px),calc((100vh - 170px)*1.5789))!important;margin:20px auto}',
    'body.preview .nav{position:fixed;left:50%;transform:translateX(-50%);bottom:58px;margin:0!important;z-index:20}'
  ].join('');
  document.head.append(st);
})();

// ---- 撤销 / 重做（快照式，Ctrl+Z / Ctrl+Y）----
(function(){
  let hist=[],hi=-1,htimer=null,lastSnap=0;
  function snap(){
    const j=JSON.stringify(book);
    if(hist[hi]===j)return;
    hist=hist.slice(0,hi+1);hist.push(j);
    if(hist.length>40)hist.shift();
    hi=hist.length-1;
  }
  const prevChanged=changed;
  changed=function(){
    prevChanged();
    const now=Date.now();
    if(now-lastSnap>500){snap();lastSnap=now;}          // 每轮改动第一下立即快照
    else{clearTimeout(htimer);htimer=setTimeout(snap,350);}  // 连续改动合并
  };
  function applyHist(){
    book=JSON.parse(hist[hi]);
    pi=Math.min(pi,book.pages.length-1);
    selected=null;
    render();dirty=true;prevChanged();
  }
  function undo(){
    const cur=JSON.stringify(book);
    let k=hi;
    if(hist[k]===cur){while(k>=0&&hist[k]===cur)k--;}
    if(k<0){toast('没有可撤销的操作');return;}
    hi=k;applyHist();
  }
  function redo(){
    const cur=JSON.stringify(book);
    let j=hi+1;
    while(j<hist.length&&hist[j]===cur)j++;
    if(j>=hist.length){toast('没有可重做的操作');return;}
    hi=j;applyHist();
  }
  // 操作发生前预快照（捕获阶段），保证撤销有“改动前”的状态
  ['pointerdown','input','change'].forEach(t=>document.addEventListener(t,e=>{
    if(preview)return;
    const tg=e.target;
    if(tg&&tg.closest&&tg.closest('.actions'))return;
    snap();lastSnap=Date.now();
  },true));
  document.addEventListener('keydown',e=>{
    if(/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)||document.activeElement.isContentEditable)return;
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!e.shiftKey){e.preventDefault();undo();}
    else if((e.ctrlKey||e.metaKey)&&(e.key.toLowerCase()==='y'||(e.key.toLowerCase()==='z'&&e.shiftKey))){e.preventDefault();redo();}
  });
  const act=document.querySelector('.actions');
  const rb=document.createElement('button');rb.textContent='重做';rb.className='editOnly';rb.onclick=redo;
  const ub=document.createElement('button');ub.textContent='撤销';ub.className='editOnly';ub.onclick=undo;
  const saveBtn=document.querySelector('#save');
  act.insertBefore(rb,saveBtn);act.insertBefore(ub,rb);
  snap();lastSnap=Date.now();   // 启动立即快照
})();
