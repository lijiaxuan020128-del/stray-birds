(() => {
 const url=new URL(location.href);
 if(url.searchParams.get('catalog')!=='1'){
   const target=new URL('cover.html',url);target.search=url.search;target.hash=url.hash;
   location.replace(target.href);return;
 }
 document.addEventListener('DOMContentLoaded',()=>{
   const actions=document.querySelector('.actions');if(!actions)return;
   const link=document.createElement('a');link.href='cover.html';link.textContent='← 封面';link.id='returnCover';
   link.style.cssText='display:inline-flex;align-items:center;padding:8px 12px;color:inherit;text-decoration:none;border:1px solid #736c7e;border-radius:5px;font-size:12px';actions.prepend(link);
 });
})();
