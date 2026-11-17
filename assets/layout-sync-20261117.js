(() => {
  // Published layout from the user's exported catalog, 2026-11-17.
  // Keep existing image data and effect-page code unchanged.
  if (new URLSearchParams(location.search).get('read') !== '1') return;
  const placements = [
    [['斑头雁',463.53,275,404.03,316.50,452.80,447.91,150,32,2],['苍鹭',793.74,232.51,699.90,609.79,906.04,467,180,34,5],['鸿雁',559.95,406.43,511.66,400.86,785.46,717.65,180,34,4],['小䴙䴘',87.04,511.17,174.75,147.30,142.74,638.03,180,34],['黑水鸡',207.21,225.40,260,226.59,197.43,375.38,180,34],['针尾沙锥',296.01,429.33,260,203.75,396.04,600.11,180,34]],
    [['大斑啄木鸟',713.13,197.05,260,223.98,871.81,291.90,180,34],['普通翠鸟',168.20,414.32,207.49,180.64,103.86,565.43,180,34],['戴胜',191.39,201.53,346.62,298.52,355.52,337.25,180,34],['金翅雀',635.52,457.29,260,226.36,751.91,527.24,180,34]],
    [['麻雀',156.61,264.57,141.33,116.15,237.54,360.03,104.98,28.54],['太平鸟',196.85,448.42,307.74,258.95,347.34,536.02,180,34],['震旦鸦雀',913.78,516.62,196.57,153.95,841.25,635.45,180,34],['栗鹀',426,299.74,260,203.63,543.08,379.70,180,34],['白鹡鸰',725.54,238.36,260,226.36,906.73,332.18,180,34]],
    [['家燕',331.88,248.88,260,223.98,258,386.70,180,34],['普通雨燕',688.03,353.23,260,218.78,828.98,425.83,180,34],['金腰燕',264.64,479.40,260,223.98,419.91,617.90,180,34]],
    [['珠颈斑鸠',192.07,324.59,281.82,223.31,137.28,540.60,180,34],['红隼',716.68,196.37,322.75,255.72,878.76,281.43,180,34],['普通鵟',594.05,426.21,371.85,294.63,724.77,468.98,180,34]]
  ];
  const colors=['#76708e',null,'#708f86','#8f7081','#8f8b70','#778f70'];
  const sections=[{id:'index',name:'封面'},{id:'species',name:'涉禽&游禽'},{id:'about',name:'攀禽&鸣禽'},{id:'83912e4c-7d90-4a42-a825-759323d6f541',name:'陆禽&猛禽'}];
  const sectionIds=['cover','species','about','about',null,'83912e4c-7d90-4a42-a825-759323d6f541'];
  const globalTheme={paper:'#76708e',desk:'#27252e',ink:'#f4efdc',muted:'#ddd7cb',line:'#cbd0c1',tag:'#deddbb',tagInk:'#292735',titleSize:112,subSize:15,captionSize:11,folioSize:13,titleX:71,titleY:45,subX:77,subY:186,captionX:745,captionY:100,lineX:58,lineY:112,lineWidth:1084,lineWeight:1,folioX:550,folioY:725,font:'serif',showLine:false,dream:true,grain:8};
  function apply(){
    if(typeof book==='undefined'||!book||!Array.isArray(book.pages)||book.pages.length!==6)return;
    // Only apply when all exported birds exist on their respective pages.
    for(let i=1;i<6;i++){
      const existing=book.pages[i]?.birds;
      if(!Array.isArray(existing)||placements[i-1].some(v=>!existing.some(b=>b.name===v[0])))return;
    }
    book.theme={...(book.theme||{}),...globalTheme};
    book.sections=sections.map(s=>({...s}));
    book.pages.forEach((p,i)=>{
      if(sectionIds[i]===null)delete p.sectionId;else p.sectionId=sectionIds[i];
      if(colors[i])p.theme={...(p.theme||{}),paper:colors[i]};
      if(i===0){
        p.type='cover';
        p.cover={...(p.cover||{}),size:7,count:180,speed:1,spacing:1,scatter:1,passing:true,interval:12,birdSize:10,title:'飞鸟集',english:'STRAY BIRDS',tagline:'以粒子之群，抽象飞鸟之形。形态隐去，习性浮现。',paper:'#70798f',ink:'#f4efdc',titleSize:108,titleX:50,titleY:48,font:''};
        return;
      }
      const byName=new Map(p.birds.map(b=>[b.name,b]));
      p.birds=placements[i-1].map((v,j)=>{
        const b=byName.get(v[0]);
        Object.assign(b,{number:String(placements.slice(0,i-1).reduce((n,a)=>n+a.length,0)+j+1).padStart(2,'0'),x:v[1],y:v[2],w:v[3],h:v[4],font:i===1&&j===0?15:16});
        b.tag={...(b.tag||{}),x:v[5],y:v[6],w:v[7],h:v[8]};
        if(v[9]!==undefined)b.z=v[9];
        return b;
      });
    });
  }
  // The published book may initialize asynchronously; apply on each render.
  if(typeof render==='function'){
    const originalRender=render;
    render=function(){apply();return originalRender.apply(this,arguments)};
  }
  apply();
  if(typeof render==='function')render();
})();