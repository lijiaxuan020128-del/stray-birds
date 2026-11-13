(() => {
 'use strict';
 const url = new URL(location.href);
 if (url.searchParams.get('catalog') !== '1') {
   const merged = new URL(url);
   merged.searchParams.set('catalog', '1');
   merged.searchParams.set('read', '1');
   try { history.replaceState(null, '', merged.href); } catch {}
   window.READ_MODE = true;
 }
 if (url.searchParams.get('read') === '1') window.READ_MODE = true;
 if (window.READ_MODE) document.documentElement.classList.add('readMode');

 // 首屏保持纯背景，等封面、样式和布局准备好再一起显示。
 let coverReadyResolve;
 const coverReady = new Promise(resolve => { coverReadyResolve = resolve; });
 window.addEventListener('message', event => {
   const cover = document.getElementById('coverSurface');
   if (event.origin === location.origin && cover &&
       event.source === cover.contentWindow && event.data?.type === 'cover-ready') {
     coverReadyResolve();
   }
 });
 const pageLoaded = document.readyState === 'complete' ? Promise.resolve() :
   new Promise(resolve => window.addEventListener('load', resolve, {once:true}));

 async function start() {
   try {
     for (const path of [
       'assets/flock.js?v=3',
       'assets/cover-workbench.js?v=9',
       'assets/book-header.js?v=header1',
       'assets/page-motion.js?v=clickfix2',
       'assets/book-audio.js?v=audio5'
     ]) {
       await new Promise((resolve, reject) => {
         const script = document.createElement('script');
         script.src = path;
         script.onload = resolve;
         script.onerror = () => reject(new Error('资源加载失败：' + path));
         document.body.append(script);
       });
     }
     await pageLoaded;
     const cover = document.getElementById('coverSurface');
     if (cover && document.body.classList.contains('isCover')) {
       const frameLoaded = new Promise(resolve => {
         try {
           if (cover.contentDocument?.readyState === 'complete' &&
               cover.contentDocument.URL !== 'about:blank') { resolve(); return; }
         } catch {}
         cover.addEventListener('load', resolve, {once:true});
       });
       await Promise.race([coverReady, frameLoaded]);
       try { await cover.contentDocument?.fonts?.ready; } catch {}
     }
     await document.fonts.ready;
     if (typeof resize === 'function') resize();
     await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
     document.documentElement.classList.remove('birdBoot');
   } catch (error) {
     console.error(error);
     // 不暴露尚未初始化的工作台；失败时提供简单重试入口。
     const message = document.createElement('div');
     message.className = 'birdBootError';
     const retry = document.createElement('button');
     retry.textContent = '重新打开';
     retry.onclick = () => location.reload();
     message.append(retry);
     document.body.append(message);
   }
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
 else start();
})();
