// 按像素透明度判定命中：鼠标必须落在鸟类图片的不透明内容上才能选中；
// 透明区域自动穿透到下层元素。页码条按矩形判定。
(function(){
  'use strict';
  const TH=96;                       // 透明度阈值（0-255）
  const cache=new Map();             // src → 缩放蒙版 {w,h,data}

  function ensure(src){
    if(!src||cache.has(src))return;
    cache.set(src,null);             // 占位防重复
    const im=new Image();
    im.onload=()=>{
      try{
        const MAX=480, sc=Math.min(1,MAX/im.naturalWidth);
        const w=Math.max(1,Math.round(im.naturalWidth*sc));
        const h=Math.max(1,Math.round(im.naturalHeight*sc));
        const c=document.createElement('canvas');c.width=w;c.height=h;
        const x=c.getContext('2d');x.drawImage(im,0,0,w,h);
        cache.set(src,{w,h,data:x.getImageData(0,0,w,h).data});
      }catch(e){cache.set(src,{w:1,h:1,data:null});}   // 跨域等 → 退回矩形判定
    };
    im.src=src;
  }

  const prevRender=render;
  render=function(){prevRender();[...document.querySelectorAll('#canvas .item img')].forEach(im=>ensure(im.src));};

  function findHitAt(cx,cy){
    const els=[...document.querySelectorAll('#canvas .item')];
    for(let k=els.length-1;k>=0;k--){          // 从最上层往下
      const el=els[k];
      const r=el.getBoundingClientRect();
      if(cx<r.left||cx>r.right||cy<r.top||cy>r.bottom)continue;
      const idx=Math.floor(k/2), b=page().birds[idx];
      if(!b)continue;
      const part=k%2===0?'bird':'tag';
      if(part==='bird'){
        const m=cache.get(b.src);
        if(m&&m.data){
          const lx=(cx-r.left)/r.width*m.w, ly=(cy-r.top)/r.height*m.h;
          if(m.data[(Math.floor(ly)*m.w+Math.floor(lx))*4+3]<=TH)continue;   // 透明 → 穿透
        }
      }
      return {b,part,el};
    }
    return null;
  }

  // 编辑：按下时按像素选中/拖动（含透明穿透）
  document.addEventListener('pointerdown',e=>{
    if(preview)return;
    if(e.target&&e.target.classList&&e.target.classList.contains('handle'))return;  // 缩放手柄优先
    const hit=findHitAt(e.clientX,e.clientY);
    const el=e.target.closest?e.target.closest('.item'):null;
    if(!hit){ if(el){e.stopPropagation();} return; }              // 空白/全透明 → 不选中
    if(hit.el===el)return;                                        // 正常命中 → 原处理
    e.stopPropagation();e.preventDefault();                       // 命中的是被压住的鸟 → 接管
    drag(e,hit.b,hit.part,false);
  },true);

  // 预览：点击按像素激活（透明处穿透，不误开上层鸟的效果）
  document.addEventListener('click',e=>{
    if(!preview)return;
    const el=e.target.closest?e.target.closest('.item'):null;
    if(!el)return;
    const hit=findHitAt(e.clientX,e.clientY);
    if(!hit){e.stopPropagation();return;}
    if(hit.el!==el){e.stopPropagation();return;}
    e.preventDefault();
    e.stopImmediatePropagation();
    activate(hit.b,hit.part);
  },true);
})();
