import {test} from 'node:test';
import assert from 'node:assert/strict';
import all,{categories} from '../dist/catalog.js';
import {componentDocument,prepareComponent} from '../dist/preview.js';
test('catalog entries have unique IDs, valid categories and executable scripts',()=>{
  assert.equal(all.length,155);assert.equal(categories.length,10);
  assert.equal(new Set(all.map(c=>c.id)).size,all.length);
  for(const c of all){assert.ok(categories.some(x=>x.id===c.category),c.id);assert.ok(c.html&&c.css&&c.description,c.id);assert.doesNotThrow(()=>new Function(c.js),c.id);}
  for(const id of ['sections','templates','discovery','figures','diagrams'])assert.ok(!all.some(c=>c.category===id));
});
test('each standalone export includes two palettes, viewport and script-safe HTML',()=>{
  for(const c of all){const html=componentDocument(c,{theme:'light'});assert.match(html,/data-theme="light"/);assert.match(html,/prefers-color-scheme:light/);assert.match(html,/name="viewport"/);assert.match(html,/prefers-reduced-motion:reduce/);assert.ok(!html.includes('[object Object]'),c.id);}
});
test('theme preparation preserves data and native color input values',()=>{
  const c=prepareComponent({name:'Color',html:'<input type="color" value="#ececec"><button data-color="#ececec" style="color:#ececec">#ececec</button>',css:'p{color:#ececec}',js:''});
  assert.match(c.html,/value="#ececec"/);assert.match(c.html,/data-color="#ececec"/);assert.match(c.html,/style="color:var\(--noir-ececec\)"/);
});
