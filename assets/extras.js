// 撤销 / 重做（快照式，Ctrl+Z / Ctrl+Y）
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
    if(now-lastSnap>500){snap();lastSnap=now;}
    else{clearTimeout(htimer);htimer=setTimeout(snap,350);}
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
  snap();lastSnap=Date.now();
})();
