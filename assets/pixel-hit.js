// 按像素透明度判定命中：鼠标必须落在鸟类图片的不透明内容上才能选中；
// 透明区域自动穿透到下层元素。页码条按矩形判定。
(function(){
  'use strict';

  // 较低阈值保留鸟类羽毛边缘的半透明抗锯齿像素，避免“明明点在鸟上却选不中”。
  const TH=24;                       // 透明度阈值（0-255）
  const cache=new Map();             // src → 缩放蒙版 {w,h,data}

  function ensure(src){
    if(!src||cache.has(src))return;
    cache.set(src,null);             // 占位防重复
    const im=new Image();
    im.onload=()=>{
      try{
        const MAX=720;
        const sc=Math.min(1,MAX/im.naturalWidth);
        const w=Math.max(1,Math.round(im.naturalWidth*sc));
        const h=Math.max(1,Math.round(im.naturalHeight*sc));
        const c=document.createElement('canvas');
        c.width=w;c.height=h;
        const x=c.getContext('2d',{willReadFrequently:true});
        x.drawImage(im,0,0,w,h);
        cache.set(src,{w,h,data:x.getImageData(0,0,w,h).data});
      }catch(e){
        cache.set(src,{w:1,h:1,data:null});   // 跨域等 → 退回矩形判定
      }
    };
    im.src=src;
  }

  const prevRender=render;
  render=function(){
    prevRender();
    [...document.querySelectorAll('#canvas .item img')].forEach(im=>ensure(im.src));
  };

  function alphaHit(b,r,cx,cy){
    const m=cache.get(b.src);
    if(!m||!m.data)return true;       // 蒙版尚未就绪时先退回矩形判定

    const nx=(cx-r.left)/r.width;
    const ny=(cy-r.top)/r.height;
    const mx=Math.max(0,Math.min(m.w-1,Math.floor(nx*m.w)));
    const my=Math.max(0,Math.min(m.h-1,Math.floor(ny*m.h)));
    const a=m.data[(my*m.w+mx)*4+3];
    if(a>TH)return true;

    // 给羽毛尖端/细腿等很窄的内容一个很小的容错邻域。
    // 只检查相邻像素，不扩大成图片矩形，因此透明背景仍然可以穿透。
    const radius=2;
    for(let yy=Math.max(0,my-radius);yy<=Math.min(m.h-1,my+radius);yy++){
      for(let xx=Math.max(0,mx-radius);xx<=Math.min(m.w-1,mx+radius);xx++){
        if(m.data[(yy*m.w+xx)*4+3]>TH)return true;
      }
    }
    return false;
  }

  function findHitAt(cx,cy){
    const els=[...document.querySelectorAll('#canvas .item')];

    // DOM 中每只鸟固定按 bird、tag 顺序生成。
    // 从最高显示层开始检查；同 z-index 时后生成的元素在上方。
    const candidates=els.map((el,k)=>({el,k,z:Number(el.style.zIndex)||1}))
      .sort((a,b)=>b.z-a.z||b.k-a.k);

    for(const item of candidates){
      const el=item.el,k=item.k;
      const r=el.getBoundingClientRect();
      if(cx<r.left||cx>r.right||cy<r.top||cy>r.bottom)continue;

      const idx=Math.floor(k/2);
      const b=page().birds[idx];
      if(!b)continue;
      const part=k%2===0?'bird':'tag';

      if(part==='bird'&&!alphaHit(b,r,cx,cy))continue; // 真透明 → 继续找下层鸟
      return {b,part,el};
    }
    return null;
  }

  // 编辑：按下时始终以“实际不透明像素命中”的鸟为准。
  document.addEventListener('pointerdown',e=>{
    if(preview)return;
    if(e.target&&e.target.classList&&e.target.classList.contains('handle'))return;

    const hit=findHitAt(e.clientX,e.clientY);
    const el=e.target.closest?e.target.closest('.item'):null;

    if(!hit){
      if(el){e.stopPropagation();e.preventDefault();}
      return;
    }

    if(hit.el===el)return;            // 浏览器目标与像素命中一致 → 交给原处理

    // 浏览器可能先命中了上层图片的透明矩形；此时直接把事件交给真正的下层鸟。
    e.stopPropagation();
    e.preventDefault();
    drag(e,hit.b,hit.part,false);
  },true);

  // 预览：无论浏览器 e.target 指向哪一层，都以实际不透明像素命中结果为准。
  document.addEventListener('click',e=>{
    if(!preview)return;

    // Decorative text/lines can cover the artwork; hit-test the whole catalog.
    if(!e.target.closest?.('#canvas') || e.target.closest?.('button,a,input,select,textarea'))return;
    if(e.detail===0)return; // Keep keyboard activation on the focused item.
    const el=e.target.closest?.('.item');

    const hit=findHitAt(e.clientX,e.clientY);
    if(!hit){
      e.stopPropagation();
      e.preventDefault();
      return;
    }

    e.preventDefault();
    e.stopImmediatePropagation();
    activate(hit.b,hit.part);
  },true);
})();
