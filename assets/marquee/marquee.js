/* Live, responsive lettering. The frame SVG never contains a film title. */
(()=>{'use strict';
function normalize(titles){return Array.isArray(titles)?titles.filter(t=>typeof t==='string').map(t=>t.trim()).filter(Boolean):[];}
function splitLines(text,capacity){
 const words=text.toUpperCase().split(/\s+/u),lines=[];let line='';
 for(let word of words){
  while(word.length>capacity){if(line){lines.push(line);line='';}lines.push(word.slice(0,capacity));word=word.slice(capacity);}
  if(!word)continue;
  if(line && line.length+1+word.length>capacity){lines.push(line);line=word;}else line+=(line?' ':'')+word;
 }
 if(line)lines.push(line);return lines;
}
function bestLayout(text,w,h){
 let best=null;
 for(let cap=8;cap<=Math.max(42,Math.min(text.length,240));cap++){
  const lines=splitLines(text,cap),max=Math.max(...lines.map(s=>s.length),1);
  const size=Math.min(w/(max*.7+1),h/(lines.length*1.23+.25),w*.125);
  const orphan=lines.length>1&&lines.at(-1).length<max*.35?.94:1;
  if(!best || size*orphan>best.score)best={lines,size,score:size*orphan};
 }
 return best;
}
function mount(el,options={}){
 if(el._mikeMarquee)el._mikeMarquee.destroy();
 const frame=el.querySelector('.mt-frame'),windowEl=el.querySelector('.mt-window');
 if(!frame||!windowEl)throw new Error('Marquee needs .mt-frame and .mt-window.');
 let heading=windowEl.querySelector('.mt-heading'),board=windowEl.querySelector('.mt-title');
 if(!heading){heading=document.createElement('div');heading.className='mt-heading';windowEl.append(heading);}
 if(!board){board=document.createElement('div');board.className='mt-title';windowEl.append(board);}
 let current=(typeof options.title==='string'&&options.title.trim())||normalize(options.titles)[0]||'COMING SOON',raf=0,destroyed=false;
 const headingText=options.heading||'NOW SHOWING';
 function tiles(row,text){
  for(const ch of text.toUpperCase()){
   const tile=document.createElement('span');
   if(ch===' '){tile.className='mt-space';row.append(tile);continue;}
   tile.className='mt-letter';const glyph=document.createElement('span');glyph.className='mt-glyph';
   glyph.textContent=ch;tile.append(glyph);row.append(tile);
  }
 }
 function fit(){
  raf=0;if(destroyed||!current||!el.clientWidth)return;
  heading.replaceChildren();heading.style.fontSize=(el.clientWidth*.055)+'px';tiles(heading,headingText);
  const plan=bestLayout(current,board.clientWidth-3,board.clientHeight-3);
  board.replaceChildren();board.style.fontSize=Math.max(.5,Math.floor(plan.size*10)/10)+'px';
  plan.lines.forEach(line=>{const row=document.createElement('div');row.className='mt-row';tiles(row,line);board.append(row);});
 }
 function queue(){if(!raf)raf=requestAnimationFrame(fit);}
 function render(){
  el.setAttribute('role','img');el.setAttribute('aria-label',headingText+': '+current);windowEl.setAttribute('aria-hidden','true');el.dataset.currentTitle=current;queue();
 }
 const observer=new ResizeObserver(queue);observer.observe(el);
 if(document.fonts)document.fonts.ready.then(()=>{if(!destroyed)queue();});
 const api={
  setTitle(title){current=(typeof title==='string'&&title.trim())||'COMING SOON';render();},
  setTitles(list){current=normalize(list)[0]||'COMING SOON';render();},
  refresh:render,
  getTitle(){return current;},
  destroy(){destroyed=true;observer.disconnect();cancelAnimationFrame(raf);delete el._mikeMarquee;}
 };
 el._mikeMarquee=api;render();return api;
}
window.MikeMarquee={mount};
})();
