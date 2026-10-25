// 预览模式铺满窗口：画布按窗口宽度缩放（与原站行为一致）
(function(){
  'use strict';
  const prevResize=resize;
  resize=function(){
    if(preview){
      scale=window.innerWidth/1200;
      const f=$('#frame');
      f.style.width=window.innerWidth+'px';
      f.style.height=760*scale+'px';
      $('#canvas').style.transform='scale('+scale+')';
      return;
    }
    prevResize();
  };
  const prevRender=render;
  render=function(){
    prevRender();
    const t=theme();
    if(t&&t.dream){ document.body.style.background=(t.desk||'#27252e'); }
  };
  const st=document.createElement('style');
  st.textContent='.preview .work{max-width:none!important;padding:0!important}html{overflow-x:hidden}';
  document.head.append(st);
  document.addEventListener('click',e=>{if(e.target&&e.target.id==='mode')setTimeout(()=>resize(),60);});
  window.addEventListener('resize',()=>{if(document.body.classList.contains('preview'))resize();});
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
