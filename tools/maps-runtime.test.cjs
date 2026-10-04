// DOM/canvas contract test in Node. This is not browser or physical-device QA.
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const {ROOT}=require('./model.cjs'),math=require('../web/map-math.js');
class Element{
 constructor(tag='div',cls=''){this.tagName=tag.toUpperCase();this.className=cls;this.children=[];this.dataset={};this.attributes={};this.events={};this.hidden=false;this.textContent='';this.value='';this.clientWidth=620;this.style={values:{},setProperty:(k,v)=>this.style.values[k]=v};this.classList={toggle:(c,on)=>{const set=new Set(this.className.split(' ').filter(Boolean));if(on)set.add(c);else set.delete(c);this.className=[...set].join(' ');}};}
 append(...nodes){for(const n of nodes){n.parent=this;this.children.push(n);}}
 replaceChildren(...nodes){this.children=[];this.append(...nodes);}
 remove(){this.parent.children=this.parent.children.filter(x=>x!==this);}
 matches(q){if(q.startsWith('.'))return this.className.split(' ').includes(q.slice(1));if(q.startsWith('['))return Object.prototype.hasOwnProperty.call(this.dataset,q.slice(6,-1).replace(/-([a-z])/g,(_,c)=>c.toUpperCase()));return this.tagName===q.toUpperCase();}
 querySelectorAll(q){const found=[];for(const c of this.children){if(q.split(',').some(q=>c.matches(q)))found.push(c);found.push(...c.querySelectorAll(q));}return found;}
 querySelector(q){return this.querySelectorAll(q)[0]||null;}
 closest(q){return q.split(',').some(q=>this.matches(q))?this:this.parent?.closest(q)||null;}
 setAttribute(k,v){this.attributes[k]=v;}
 getAttribute(k){return this.attributes[k];}
 addEventListener(k,f){(this.events[k]||=[]).push(f);}
 emit(k,p={}){const e={target:this,preventDefault(){this.prevented=true;},...p};for(const f of this.events[k]||[])f(e);if(k==='click')this.onclick?.(e);return e;}
 getBoundingClientRect(){return {left:0,top:0,width:this.clientWidth,height:this.clientWidth};}
 setPointerCapture(){}
}
function fixture(preview=false,query='',reduced=false){
 const root=new Element('div','mystery-map');root.dataset={mysteryMap:'',preview:String(preview)};
 const tabs=new Element('div','map-tabs');root.append(tabs);for(const view of ['zeme','slunecni-soustava','hluboky-vesmir']){const b=new Element('button');b.dataset.mapView=view;tabs.append(b);}
 const stage=new Element('div','map-stage'),canvas=new Element('canvas'),layer=new Element('div','map-markers'),coordinates=new Element('div','map-coordinates'),controls=new Element('div','map-controls'),loading=new Element('div','map-loading'),popup=new Element('div','map-popup');stage.append(canvas,layer,coordinates,controls,loading,popup);root.append(stage);
 for(const action of ['in','out','reset']){const b=new Element('button');b.dataset.mapAction=action;controls.append(b);}
 for(const [tag,cls] of [['div','map-results'],['p','map-count'],['p','map-note'],['input','']])root.append(new Element(tag,cls));if(preview)root.append(new Element('a','map-open'));
 let drawCount=0,lastURL='',frames=[],errors=[];const ctx=new Proxy({measureText(text){return {width:text.length*6,actualBoundingBoxAscent:8,actualBoundingBoxDescent:3};},createRadialGradient(){return {addColorStop(){}};},clearRect(){drawCount++;}},{get:(o,k)=>k in o?o[k]:()=>{}});canvas.getContext=()=>ctx;
 const document=new Element('document');document.hidden=false;document.createElement=tag=>new Element(tag);document.append(root);
 const runtime={window:{MysteryMath:math,matchMedia:()=>({matches:reduced})},document,console:{error:e=>errors.push(e)},URLSearchParams,Intl,Date,Math,devicePixelRatio:1,location:{search:query,pathname:preview?'/':'/mapa-zahad.html'},history:{replaceState:(_,__,url)=>lastURL=url},fetch:async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(ROOT,'dist',url),'utf8'))}),requestAnimationFrame:f=>{frames.push(f);return frames.length;},setInterval(){},ResizeObserver:class{constructor(cb){this.cb=cb;}observe(){this.cb();}}};
 vm.runInNewContext(fs.readFileSync(path.join(ROOT,'web/map.js'),'utf8'),runtime);
 const flush=()=>{const batch=frames;frames=[];batch.forEach(f=>f());};
 const settle=async()=>{for(let i=0;i<10;i++){await new Promise(r=>setImmediate(r));const batch=frames;frames=[];batch.forEach(f=>f());}assert.deepEqual(errors,[]);};
 return {root,stage,layer,popup,settle,flush,url:()=>lastURL,drawCount:()=>drawCount};
}
test('runtime loads maps, markers and cards; all tabs use available local datasets',async()=>{const f=fixture();await f.settle();assert.ok(f.layer.children.length>15);assert.ok(f.drawCount()>0);assert.equal(f.root.querySelector('.map-loading').hidden,true);const first=f.layer.children[0];first.emit('click');await f.settle();assert.equal(f.popup.hidden,false);assert.ok(f.popup.querySelector('a').href.startsWith('/clanky/'));assert.ok(f.url().includes('clanek='));for(const b of f.root.querySelectorAll('[data-map-view]')){b.emit('click');await f.settle();assert.ok(f.layer.children.length>0,b.dataset.mapView);assert.ok(f.root.querySelector('.map-results').children.length>0);assert.ok(f.url().includes('mapa='+b.dataset.mapView));}});
test('deep links select article and correct view, including unknown locations',async()=>{for(const [id,view] of [['tutanchamon-dyka-z-vesmiru','zeme'],['neptun-planeta-z-vypoctu','slunecni-soustava'],['beta-pictoris-b-radiovy-signal','hluboky-vesmir'],['dyson-sfery','hluboky-vesmir'],['enceladus-zivot-pod-ledem','slunecni-soustava'],['ufo-teheran-barevna-svetla-2026','zeme'],['arendsee-10500-let-drevene-konstrukce','zeme'],['noemova-archa-durupinar-vrty-2026','zeme']]){const f=fixture(false,'?clanek='+id);await f.settle();assert.ok(f.url().includes('mapa='+view));assert.equal(f.popup.hidden,false);assert.ok(f.popup.querySelector('a').href.endsWith(id+'.html'));if(id!=='dyson-sfery')assert.ok(f.layer.children.some(b=>b.getAttribute('aria-pressed')==='true'),id);}});
test('wheel, drag, two-pointer pinch, cancellation, keyboard and search execute without losing controls',async()=>{const f=fixture();await f.settle();const before=f.layer.children[0].style.left;const wheel=f.stage.emit('wheel',{deltaY:-250,clientX:160,clientY:220});assert.equal(wheel.prevented,true);await f.settle();assert.notEqual(f.layer.children[0].style.left,before);f.stage.emit('pointerdown',{pointerId:1,pointerType:'touch',clientX:150,clientY:150});f.stage.emit('pointerdown',{pointerId:2,pointerType:'touch',clientX:250,clientY:150});f.stage.emit('pointermove',{pointerId:2,clientX:350,clientY:180});f.stage.emit('pointercancel',{pointerId:2});f.stage.emit('pointermove',{pointerId:1,clientX:170,clientY:170});f.stage.emit('pointerup',{pointerId:1});f.stage.emit('keydown',{key:'+'});await f.settle();f.root.querySelectorAll('[data-map-action]').find(b=>b.dataset.mapAction==='reset').emit('click');await f.settle();const input=f.root.querySelector('input');input.value='tutanchamon';input.emit('input');assert.equal(f.root.querySelector('.map-results').children.length,2);input.value='xyznoresult';input.emit('input');assert.equal(f.root.querySelector('.map-results').children.length,1);assert.equal(f.root.querySelector('.map-results').children[0].tagName,'P');});
test('homepage preview preserves archive URL and provides full map link',async()=>{const f=fixture(true,'?tema=vesmir');await f.settle();f.layer.children[0].emit('click');await f.settle();assert.equal(f.url(),'');assert.ok(f.root.querySelector('.map-open').href.startsWith('/mapa-zahad.html?mapa=zeme&clanek='));});

test('zoom interpolates across frames, accumulates input and stops; reduced motion applies immediately',async()=>{
 const f=fixture();await f.settle();const status=()=>f.root.querySelector('.map-coordinates').textContent;
 f.stage.emit('wheel',{deltaY:-250,clientX:310,clientY:310});f.flush();assert.match(status(),/1\.1×/);
 f.stage.emit('wheel',{deltaY:-250,clientX:310,clientY:310});for(let i=0;i<70;i++)f.flush();assert.match(status(),/2\.5×/);
 const done=f.drawCount();f.flush();assert.equal(f.drawCount(),done);
 const r=fixture(false,'',true);await r.settle();r.stage.emit('wheel',{deltaY:-250,clientX:310,clientY:310});r.flush();assert.match(r.root.querySelector('.map-coordinates').textContent,/1\.6×/);const count=r.drawCount();r.flush();assert.equal(r.drawCount(),count);
});
