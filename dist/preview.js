// Legacy grayscale values become theme tokens once, including inline styles and
// canvas/SVG color literals. The resulting CSS is included in every export.
const hexPattern = /#[\da-f]{8}\b|#[\da-f]{6}\b|#[\da-f]{4}\b|#[\da-f]{3}\b/gi;
function expandHex(value) {
  const hex=value.slice(1).toLowerCase();
  return hex.length<5 ? [...hex].map(c=>c+c).join('') : hex;
}
function lightShade(hex) {
  const channel=Number.parseInt(hex.slice(0,2),16);
  const light=channel<=64?250-Math.round(channel*.7):Math.max(17,255-channel);
  return light.toString(16).padStart(2,'0').repeat(3)+hex.slice(6);
}
export function prepareComponent(component) {
  const shades=new Set();
  const tokenize=value=>value.replace(hexPattern,color=>{
    const hex=expandHex(color);
    // Keep intentional non-neutral colors intact.
    if(hex.slice(0,2)!==hex.slice(2,4)||hex.slice(2,4)!==hex.slice(4,6))return color;
    shades.add(hex);
    return `var(--noir-${hex})`;
  });
  let css=tokenize(component.css.replace(/(?<![\w-])white(?![\w-])/gi,'#ffffff').replace(/(?<![\w-])black(?![\w-])/gi,'#000000'));
  // Body copy and labels need sufficient contrast in both palettes.
  css=css.replace(/(?<![-\w])color\s*:\s*var\(--noir-([\da-f]{6})\)(?=\s*[;}])/g,(match,hex)=>{
    const value=parseInt(hex.slice(0,2),16);
    return value>=65&&value<=190?'color:var(--muted)':match;
  });
  const html=component.html.replace(/(style|fill|stroke)=(['"])(.*?)\2/gi,(match,attribute,quote,value)=>`${attribute}=${quote}${tokenize(value)}${quote}`);
  // Match whole JS strings so quotes inside SVG/HTML strings cannot become code.
  const js=(component.js||'').replace(/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"/g,literal=>{
    const quote=literal[0],content=literal.slice(1,-1);
    return quote+content.replace(hexPattern,color=>{
      const token=tokenize(color);
      if(token===color)return color;
      return `${quote}+getComputedStyle(document.documentElement).getPropertyValue('${token.slice(4,-1)}').trim()+${quote}`;
    })+quote;
  });
  const dark=[...shades].map(hex=>`--noir-${hex}:#${hex}`).join(';');
  const light=[...shades].map(hex=>`--noir-${hex}:#${lightShade(hex)}`).join(';');
  return {...component,html,css,js,palette:{dark,light}};
}
const dark='--bg:#0a0a0a;--surface:#151515;--surface-2:#222;--text:#fafafa;--muted:#aaa;--border:#393939;--accent:#ededed;--on-accent:#111;--canvas:var(--bg);color-scheme:dark';
const light='--bg:#f8f8f8;--surface:#fff;--surface-2:#e9e9e9;--text:#171717;--muted:#595959;--border:#ccc;--accent:#202020;--on-accent:#fff;--canvas:var(--bg);color-scheme:light';
export const demoBase=`*{box-sizing:border-box}html{min-height:100%;background:var(--canvas)}body{min-height:100svh;margin:0;padding:20px;display:flex;justify-content:center;align-items:center;background:var(--canvas);color:var(--text);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}body> :where(div,section,article,main,nav,form,aside){max-width:100%;min-width:0}button,input,select,textarea{font:inherit}button{cursor:pointer;color:inherit}a{color:inherit}img,video,canvas,svg{max-width:100%}input,select,textarea{min-width:0;accent-color:var(--accent)}button:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible,a:focus-visible,[tabindex]:focus-visible{outline:2px solid var(--accent);outline-offset:3px}[hidden]{display:none!important}::selection{background:var(--accent);color:var(--on-accent)}@media(max-width:360px){body{padding:12px}}@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important}}`;
export function demoStyles(component,canvas='dark') {
  const {palette}=component;
  return `:root{${dark};${palette.dark}}\n@media(prefers-color-scheme:light){:root:not([data-theme="dark"]){${light};${palette.light}}}\n:root[data-theme="light"]{${light};${palette.light}}\n${demoBase}\n${component.css}\n${canvas==='grid'?'body{background-image:linear-gradient(color-mix(in srgb,var(--text) 7%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--text) 7%,transparent) 1px,transparent 1px);background-size:20px 20px}':''}`;
}
export function playbackScript(speed=1,paused=false) {
  return `(()=>{let speed=${speed},paused=${paused};const held=new Set();const reduce=matchMedia('(prefers-reduced-motion:reduce)');function update(){document.getAnimations().forEach(a=>{a.updatePlaybackRate(speed);if((paused||reduce.matches)&&a.playState==='running'){held.add(a);a.pause();if(reduce.matches&&Number.isFinite(a.effect.getTiming().duration))a.currentTime=a.effect.getTiming().duration}else if(!paused&&!reduce.matches&&held.has(a)){held.delete(a);a.play()}})}window.addEventListener('message',e=>{if(e.source!==parent||e.data?.type!=='noir-control')return;speed=e.data.speed;paused=e.data.paused;update()});reduce.addEventListener('change',update);update();setInterval(update,100)})();`;
}
export function componentDocument(component,{theme='dark',canvas=theme,speed=1,paused=false,controls=true}={}) {
  const script=(component.js||'')+(controls?'\n'+playbackScript(speed,paused):'');
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const reference=component.inspiration?`<!-- NOIR visual study. Reference: ${escape(component.inspiration.name)} (${escape(component.inspiration.url)}) -->\n`:'';
  const title=component.name.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  return `<!doctype html>\n<html lang="en" data-theme="${theme==='light'?'light':'dark'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — NOIR</title><style>${demoStyles(component,canvas)}</style></head><body>${reference}${component.html}${script?`<script>${script.replace(/<\/script/gi,'<\\/script')}<\/script>`:''}</body></html>`;
}
