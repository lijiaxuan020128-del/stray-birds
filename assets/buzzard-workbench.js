(() => {
  const upload = document.querySelector('#upload');
  if (!upload) return;
  const button = document.createElement('button');
  button.id = 'addCommonBuzzard';
  button.className = 'wide editOnly';
  button.textContent = '＋ 添加普通鵟';
  upload.after(button);
  button.onclick = async () => {
    button.disabled = true;
    try {
      const response = await fetch('birds/common-buzzard/artwork.png?v=buzzard1');
      if (!response.ok) throw new Error('图片加载失败');
      const blob = await response.blob();
      const src = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const img = new Image(); img.src = src; await img.decode();
      if (page().type === 'cover') {
        let index = book.pages.findIndex(p => p.type !== 'cover');
        if (index < 0) { book.pages.push({id:uid(),birds:[]}); index=book.pages.length-1; }
        go(index);
      }
      let w=260,h=w*img.height/img.width;
      if(h>400){h=400;w=h*img.width/img.height;}
      const n=page().birds.length,x=100+(n%3)*320,y=220+(Math.floor(n/3)%2)*180;
      const item={id:uid(),name:'普通鵟',number:'99',src,url:new URL('birds/view/?bird=普通鵟&v=buzzard1',location.href).href,x,y,w,h,font:16,tag:{x:x+10,y:Math.min(675,y+h+10),w:180,h:34}};
      page().birds.push(item);selected=item.id;part='bird';
      renumberBirds();changed();render();toast('已添加普通鵟及效果链接，可拖动排版后保存');
    } catch (error) { toast('普通鵟添加失败，请重试');console.error(error); }
    finally {button.disabled=false;}
  };
})();

