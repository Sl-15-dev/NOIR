import {badges, categories, years, boardSize} from './data.js';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${({arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',pin:'<path d="m9 3 6 0-1 7 4 4H6l4-4zm3 11v7"/>',globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',expand:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5"/>',filter:'<path d="M4 7h16M7 12h10m-7 5h4"/>',location:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>'})[name] || ''}</svg>`;


function badgeArtwork(b) {
  const artwork={
    openai:'<g fill="none" stroke="currentColor" stroke-width="3.5">'+Array.from({length:6},(_,i)=>`<rect x="25" y="9" width="30" height="43" rx="15" transform="rotate(${i*60} 40 40)"/>`).join('')+'</g>',
    config:'<g stroke="currentColor" stroke-width="9" stroke-linecap="square">'+Array.from({length:6},(_,i)=>`<path d="M40 8v64" transform="rotate(${i*30} 40 40)"/>`).join('')+'</g>',
    ethglobal:'<g fill="none" stroke="currentColor" stroke-width="2"><path d="m40 6 22 32-22 12-22-12zM18 42l22 14 22-14-22 32z"/><path d="M40 6v44M18 38l22-10 22 10"/></g>',
    github:'<path fill="currentColor" d="M40 8a31 31 0 0 0-10 60c2 .3 2.7-.9 2.7-1.8v-6c-11 2.3-13-4.7-13-4.7-1.8-4.4-4.2-5.6-4.2-5.6-3.5-2.3.3-2.3.3-2.3 3.9.3 6 4 6 4 3.4 5.9 8.9 4.2 11 3.2.3-2.5 1.3-4.2 2.5-5.2-8.8-1-18-4.4-18-19.5 0-4.3 1.5-7.8 4-10.5-.4-1-1.7-5 0-10.4 0 0 3.3-1 10.8 4a37 37 0 0 1 19.8 0c7.5-5 10.8-4 10.8-4 1.7 5.4.4 9.4 0 10.4 2.5 2.7 4 6.2 4 10.5 0 15.2-9.2 18.5-18 19.5 1.4 1.2 2.7 3.7 2.7 7.4v9.2c0 1 .7 2.1 2.7 1.8A31 31 0 0 0 40 8Z" transform="translate(4 5) scale(.9)"/>',
    react:'<g fill="none" stroke="currentColor" stroke-width="2.4"><ellipse cx="40" cy="40" rx="34" ry="13"/><ellipse cx="40" cy="40" rx="34" ry="13" transform="rotate(60 40 40)"/><ellipse cx="40" cy="40" rx="34" ry="13" transform="rotate(120 40 40)"/></g><circle cx="40" cy="40" r="5" fill="currentColor"/>',
    websummit:'<path d="M12 64 59 12l9 52z" fill="currentColor"/>',
    devfest:'<path d="m29 23-20 17 20 17m22-34 20 17-20 17" fill="none" stroke="currentColor" stroke-width="9"/>',
    merge:'<path d="M15 65 65 15M21 15h44v44" fill="none" stroke="currentColor" stroke-width="8"/>',
    microsoft:'<path fill="#ef613c" d="M10 10h27v27H10z"/><path fill="#80ab42" d="M42 10h27v27H42z"/><path fill="#42a7cc" d="M10 42h27v27H10z"/><path fill="#e9bd42" d="M42 42h27v27H42z"/>',
    hackday:'<path d="m40 6 8 23 24-5-16 18 14 20-24-8-10 21-5-25-25-3 22-13-8-22 20 14z" fill="currentColor"/>',
    designweek:'<circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" stroke-width="2"/><path d="M40 10a30 30 0 0 1 0 60z" fill="currentColor"/>',
    community:'<path d="M40 65 12 38C-3 19 23 1 40 24 57 1 83 19 68 38z" fill="none" stroke="currentColor" stroke-width="4"/>'
  };
  return artwork[b.design]?`<svg viewBox="0 0 80 80" aria-hidden="true">${artwork[b.design]}</svg>`:escape(b.mark);
}

function badgeFace(b, miniature=false) {
  return `<span class="badge-face badge-design-${escape(b.design)}" style="--badge-paper:${escape(b.paper)};--badge-ink:${escape(b.ink)}">
    ${b.badgeImage ? `<img class="badge-custom-image" src="${escape(b.badgeImage)}" alt="${escape(b.eventName)} badge design">` : `
    <span class="badge-slot"></span><span class="badge-issuer">${escape(b.organization)} <span>${String(b.year).slice(2)}</span></span>
    <span class="badge-art" aria-hidden="true">${badgeArtwork(b)}</span>
    <span class="badge-event">${escape(b.label)}</span>
    <span class="badge-event-sub">${b.design==='openai'?'SAN FRANCISCO':b.design==='config'?'MAKE WHAT’S NEXT':b.design==='ethglobal'?'LONDON / 2024':b.design==='react'?'ADVANCED / LONDON':b.design==='merge'?'DESIGN MEETS CODE':escape(b.location.split(',')[0].toUpperCase())}</span>
    <span class="badge-person">${b.design==='config'?'Hello, curious human.':'THE COLLECTOR'}</span>
    <span class="badge-role">${escape(b.role)} <span>${icon("arrow")}</span></span>
    ${miniature?'':'<span class="badge-barcode" aria-hidden="true"></span>'}`}
  </span>`;
}

export function showLibraryView() {
  document.querySelector('#badgeCollection').hidden = true;
  document.querySelector('.hero').hidden = false;
  document.querySelector('#library').hidden = false;
  document.querySelector('#navBadges').classList.remove('active');
  document.querySelector('#navBadges').removeAttribute('aria-current');
  document.querySelector('#sideBadges').classList.remove('active');
  document.querySelector('#navLibrary').classList.add('active');
  document.querySelector('.skip-link').href='#library';
  if(!location.hash.startsWith('#component/')) history.replaceState(null,'','#components');
}

export function initBadgeCollection() {
  const root = document.querySelector('#badgeCollection');
  document.querySelector('#sideBadges .side-count').textContent=String(badges.length).padStart(2,'0');
  root.innerHTML = `
    <header class="badge-heading">
      <div class="badge-eyebrow"><span></span> A PERSONAL COLLECTION <span class="badge-edition">EST. 2023 — ONGOING</span></div>
      <div class="badge-heading-row"><h1 id="badgesTitle">Every badge <em>tells a story.</em></h1><span class="badge-heading-stamp">COLLECT MOMENTS.<br>KEEP THE MEMORIES. ${icon('globe')}</span></div>
      <p>Places I’ve been. People I’ve met. Things that stayed with me.<br class="badge-mobile-break"> A little piece of my journey, pinned in one place.</p>
    </header>
    <div class="badge-board-heading"><div><span class="badge-live-dot"></span> THE MEMORY BOARD <span class="badge-board-divider">/</span> <span id="badgeCount" role="status">${badges.length} stories & counting</span></div><span class="badge-board-hint">A few keepsakes. A lot of good stories.</span></div>
    <div class="badge-frame"><div class="badge-wood-sign" aria-hidden="true"><span>Badges</span><em>Every badge tells a story.</em><i></i><b></b></div>
      <div class="badge-stage" tabindex="0" role="region" aria-label="Interactive badge corkboard. Use arrow keys to pan, plus and minus to zoom, and 0 to fit the board." aria-describedby="badgeInstructions">
        <div class="badge-world" style="width:${boardSize.width}px;height:${boardSize.height}px">
          <div class="badge-travel-doodle" aria-hidden="true"><svg viewBox="0 0 230 90"><path class="badge-flight-path" d="M8 58C50 4 109 100 157 51S132 5 147 40 198 58 210 21"/><path d="m197 13 12 6 12-5 4 4-10 8 3 13-4 3-7-11-11 2-2-3 10-6-9-8z"/></svg></div>
          <div class="badge-postcard" aria-hidden="true"><span class="badge-tape"></span><img src="./badges/lisbon.svg" alt=""><span>Lisbon, you were lovely. ♡</span><small>NOVEMBER ’23</small></div>
          <div class="badge-ticket" aria-hidden="true"><span>→ LHR</span><small>BOARDING PASS</small><b>ONE WAY TO<br>SOMETHING NEW.</b><i>||| |||||| || ||| ||||||</i></div>
          <div class="badge-note" aria-hidden="true"><span class="badge-pin"></span><span>the best part?<br>the people.</span><svg viewBox="0 0 100 36"><path d="M8 18q39 18 73-4m-9-4 10 3-5 10"/></svg><small>always say hello ↗</small></div>
          <span class="badge-star badge-star-one" aria-hidden="true">✳</span><span class="badge-star badge-star-two" aria-hidden="true">✧</span>
          <div class="badge-hangings">${badges.map(b=>`<button class="badge-hanging" data-badge="${escape(b.id)}" aria-label="Read the story of ${escape(b.eventName)}, ${b.year}, ${escape(b.role)}" aria-pressed="false" style="left:${b.position.x}px;top:${b.position.y}px;--angle:${b.position.angle}deg;--strap-length:${b.position.strap}px;--lanyard:${b.lanyardColor}">
            <span class="badge-hook"></span><span class="badge-swing"><svg class="badge-lanyard" viewBox="0 0 160 ${b.position.strap}" preserveAspectRatio="none" aria-hidden="true"><defs><pattern id="fabric-${b.id}" width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 0h3v1H0z" fill="white" opacity=".12"/><path d="M0 1h1v2H0z" fill="black" opacity=".15"/></pattern><pattern id="mosaic-${b.id}" width="35" height="100" patternUnits="userSpaceOnUse"><rect width="35" height="100" fill="${b.lanyardColor}"/><path d="m0 0 35 20L0 45z" fill="#edb855"/><path d="m35 25-35 25 35 25z" fill="#6fa373"/><path d="m0 60 35 25-35 15z" fill="#d46c77"/></pattern></defs><path class="badge-ribbon-shadow" d="M78 6Q27 48 76 ${b.position.strap-9}M82 6Q133 48 84 ${b.position.strap-9}"/><path class="badge-ribbon" style="${b.lanyardPattern==='mosaic'?`stroke:url(#mosaic-${b.id})`:''}" d="M78 6Q27 48 76 ${b.position.strap-9}M82 6Q133 48 84 ${b.position.strap-9}"/><path class="badge-ribbon-weave" stroke="url(#fabric-${b.id})" d="M78 6Q27 48 76 ${b.position.strap-9}M82 6Q133 48 84 ${b.position.strap-9}"/><path class="badge-ribbon-seam" d="M78 6Q27 48 76 ${b.position.strap-9}M82 6Q133 48 84 ${b.position.strap-9}"/><text transform="translate(60 100) rotate(87)">${Array(4).fill(escape(b.organization.toUpperCase())).join(" · ")}</text><text transform="translate(104 95) rotate(93)">${Array(4).fill(`${b.year} · ${escape(b.role.toUpperCase())}`).join(" · ")}</text></svg><span class="badge-clasp"></span>${badgeFace(b)}</span></button>`).join('')}</div>
          <span class="badge-corner-note" aria-hidden="true">Conferences. Workshops. People. Memories.</span>
        </div>
        <details class="badge-filters" open><summary>${icon('filter')} <span>The collection</span><span class="badge-filter-chevron">⌄</span></summary><div class="badge-filter-content"><span class="badge-filter-label">A LITTLE BIT OF EVERYTHING</span><div class="badge-category-filters" role="group" aria-label="Filter badges by category">${categories.map((c,i)=>`<button data-badge-category="${c}" aria-pressed="${i===0}" class="${i===0?'is-active':''}"><span>${c==='All'?'◈':c==='Technology'?'⌘':c==='Conferences'?'▤':c==='Hackathons'?'↯':c==='Workshops'?'∗':'♡'}</span>${c}<small>${c==='All'?badges.length:badges.filter(b=>b.category===c).length}</small></button>`).join('')}</div><div class="badge-year-heading"><span>BY YEAR</span><button id="badgeYearReset" hidden>Clear</button></div><div class="badge-year-filters" role="group" aria-label="Filter badges by year">${years.map(y=>`<button data-badge-year="${y}" aria-pressed="false">${y}</button>`).join('')}</div></div></details>
        <div class="badge-empty" hidden><span>Nothing pinned here. Yet.</span><p>Try a different year or category.</p><button>Show every memory ${icon('arrow')}</button></div>
        <div class="badge-board-tools"><span class="badge-board-tooltip">MAKE YOURSELF AT HOME</span><div class="badge-zoom-tools" role="group" aria-label="Board zoom"><button data-zoom="out" aria-label="Zoom out">−</button><output id="badgeZoom" aria-live="polite">100%</output><button data-zoom="in" aria-label="Zoom in">+</button><span></span><button data-zoom="reset" aria-label="Fit board">${icon('expand')}</button></div></div>
      </div>
    </div>
    <div class="badge-board-footer"><p id="badgeInstructions"><span class="badge-mouse-icon" aria-hidden="true"></span> Scroll to zoom or drag to explore the board.<span class="badge-touch-instruction"> Pinch to zoom on touch.</span></p><span>Pick a badge. Stay for the story. ${icon('arrow')}</span></div>
    <div class="badge-afterword"><span>More than a name tag.</span><p>Every event leaves a memory.<br>This is my journey, one badge at a time.</p><span class="badge-sample-note">An illustrative collection.<br>Real stories coming soon.</span></div>
    <dialog class="badge-story" aria-labelledby="badgeStoryTitle"><div class="badge-story-color"><span class="badge-story-number"></span><div class="badge-story-preview"></div><span class="badge-story-keepsake">A LITTLE KEEPSAKE.<br>A LASTING MEMORY.</span></div><div class="badge-story-content"><button class="badge-story-close" aria-label="Close badge story">${icon('close')}</button><span class="badge-story-eyebrow">FROM THE MEMORY BOARD</span><h2 id="badgeStoryTitle"></h2><div class="badge-story-location"></div><div class="badge-story-meta"></div><p class="badge-story-short"></p><button class="badge-read-more" aria-expanded="false" aria-controls="badgeFullStory">Read more about this story ${icon('arrow')}</button><div id="badgeFullStory" hidden><p></p><blockquote></blockquote></div><div class="badge-story-photos"></div><div class="badge-story-bottom"><span></span><div><button data-story-nav="prev" aria-label="Previous badge story">←</button><button data-story-nav="next" aria-label="Next badge story">→</button></div></div></div></dialog>`;

  const $=s=>root.querySelector(s), $$=s=>[...root.querySelectorAll(s)];
  const stage=$('.badge-stage'), world=$('.badge-world'), story=$('.badge-story');
  const state={category:'All',year:null,selected:null,zoom:1,fit:1,x:0,y:0};
  let initialized=false, lastOpener=null, blockClickUntil=0;
  const visibleBadges=()=>badges.filter(b=>(state.category==='All'||b.category===state.category)&&(!state.year||b.year===state.year));
  const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
  function transform() {
    const scale=state.fit*state.zoom;
    const margin=40;
    state.x=clamp(state.x,Math.min(margin,stage.clientWidth-boardSize.width*scale-margin),Math.max(stage.clientWidth-boardSize.width*scale-margin,margin));
    state.y=clamp(state.y,Math.min(margin,stage.clientHeight-boardSize.height*scale-margin),Math.max(stage.clientHeight-boardSize.height*scale-margin,margin));
    world.style.transform=`translate(${state.x}px,${state.y}px) scale(${scale})`;
    $('#badgeZoom').value=`${Math.round(state.zoom*100)}%`;
    $('[data-zoom="out"]').disabled=state.zoom<=.75;
    $('[data-zoom="in"]').disabled=state.zoom>=Math.max(2.75,1/state.fit);
  }
  function fitBoard() {
    if(!stage.clientWidth)return;
    state.fit=Math.min(stage.clientWidth/boardSize.width,stage.clientHeight/boardSize.height);
    state.zoom=window.innerWidth<600?1.65:1;
    state.x=(stage.clientWidth-boardSize.width*state.fit*state.zoom)/2;
    state.y=(stage.clientHeight-boardSize.height*state.fit*state.zoom)/2;
    transform();
  }
  function zoomAt(next,px=stage.clientWidth/2,py=stage.clientHeight/2) {
    const old=state.fit*state.zoom;
    state.zoom=clamp(next,.75,Math.max(2.75,1/state.fit));
    const scale=state.fit*state.zoom;
    state.x=px-(px-state.x)*scale/old; state.y=py-(py-state.y)*scale/old;
    transform();
  }
  function applyFilters() {
    const items=visibleBadges();
    $$('[data-badge]').forEach(b=>{const match=items.some(item=>item.id===b.dataset.badge);b.classList.toggle('is-filtered',!match);b.inert=!match;b.setAttribute('aria-hidden',String(!match));});
    $$('[data-badge-category]').forEach(b=>{const active=b.dataset.badgeCategory===state.category;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));});
    $$('[data-badge-year]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.badgeYear)===state.year)));
    $('#badgeYearReset').hidden=!state.year;
    $('#badgeCount').textContent=state.category==='All'&&!state.year?`${items.length} stories & counting`:`${items.length} of ${badges.length} stories`;
    $('.badge-empty').hidden=items.length!==0;
    // Bring matching memories into view even when the visitor has panned away.
    if(items.length && (state.category!=='All'||state.year)) {
      const scale=state.fit*state.zoom;
      const x=items.reduce((sum,b)=>sum+b.position.x+80,0)/items.length;
      const y=items.reduce((sum,b)=>sum+b.position.y+(b.position.strap+105)*.68,0)/items.length;
      state.x=stage.clientWidth/2-x*scale; state.y=stage.clientHeight/2-y*scale;transform();
    } else fitBoard();
  }
  function closeStory() {story.close();}
  function openStory(id,opener) {
    const b=badges.find(b=>b.id===id);if(!b)return;
    if(opener)lastOpener=opener;
    state.selected=id;
    $$('[data-badge]').forEach(el=>{el.classList.toggle('is-selected',el.dataset.badge===id);el.setAttribute('aria-pressed',String(el.dataset.badge===id));});
    $('.badge-story-color').style.background=b.lanyardColor;
    $('.badge-story-preview').innerHTML=badgeFace(b,true);
    $('.badge-story-number').textContent=`MEMORY No. ${String(badges.indexOf(b)+1).padStart(2,'0')} / ${b.year}`;
    $('#badgeStoryTitle').textContent=b.eventName;
    $('.badge-story-location').innerHTML=`${icon('location')} ${escape(b.location)}`;
    $('.badge-story-meta').innerHTML=`<span>${escape(b.date)}</span><span>${escape(b.role)}</span>`;
    $('.badge-story-short').textContent=b.shortDescription;
    $('#badgeFullStory p').textContent=b.fullStory;
    $('#badgeFullStory blockquote').textContent=b.takeaway;
    $('#badgeFullStory').hidden=true;
    $('.badge-read-more').setAttribute('aria-expanded','false');
    $('.badge-read-more').innerHTML=`Read more about this story ${icon('arrow')}`;
    $('.badge-story-photos').innerHTML=(b.photos||[]).map(photo=>`<figure><img src="${escape(photo.src)}" alt="${escape(photo.alt)}" loading="lazy">${photo.caption?`<figcaption>${escape(photo.caption)}</figcaption>`:''}</figure>`).join('');
    $('.badge-story-bottom > span').textContent=`${b.category} / ${b.year}`;
    if(!story.open)story.showModal();
    if(innerWidth>600){
      const anchor=root.querySelector(`[data-badge="${b.id}"]`).getBoundingClientRect();
      const width=story.offsetWidth,height=story.offsetHeight;
      const nextX=anchor.right+14+width<innerWidth-20?anchor.right+14:anchor.left-width-14;
      story.style.left=`${clamp(nextX,20,innerWidth-width-20)}px`;
      story.style.top=`${clamp(anchor.top+anchor.height*.55,78,innerHeight-height-20)}px`;
    }
    story.scrollTop=0;
  }
  root.addEventListener('click',e=>{
    const category=e.target.closest('[data-badge-category]'),year=e.target.closest('[data-badge-year]'),badge=e.target.closest('[data-badge]'),zoom=e.target.closest('[data-zoom]'),nav=e.target.closest('[data-story-nav]');
    if(category){state.category=category.dataset.badgeCategory;applyFilters();}
    if(year){const value=Number(year.dataset.badgeYear);state.year=state.year===value?null:value;applyFilters();}
    if(badge)openStory(badge.dataset.badge,badge);
    if(zoom){if(zoom.dataset.zoom==='reset')fitBoard();else zoomAt(state.zoom*(zoom.dataset.zoom==='in'?1.2:1/1.2));}
    if(nav){const items=visibleBadges(),i=items.findIndex(b=>b.id===state.selected);openStory(items[(i+(nav.dataset.storyNav==='next'?1:-1)+items.length)%items.length]?.id);}
  });
  $('#badgeYearReset').onclick=()=>{state.year=null;applyFilters();};
  $('.badge-empty button').onclick=()=>{state.category='All';state.year=null;applyFilters();};
  $('.badge-story-close').onclick=closeStory;
  story.addEventListener('close',()=>{const target=lastOpener?.inert?stage:lastOpener;target?.focus({preventScroll:true});});
  story.addEventListener('click',e=>{if(e.target===story){const r=story.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeStory();}});
  $('.badge-read-more').onclick=()=>{const expanded=$('.badge-read-more').getAttribute('aria-expanded')!=='true';$('.badge-read-more').setAttribute('aria-expanded',String(expanded));$('#badgeFullStory').hidden=!expanded;$('.badge-read-more').innerHTML=`${expanded?'A little less':'Read more about this story'} ${icon('arrow')}`;if(innerWidth>600)story.style.top=`${Math.max(78,Math.min(parseFloat(story.style.top)||78,innerHeight-story.offsetHeight-20))}px`;};

  const pointers=new Map();let gesture=null;
  function point(e){const r=stage.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
  function startPinch(){const [a,b]=[...pointers.values()];gesture={kind:'pinch',distance:Math.hypot(b.x-a.x,b.y-a.y),zoom:state.zoom};}
  stage.addEventListener('pointerdown',e=>{
    if(e.target.closest('.badge-filters,.badge-board-tools,.badge-empty')||e.button>0)return;
    pointers.set(e.pointerId,point(e));
    if(pointers.size===2){startPinch();blockClickUntil=performance.now()+400;}
    else gesture={kind:'pan',start:point(e),x:state.x,y:state.y,moved:false};
  });
  stage.addEventListener('pointermove',e=>{
    if(!pointers.has(e.pointerId))return;
    pointers.set(e.pointerId,point(e));
    if(gesture?.kind==='pinch'&&pointers.size===2){
      e.preventDefault();const [a,b]=[...pointers.values()];const distance=Math.hypot(b.x-a.x,b.y-a.y);
      zoomAt(gesture.zoom*distance/Math.max(1,gesture.distance),(a.x+b.x)/2,(a.y+b.y)/2);blockClickUntil=performance.now()+400;
    }else if(gesture?.kind==='pan'){
      const p=point(e),dx=p.x-gesture.start.x,dy=p.y-gesture.start.y;
      if(Math.hypot(dx,dy)>7||gesture.moved){gesture.moved=true;stage.setPointerCapture(e.pointerId);stage.classList.add('is-dragging');state.x=gesture.x+dx;state.y=gesture.y+dy;transform();blockClickUntil=performance.now()+400;}
    }
  });
  function endPointer(e){
    pointers.delete(e.pointerId);
    if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);
    if(pointers.size===0){gesture=null;stage.classList.remove('is-dragging');}
    else if(pointers.size===1){const p=[...pointers.values()][0];gesture={kind:'pan',start:p,x:state.x,y:state.y,moved:true};}
  }
  stage.addEventListener('pointerup',endPointer);stage.addEventListener('pointercancel',endPointer);
  stage.addEventListener('lostpointercapture',e=>{if(pointers.has(e.pointerId))endPointer(e);});
  stage.addEventListener('click',e=>{if(performance.now()<blockClickUntil&&!e.target.closest('.badge-filters,.badge-board-tools')){e.preventDefault();e.stopPropagation();}},true);
  stage.addEventListener('wheel',e=>{if(e.target.closest('.badge-filters'))return;e.preventDefault();const p=point(e);zoomAt(state.zoom*Math.exp(-e.deltaY*.0015),p.x,p.y);},{passive:false});
  stage.addEventListener('keydown',e=>{
    if(e.target!==stage)return;
    if(['+','=','-','0','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))e.preventDefault();
    if(e.key==='+'||e.key==='=')zoomAt(state.zoom*1.2);
    if(e.key==='-')zoomAt(state.zoom/1.2);
    if(e.key==='0')fitBoard();
    if(e.key==='ArrowLeft')state.x+=50;if(e.key==='ArrowRight')state.x-=50;
    if(e.key==='ArrowUp')state.y+=50;if(e.key==='ArrowDown')state.y-=50;
    transform();
  });
  stage.addEventListener('focusin',e=>{
    const b=e.target.closest('[data-badge]');if(!b||!b.matches(':focus-visible'))return;
    const item=badges.find(item=>item.id===b.dataset.badge),scale=state.fit*state.zoom;
    const r=b.querySelector(".badge-face").getBoundingClientRect(),s=stage.getBoundingClientRect();
    if(r.left<s.left+12||r.right>s.right-12||r.top<s.top||r.bottom>s.bottom-55){state.x=stage.clientWidth/2-(item.position.x+80)*scale;state.y=stage.clientHeight/2-(item.position.y+(item.position.strap+105)*.68)*scale;transform();}
  });
  new ResizeObserver(()=>{if(!root.hidden)fitBoard();}).observe(stage);
  if(innerWidth<600)$('.badge-filters').open=false;

  function showBadges(updateHash=true){
    root.hidden=false;document.querySelector('.hero').hidden=true;document.querySelector('#library').hidden=true;
    document.querySelectorAll('.top-nav button').forEach(b=>b.classList.toggle('active',b.id==='navBadges'));
    document.querySelector('#navBadges').setAttribute('aria-current','page');
    document.querySelectorAll('.side-item').forEach(b=>b.classList.toggle('active',b.id==='sideBadges'));
    document.querySelector('.skip-link').href='#badgeCollection';
    document.querySelector('#sidebar').classList.remove('open');document.querySelector('#mobileMenu').setAttribute('aria-expanded','false');
    // Keep hidden mobile navigation out of the tab order, using NOIR's existing synchronizer.
    document.dispatchEvent(new Event('noir:navigation'));
    if(updateHash){history.pushState(null,'','#badges');window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}
    if(!initialized){initialized=true;requestAnimationFrame(fitBoard);}
  }
  document.querySelector('#navBadges').onclick=()=>showBadges();
  document.querySelector('#sideBadges').onclick=()=>showBadges();
  window.addEventListener('hashchange',()=>{if(location.hash==='#badges'||!location.hash)showBadges(false);else if(location.hash==='#components')showLibraryView();});
  if(!location.hash||location.hash==='#badges')showBadges(false);else showLibraryView();
}
