const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const json=p=>JSON.parse(read(p));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60);
const date=s=>{const m=String(s).match(/^(\d+)\.\s*(\d+)\.\s*(\d{4})$/);if(!m)throw Error('Neplatné datum published: '+s);return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`};
const plain=s=>String(s??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const categories=[['ufo','UFO / UAP'],['civilizace','Ztracené civilizace'],['vesmir','Věda a vesmír'],['zivot','Mimozemský život'],['technologie','Technologie'],['konspirace','Konspirace']];
const labels={overeno:'Zpráva',spekulace:'Spekulace',svedectvi:'Svědectví',franta:'Franta / Pepan · původní typ',uap:'UAP · původní typ'};
// Explicit editorial topic assignments, separate from unchanged source topic/type.
const special={civilizace:[11,12,76,78,87,88,89,90],zivot:[10,20,21,24,34,36,45,55,59,73,91],technologie:[22,33,37],konspirace:[18,19,23,54]};
function category(a,i,key){const topics=json('content/topics.json');if(categories.some(c=>c[0]===a.category))return a.category;if(categories.some(c=>c[0]===a.topic))return a.topic;if(topics[key])return topics[key];return ['uap','ufo','disclosure'].includes(a.topic)?'ufo':'vesmir'}
function extract(s,name){const i=s.indexOf('const '+name),j=s.indexOf('\n];',i);if(i<0||j<0)throw Error('Chybí pole '+name);const context={};vm.runInNewContext(s.slice(i,j+3)+';this.result='+name,context,{timeout:1000});return JSON.parse(JSON.stringify(context.result))}
function publicationStatus(a,today){
 const published=date(a.published);
 if(a.status==='draft')return 'draft';
 if(a.hidden===true||Number(published.slice(0,4))>=2099)return 'hidden';
 return published>today?'scheduled':'published';
}
function load(options={}){
 const today=options.today||new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Prague',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const s=read('index.html'),original=extract(s,'FEED'),images=extract(s,'IMAGES'),seen={},removed=[],ambiguous=[];
 const articles=original.map((item,i)=>{
  const a=structuredClone(item);let key=a.id||slug(a.title);if(seen[key])key+='-'+(++seen[key]);seen[key]=1;
  const url='/clanky/'+key+'.html';
  for(const field of ['glosy','frantaGlosa','pepanGlosa'])if(a[field]){removed.push({index:i,id:a.id??null,url,field,content:a[field]});delete a[field]}
  a.body=(a.body||[]).filter((p,j)=>{const t=p.trim();const complete=["<span class='ij f'>","<span class='ij p'>",'<span class="ij f">','<span class="ij p">'].some(prefix=>t.startsWith(prefix))&&t.endsWith('</span>')&&t.split('<span').length===2&&t.split('</span>').length===2;if(complete){removed.push({index:i,id:a.id??null,url,field:'body',paragraph:j,content:p});return false}if(t.includes('ij ')||t.includes('spk '))ambiguous.push({index:i,id:a.id??null,url,paragraph:j,reason:'Dialog nebo nejednoznačný HTML blok zachován beze změny',content:p});return true});
  const image=a.image||images[i]?.f||null;
  if(a.kind==='franta')ambiguous.push({index:i,id:a.id,url,reason:'Celý článek je dialog. Zachován pro rozhodnutí, aby se neztratil věcný obsah.'});
  return {...a,_index:i,_slug:key,_url:url,_date:date(a.published),_category:category(a,i,key),_image:image,_type:labels[a.tag]||a.tag,_legacy:a.kind==='franta',status:publicationStatus(a,today)};
 });
 for(const [i,a] of json('content/articles-extra.json').entries()){
  for(const field of ['id','title','published','body','sources','tag','category','status'])if(a[field]==null||a[field]==='')throw Error(`Nový článek ${i}: chybí pole ${field}`);
  if(!Array.isArray(a.body)||!a.body.length||!Array.isArray(a.sources))throw Error(`Nový článek ${a.id}: body a sources musí být pole`);
  if(!['draft','published'].includes(a.status))throw Error('Neplatný status '+a.id);
  if(!categories.some(c=>c[0]===a.category)||!labels[a.tag])throw Error('Neplatná kategorie nebo tag '+a.id);
  if(articles.some(x=>x._slug===a.id))throw Error('Duplicitní ID/URL '+a.id);
  if(!/^[a-z0-9-]+$/.test(a.id))throw Error('Neplatné ID '+a.id);
  articles.push({...a,status:publicationStatus(a,today),_index:original.length+i,_slug:a.id,_url:'/clanky/'+a.id+'.html',_date:date(a.published),_category:a.category,_image:a.image||null,_type:labels[a.tag]});
 }
 return {original,articles,removed,ambiguous};
}
module.exports={ROOT,read,json,esc,slug,date,plain,categories,labels,load,publicationStatus};
