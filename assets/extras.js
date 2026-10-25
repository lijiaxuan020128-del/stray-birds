// 预览模式：按真实可用空间等比缩放（实测顶栏/栏目条高度，不猜参数）
(function(){
  'use strict';
  let fitApplied=false;
  const prevResize=resize;
  const prevRender=render;
  render=function(){
    prevRender();
    const t=theme();
    if(t&&t.dream){ document.body.style.background=(t.desk||'#27252e'); }
    if(preview){fitPreview();}
    else if(fitApplied){                      // 离开预览：清除预览尺寸，恢复编辑区
      const f=document.getElementById('frame');
      if(f){f.style.width='';f.style.margin='';}
      fitApplied=false;
      prevResize();
    }
  };

  function fitPreview(){
    if(!preview)return;
    const f=document.getElementById('frame');
    if(!f)return;
    const top=document.querySelector('.top');
    const bar=document.querySelector('.sectionNav');
    const topH=top?top.offsetHeight:84;
    const barH=bar?bar.offsetHeight:46;
    const availH=window.innerHeight-topH-barH-40;
    const availW=window.innerWidth-40;
    if(availH<200||availW<200)return;
    const w=Math.max(320,Math.min(availW,availH*1200/760));
    f.style.width=w+'px';
    f.style.margin='20px auto';
    fitApplied=true;
    prevResize();
  }

  const st=document.createElement('style');
  st.textContent=[
    'html{overflow-x:hidden}',
    'body.preview{overflow:hidden;padding-bottom:0!important}',
    'body.preview .work{max-width:none!important;padding:0!important}',
    'body.preview .workhead{display:none!important}',
    'body.preview .nav{position:fixed;left:auto;right:64px;transform:none;bottom:54px;margin:0!important;z-index:20}'
  ].join('');
  document.head.append(st);

  document.addEventListener('click',e=>{
    if(e.target&&e.target.id==='mode'){
      [0,80,250,600].forEach(t=>setTimeout(fitPreview,t));
    }
  },true);
  window.addEventListener('resize',()=>{if(preview)fitPreview();});
  setTimeout(fitPreview,800);
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
